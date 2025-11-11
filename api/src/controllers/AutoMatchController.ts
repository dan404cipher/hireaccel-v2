import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, UserRole } from '@/types';
import {
    asyncHandler,
    createNotFoundError,
    createBadRequestError,
    createForbiddenError,
} from '@/middleware/errorHandler';
import { AgentAssignment } from '@/models/AgentAssignment';
import { Job } from '@/models/Job';
import { Candidate } from '@/models/Candidate';
import AIMatchingService, { MatchResult } from '@/services/AIMatchingService';
import mongoose from 'mongoose';

/**
 * Auto Match Controller
 * Handles AI-powered candidate-to-job matching
 */

const matchJobSchema = z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID'),
    limit: z.number().min(1).max(50).optional().default(10),
});

const matchCandidateSchema = z.object({
    candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID'),
    limit: z.number().min(1).max(50).optional().default(10),
});

export class AutoMatchController {
    /**
     * Match candidates to a specific job using AI
     * @route POST /auto-match/match-job
     */
    static matchJobToCandidates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        // Only agents, admins, and superadmins can access this
        if (![UserRole.AGENT, UserRole.ADMIN, UserRole.SUPERADMIN].includes(req.user!.role)) {
            throw createForbiddenError('Only agents, admins, and superadmins can access this endpoint');
        }

        const validatedData = matchJobSchema.parse(req.body);
        const { jobId, limit } = validatedData;

        // Get the job
        const job = await Job.findById(jobId)
            .populate('companyId', 'name industry')
            .populate('createdBy', 'firstName lastName email');

        if (!job) {
            throw createNotFoundError('Job not found');
        }

        // Get candidates based on user role
        let candidates: any[] = [];

        if (req.user!.role === UserRole.AGENT) {
            // For agents, only match candidates assigned to them
            const assignedCandidateIds = await AgentAssignment.getCandidatesForAgent(req.user!._id);
            
            if (assignedCandidateIds.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        job: {
                            _id: job._id,
                            title: job.title,
                            companyId: job.companyId,
                            location: job.location,
                        },
                        matches: [],
                        message: 'No candidates assigned to you',
                    },
                });
            }

            candidates = await Candidate.find({
                _id: { $in: assignedCandidateIds },
                status: 'active',
            })
                .populate('userId', 'firstName lastName email customId')
                .limit(limit * 2); // Get more candidates to filter from
        } else {
            // For admins and superadmins, match all active candidates
            candidates = await Candidate.find({ status: 'active' })
                .populate('userId', 'firstName lastName email customId')
                .limit(limit * 2);
        }

        if (candidates.length === 0) {
            return res.json({
                success: true,
                data: {
                    job: {
                        _id: job._id,
                        title: job.title,
                        companyId: job.companyId,
                        location: job.location,
                    },
                    matches: [],
                    message: 'No candidates available for matching',
                },
            });
        }

        // Perform AI matching
        const matches = await AIMatchingService.matchCandidatesToJob(job, candidates);

        // Limit results
        const limitedMatches = matches.slice(0, limit);

        // Enrich matches with candidate and job details
        const enrichedMatches = limitedMatches.map((match) => {
            const candidate = candidates.find(
                (c) => c._id.toString() === match.candidateId
            );
            
            return {
                ...match,
                candidate: candidate ? {
                    _id: candidate._id,
                    userId: candidate.userId,
                    profile: {
                        skills: candidate.profile?.skills || [],
                        summary: candidate.profile?.summary || '',
                        location: candidate.profile?.location || '',
                        experience: candidate.profile?.experience || [],
                    },
                } : null,
                job: {
                    _id: job._id,
                    title: job.title,
                    companyId: job.companyId,
                    location: job.location,
                },
            };
        });

        res.json({
            success: true,
            data: {
                job: {
                    _id: job._id,
                    title: job.title,
                    description: job.description,
                    companyId: job.companyId,
                    location: job.location,
                    requirements: job.requirements,
                    salaryRange: job.salaryRange,
                },
                matches: enrichedMatches,
                totalMatches: matches.length,
                shownMatches: enrichedMatches.length,
            },
        });
    });

    /**
     * Match a candidate to multiple jobs using AI
     * @route POST /auto-match/match-candidate
     */
    static matchCandidateToJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        // Only agents, admins, and superadmins can access this
        if (![UserRole.AGENT, UserRole.ADMIN, UserRole.SUPERADMIN].includes(req.user!.role)) {
            throw createForbiddenError('Only agents, admins, and superadmins can access this endpoint');
        }

        const validatedData = matchCandidateSchema.parse(req.body);
        const { candidateId, limit } = validatedData;

        // Get the candidate
        const candidate = await Candidate.findById(candidateId)
            .populate('userId', 'firstName lastName email customId');

        if (!candidate) {
            throw createNotFoundError('Candidate not found');
        }

        // Get jobs based on user role
        let jobs: any[] = [];

        if (req.user!.role === UserRole.AGENT) {
            // For agents, only match jobs from assigned HRs
            const assignedHRIds = await AgentAssignment.getHRsForAgent(req.user!._id);
            
            if (assignedHRIds.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        candidate: {
                            _id: candidate._id,
                            userId: candidate.userId,
                            profile: candidate.profile,
                        },
                        matches: [],
                        message: 'No HR users assigned to you',
                    },
                });
            }

            jobs = await Job.find({
                createdBy: { $in: assignedHRIds },
                status: { $in: ['open', 'active'] },
            })
                .populate('companyId', 'name industry')
                .populate('createdBy', 'firstName lastName email')
                .limit(limit * 2);
        } else {
            // For admins and superadmins, match all active jobs
            jobs = await Job.find({
                status: { $in: ['open', 'active'] },
            })
                .populate('companyId', 'name industry')
                .populate('createdBy', 'firstName lastName email')
                .limit(limit * 2);
        }

        if (jobs.length === 0) {
            return res.json({
                success: true,
                data: {
                    candidate: {
                        _id: candidate._id,
                        userId: candidate.userId,
                        profile: candidate.profile,
                    },
                    matches: [],
                    message: 'No jobs available for matching',
                },
            });
        }

        // Perform AI matching
        const matches = await AIMatchingService.matchCandidateToJobs(candidate, jobs);

        // Limit results
        const limitedMatches = matches.slice(0, limit);

        // Enrich matches with candidate and job details
        const enrichedMatches = limitedMatches.map((match) => {
            const job = jobs.find((j) => j._id.toString() === match.jobId);
            
            return {
                ...match,
                candidate: {
                    _id: candidate._id,
                    userId: candidate.userId,
                    profile: {
                        skills: candidate.profile?.skills || [],
                        summary: candidate.profile?.summary || '',
                        location: candidate.profile?.location || '',
                    },
                },
                job: job ? {
                    _id: job._id,
                    title: job.title,
                    description: job.description,
                    companyId: job.companyId,
                    location: job.location,
                    requirements: job.requirements,
                    salaryRange: job.salaryRange,
                    createdBy: job.createdBy,
                } : null,
            };
        });

        res.json({
            success: true,
            data: {
                candidate: {
                    _id: candidate._id,
                    userId: candidate.userId,
                    profile: candidate.profile,
                },
                matches: enrichedMatches,
                totalMatches: matches.length,
                shownMatches: enrichedMatches.length,
            },
        });
    });

    /**
     * Batch match: Match multiple candidates to a job or multiple jobs to a candidate
     * @route POST /auto-match/batch-match
     */
    static batchMatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        // Only agents, admins, and superadmins can access this
        if (![UserRole.AGENT, UserRole.ADMIN, UserRole.SUPERADMIN].includes(req.user!.role)) {
            throw createForbiddenError('Only agents, admins, and superadmins can access this endpoint');
        }

        const schema = z.object({
            jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID').optional(),
            candidateIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid candidate ID')).optional(),
            limit: z.number().min(1).max(50).optional().default(10),
        });

        const validatedData = schema.parse(req.body);
        const { jobId, candidateIds, limit } = validatedData;

        // Must provide either jobId or candidateIds
        if (!jobId && !candidateIds) {
            throw createBadRequestError('Either jobId or candidateIds must be provided');
        }

        if (jobId && candidateIds) {
            throw createBadRequestError('Provide either jobId or candidateIds, not both');
        }

        if (jobId) {
            // Match candidates to a job
            const job = await Job.findById(jobId)
                .populate('companyId', 'name industry')
                .populate('createdBy', 'firstName lastName email');

            if (!job) {
                throw createNotFoundError('Job not found');
            }

            // Get candidates based on user role
            let candidates: any[] = [];

            if (req.user!.role === UserRole.AGENT) {
                const assignedCandidateIds = await AgentAssignment.getCandidatesForAgent(req.user!._id);
                candidates = await Candidate.find({
                    _id: { $in: assignedCandidateIds },
                    status: 'active',
                })
                    .populate('userId', 'firstName lastName email customId')
                    .limit(limit * 2);
            } else {
                candidates = await Candidate.find({ status: 'active' })
                    .populate('userId', 'firstName lastName email customId')
                    .limit(limit * 2);
            }

            if (candidates.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        job: {
                            _id: job._id,
                            title: job.title,
                            companyId: job.companyId,
                            location: job.location,
                        },
                        matches: [],
                        message: 'No candidates available for matching',
                    },
                });
            }

            const matches = await AIMatchingService.matchCandidatesToJob(job, candidates);
            const limitedMatches = matches.slice(0, limit);

            const enrichedMatches = limitedMatches.map((match) => {
                const candidate = candidates.find(
                    (c) => c._id.toString() === match.candidateId
                );
                
                return {
                    ...match,
                    candidate: candidate ? {
                        _id: candidate._id,
                        userId: candidate.userId,
                        profile: candidate.profile,
                    } : null,
                    job: {
                        _id: job._id,
                        title: job.title,
                        companyId: job.companyId,
                        location: job.location,
                    },
                };
            });

            return res.json({
                success: true,
                data: {
                    job: {
                        _id: job._id,
                        title: job.title,
                        description: job.description,
                        companyId: job.companyId,
                        location: job.location,
                    },
                    matches: enrichedMatches,
                    totalMatches: matches.length,
                    shownMatches: enrichedMatches.length,
                },
            });
        } else if (candidateIds) {
            // Match jobs to candidates
            const candidates = await Candidate.find({
                _id: { $in: candidateIds },
                status: 'active',
            })
                .populate('userId', 'firstName lastName email customId');

            if (candidates.length === 0) {
                throw createNotFoundError('No valid candidates found');
            }

            // Get jobs based on user role
            let jobs: any[] = [];

            if (req.user!.role === UserRole.AGENT) {
                const assignedHRIds = await AgentAssignment.getHRsForAgent(req.user!._id);
                jobs = await Job.find({
                    createdBy: { $in: assignedHRIds },
                    status: { $in: ['open', 'active'] },
                })
                    .populate('companyId', 'name industry')
                    .populate('createdBy', 'firstName lastName email')
                    .limit(limit * 2);
            } else {
                jobs = await Job.find({
                    status: { $in: ['open', 'active'] },
                })
                    .populate('companyId', 'name industry')
                    .populate('createdBy', 'firstName lastName email')
                    .limit(limit * 2);
            }

            if (jobs.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        candidates: candidates.map(c => ({
                            _id: c._id,
                            userId: c.userId,
                            profile: c.profile,
                        })),
                        matches: [],
                        message: 'No jobs available for matching',
                    },
                });
            }

            // Match each candidate to jobs
            const allMatches: MatchResult[] = [];
            
            for (const candidate of candidates) {
                const matches = await AIMatchingService.matchCandidateToJobs(candidate, jobs);
                allMatches.push(...matches);
            }

            // Group by candidate and sort by score
            const groupedMatches = allMatches.reduce((acc, match) => {
                if (!acc[match.candidateId]) {
                    acc[match.candidateId] = [];
                }
                acc[match.candidateId].push(match);
                return acc;
            }, {} as Record<string, MatchResult[]>);

            // Sort matches for each candidate and limit
            const enrichedMatches = Object.entries(groupedMatches).map(([candidateId, matches]) => {
                const candidate = candidates.find(c => c._id.toString() === candidateId);
                const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
                
                return {
                    candidate: candidate ? {
                        _id: candidate._id,
                        userId: candidate.userId,
                        profile: candidate.profile,
                    } : null,
                    matches: sortedMatches.map(match => {
                        const job = jobs.find(j => j._id.toString() === match.jobId);
                        return {
                            ...match,
                            job: job ? {
                                _id: job._id,
                                title: job.title,
                                companyId: job.companyId,
                                location: job.location,
                            } : null,
                        };
                    }),
                };
            });

            return res.json({
                success: true,
                data: {
                    candidates: candidates.map(c => ({
                        _id: c._id,
                        userId: c.userId,
                        profile: c.profile,
                    })),
                    matches: enrichedMatches,
                    totalMatches: allMatches.length,
                },
            });
        }
    });
}

