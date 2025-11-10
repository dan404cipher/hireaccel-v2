import { Response } from 'express';
import { z } from 'zod';
import { Job } from '@/models/Job';
import { Candidate } from '@/models/Candidate';
import { Company } from '@/models/Company';
import { User } from '@/models/User';
import { AuthenticatedRequest, UserRole, JobStatus } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';

const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.string().transform(Number).default('10'),
  types: z.union([
    z.array(z.enum(['jobs', 'candidates', 'companies', 'users'])),
    z.enum(['jobs', 'candidates', 'companies', 'users']).transform(val => [val]),
    z.string().transform(val => val.split(',').map(t => t.trim()) as any),
  ]).optional().default(['jobs', 'candidates', 'companies', 'users']),
});

export class SearchController {
  /**
   * Global search across jobs, candidates, companies, and users
   * GET /api/v1/search
   */
  static globalSearch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    console.log('=== GLOBAL SEARCH REQUEST ===');
    console.log('Raw query params:', req.query);
    console.log('Query types value:', req.query.types, 'Type:', typeof req.query.types, 'Is Array:', Array.isArray(req.query.types));
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role, email: req.user.email } : 'No user');
    
    // Normalize types parameter
    // Check if Express parsed it as an array, or if we need to parse it from the raw query string
    let types: string[] = ['jobs', 'candidates', 'companies', 'users'];
    
    if (req.query.types) {
      if (Array.isArray(req.query.types)) {
        // Express already parsed it as an array (good!)
        types = req.query.types as string[];
      } else if (typeof req.query.types === 'string') {
        // Express only kept the last value (hpp might have stripped others)
        // Try to get all values from the raw URL
        const url = req.url || '';
        const typesMatches = url.match(/types=([^&]+)/g);
        if (typesMatches && typesMatches.length > 1) {
          // Multiple types in URL, extract all
          types = typesMatches.map(match => match.split('=')[1]);
        } else {
          // Single value or comma-separated
          types = req.query.types.includes(',') 
            ? req.query.types.split(',').map(t => t.trim())
            : [req.query.types];
        }
      }
    }
    
    // Validate types are valid enum values
    const validTypes = ['jobs', 'candidates', 'companies', 'users'];
    types = types.filter(t => validTypes.includes(t));
    
    if (types.length === 0) {
      types = ['jobs', 'candidates', 'companies', 'users'];
    }
    
    console.log('Normalized types:', types);
    
    const { q, limit } = searchSchema.pick({ q: true, limit: true }).parse(req.query);
    const searchTerm = q.trim();
    
    console.log('Search term:', searchTerm, 'Limit:', limit);
    
    if (!searchTerm || searchTerm.length < 2) {
      return res.json({
        success: true,
        data: {
          jobs: [],
          candidates: [],
          companies: [],
          users: [],
        },
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const results: any = {
      jobs: [],
      candidates: [],
      companies: [],
      users: [],
    };

    const userRole = req.user.role;

    // Search Jobs - All roles can search jobs with appropriate filtering
    if (types.includes('jobs')) {
      let shouldSearch = true;
      const baseQuery: any = {
        deleted: { $ne: true },
      };

      // Role-based filtering for jobs - use string comparison for consistency
      if (userRole === 'superadmin') {
        // Super admin can see ALL jobs including cancelled ones - no status filter
        // Only exclude deleted jobs
      } else if (userRole === 'admin') {
        // Regular admins can see all active jobs (excluding cancelled)
        baseQuery.status = { $in: [JobStatus.OPEN, JobStatus.ASSIGNED, JobStatus.INTERVIEW, JobStatus.CLOSED] };
      } else if (userRole === 'hr') {
        // HR can see their own jobs
        baseQuery.createdBy = req.user._id;
        baseQuery.status = { $in: [JobStatus.OPEN, JobStatus.ASSIGNED, JobStatus.INTERVIEW, JobStatus.CLOSED] };
      } else if (userRole === 'agent') {
        // Agents can see jobs from assigned HRs
        const { AgentAssignment } = await import('@/models/AgentAssignment');
        const agentAssignment = await AgentAssignment.findOne({
          agentId: req.user._id,
          status: 'active',
        });
        
        if (agentAssignment?.assignedHRs?.length) {
          const hrIds = agentAssignment.assignedHRs;
          baseQuery.createdBy = { $in: hrIds };
          baseQuery.status = { $in: [JobStatus.OPEN, JobStatus.ASSIGNED, JobStatus.INTERVIEW] };
        } else {
          // No HRs assigned, skip search
          shouldSearch = false;
          results.jobs = [];
        }
      } else if (userRole === 'candidate') {
        // Candidates can see open jobs to apply to
        baseQuery.status = { $in: [JobStatus.OPEN, JobStatus.ASSIGNED] };
      } else {
        // Default: only open jobs
        baseQuery.status = { $in: [JobStatus.OPEN, JobStatus.ASSIGNED] };
      }

      // Only proceed with search if conditions are met
      if (shouldSearch) {
        // Check if search term looks like an ID (starts with letters followed by numbers)
        // This check should happen before escaping, using the original searchTerm
        const idPattern = /^([A-Z]+)(\d+)$/i;
        const idMatch = searchTerm.trim().match(idPattern);
        
        // Escape special regex characters in search term for text searches
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Text search - build $or conditions for flexible searching
        const searchConditions: any[] = [
          { title: { $regex: escapedSearchTerm, $options: 'i' } },
          { description: { $regex: escapedSearchTerm, $options: 'i' } },
          { location: { $regex: escapedSearchTerm, $options: 'i' } },
        ];

        // For array fields like skills, use $elemMatch or $in for better matching
        // Regex on array elements - MongoDB will match if any element matches
        searchConditions.push({ 'requirements.skills': { $regex: escapedSearchTerm, $options: 'i' } });

        // Search in jobId field - handle both exact match and formatted versions
        if (idMatch) {
          // If search term matches ID pattern (e.g., "JOB1", "JOB001"), search for variations
          const [, prefix, number] = idMatch;
          const prefixUpper = prefix.toUpperCase();
          
          // Escape the prefix for regex (though it should only contain letters)
          const escapedPrefix = prefixUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // Match jobId with optional leading zeros (e.g., JOB1 matches JOB0001, JOB1, etc.)
          // Pattern: ^JOB0*1$ matches JOB1, JOB01, JOB001, JOB0001, etc.
          searchConditions.push({ jobId: { $regex: `^${escapedPrefix}0*${number}$`, $options: 'i' } });
        } else {
          // General regex search for jobId (for partial matches)
        searchConditions.push({ jobId: { $regex: escapedSearchTerm, $options: 'i' } });
        }

        // Build final query: base filters AND (any of the search conditions)
        const jobQuery: any = {
          ...baseQuery,
          $or: searchConditions,
        };

        // Debug logging
        console.log('=== JOB SEARCH DEBUG ===');
        console.log('User role:', userRole);
        console.log('Base query (role filters):', JSON.stringify(baseQuery, null, 2));
        console.log('Search term:', searchTerm, 'Escaped:', escapedSearchTerm);
        console.log('Search conditions:', searchConditions);
        console.log('Final job query:', JSON.stringify(jobQuery, null, 2));

        try {
          // First, let's check how many jobs match without the search term
          const totalJobsCount = await Job.countDocuments(baseQuery);
          console.log('Total jobs matching role filters:', totalJobsCount);
          
          // Also check if there's a job with "devops" in the title (case-insensitive)
          const devopsJobs = await Job.find({
            ...baseQuery,
            title: { $regex: /devops/i },
          }).select('title status createdBy').limit(5).lean();
          console.log('Jobs with "devops" in title (matching role filters):', devopsJobs.length);
          if (devopsJobs.length > 0) {
            console.log('DevOps job details:', devopsJobs.map((j: any) => ({
              title: j.title,
              status: j.status,
              createdBy: j.createdBy,
            })));
          }

          const foundJobs = await Job.find(jobQuery)
            .populate('companyId', 'name industry logoFileId logoUrl')
            .select('title location type salaryRange urgency postedAt companyId jobId _id status')
            .sort({ urgency: -1, postedAt: -1 })
            .limit(limit)
            .lean();

          console.log(`=== JOB SEARCH RESULTS ===`);
          console.log(`Found ${foundJobs.length} jobs for search term: "${searchTerm}"`);
          if (foundJobs.length > 0) {
            console.log('Job titles found:', foundJobs.map((j: any) => ({
              title: j.title,
              status: j.status,
              id: j._id,
            })));
          } else {
            console.log('No jobs found. Checking why...');
            // Check if there are any jobs at all
            const allJobsCount = await Job.countDocuments({ deleted: { $ne: true } });
            console.log(`Total non-deleted jobs in DB: ${allJobsCount}`);
            
            // Check jobs matching base query
            const baseQueryJobs = await Job.find(baseQuery).select('title status').limit(5).lean();
            console.log(`Jobs matching base query (role filters): ${baseQueryJobs.length}`);
            if (baseQueryJobs.length > 0) {
              console.log('Sample jobs matching role filters:', baseQueryJobs.map((j: any) => ({
                title: j.title,
                status: j.status,
              })));
            }
          }

          // Transform the results to match expected format
          results.jobs = foundJobs.map((job: any) => ({
            _id: job._id,
            id: job._id,
            jobId: job.jobId,
            title: job.title,
            location: job.location,
            type: job.type,
            salaryRange: job.salaryRange,
            urgency: job.urgency,
            postedAt: job.postedAt,
            companyId: job.companyId,
            company: job.companyId?.name || 'Unknown Company',
            companyLogoFileId: job.companyId?.logoFileId || null,
            companyLogoUrl: job.companyId?.logoUrl || null,
            status: job.status, // Include status for debugging
          }));
        } catch (error) {
          console.error('Error searching jobs:', error);
          results.jobs = [];
        }
      }
    }

    // Search Candidates - Admin, HR, and Agent can search candidates
    if (types.includes('candidates') && ['admin', 'superadmin', 'hr', 'agent'].includes(userRole || '')) {
      // Build customId search conditions with ID pattern matching
      const idPattern = /^([A-Z]+)(\d+)$/i;
      const idMatch = searchTerm.trim().match(idPattern);
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const userSearchConditions: any[] = [
        { firstName: { $regex: escapedSearchTerm, $options: 'i' } },
        { lastName: { $regex: escapedSearchTerm, $options: 'i' } },
        { email: { $regex: escapedSearchTerm, $options: 'i' } },
      ];
      
      // Handle customId search with ID pattern matching
      if (idMatch) {
        const [, prefix, number] = idMatch;
        const prefixUpper = prefix.toUpperCase();
        const escapedPrefix = prefixUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        userSearchConditions.push({ customId: { $regex: `^${escapedPrefix}0*${number}$`, $options: 'i' } });
      } else {
        userSearchConditions.push({ customId: { $regex: escapedSearchTerm, $options: 'i' } });
      }
      
      // Get all candidate users first, then filter by full name in memory
      const allCandidateUsers = await User.find({
        role: UserRole.CANDIDATE,
      }).select('_id firstName lastName email customId').lean();
      
      // Filter users that match the search term (including full name search)
      const searchLower = searchTerm.toLowerCase().trim();
      const matchingUsers = allCandidateUsers.filter((user: any) => {
        const firstName = (user.firstName || '').toLowerCase();
        const lastName = (user.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const email = (user.email || '').toLowerCase();
        const customId = (user.customId || '').toLowerCase();
        
        // Check if search matches firstName, lastName, full name, email, or customId
        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          customId.includes(searchLower)
        );
      });

      const matchingUserIds = matchingUsers.map((u: any) => u._id);

      let candidateQuery: any = {
        status: 'active',
      };

      // Role-specific filtering: only candidates assigned to them
      let candidateFilter: any = null;
      let shouldSearchCandidates = true;
      
      if (userRole === 'agent') {
        const { AgentAssignment } = await import('@/models/AgentAssignment');
        const agentAssignment = await AgentAssignment.findOne({
          agentId: req.user._id,
          status: 'active',
        });
        
        if (agentAssignment?.assignedCandidates?.length) {
          candidateFilter = { _id: { $in: agentAssignment.assignedCandidates } };
        } else {
          // No candidates assigned, return empty
          shouldSearchCandidates = false;
          results.candidates = [];
        }
      } else if (userRole === 'hr') {
        // HR can only search candidates assigned to them
        const { CandidateAssignment } = await import('@/models/CandidateAssignment');
        const assignments = await CandidateAssignment.find({
          assignedTo: req.user._id,
        }).distinct('candidateId');
        
        if (assignments?.length) {
          candidateFilter = { _id: { $in: assignments } };
        } else {
          // No candidates assigned, return empty
          shouldSearchCandidates = false;
          results.candidates = [];
        }
      }

      if (shouldSearchCandidates) {
        // Text search - include user name/email search
        const searchConditions: any[] = [
          { 'profile.summary': { $regex: escapedSearchTerm, $options: 'i' } },
          { 'profile.skills': { $regex: escapedSearchTerm, $options: 'i' } },
          { 'profile.location': { $regex: escapedSearchTerm, $options: 'i' } },
          { 'profile.experience.position': { $regex: escapedSearchTerm, $options: 'i' } },
          { 'profile.experience.company': { $regex: escapedSearchTerm, $options: 'i' } },
        ];

        // If we found matching users, also search by userId
        if (matchingUserIds.length > 0) {
          searchConditions.push({ userId: { $in: matchingUserIds } });
        }

        candidateQuery.$or = searchConditions;

        // If role filter exists (agent or HR), combine with $and
        if (candidateFilter) {
          candidateQuery = {
            $and: [
              candidateFilter,
              candidateQuery
            ]
          };
        }

        const candidates = await Candidate.find(candidateQuery)
          .populate('userId', 'firstName lastName email customId _id profilePhotoFileId')
          .select('profile.skills profile.location profile.summary profile.experience userId')
          .limit(limit)
          .lean();

        results.candidates = candidates.map((candidate: any) => ({
          _id: candidate._id,
          userId: candidate.userId ? {
            _id: candidate.userId._id,
            id: candidate.userId._id,
            customId: candidate.userId.customId,
            firstName: candidate.userId.firstName,
            lastName: candidate.userId.lastName,
            email: candidate.userId.email,
            profilePhotoFileId: candidate.userId.profilePhotoFileId,
          } : null,
          name: candidate.userId ? `${candidate.userId.firstName} ${candidate.userId.lastName}` : 'Unknown',
          skills: candidate.profile?.skills || [],
          location: candidate.profile?.location || '',
          summary: candidate.profile?.summary || '',
        }));
      }
    }

    // Search Companies
    if (types.includes('companies')) {
      const companyQuery: any = {
        deleted: { $ne: true },
      };

      // Build company search conditions with ID pattern matching
      const idPattern = /^([A-Z]+)(\d+)$/i;
      const idMatch = searchTerm.trim().match(idPattern);
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const buildCompanySearchConditions = () => {
        const conditions: any[] = [
          { name: { $regex: escapedSearchTerm, $options: 'i' } },
          { industry: { $regex: escapedSearchTerm, $options: 'i' } },
          { description: { $regex: escapedSearchTerm, $options: 'i' } },
          { location: { $regex: escapedSearchTerm, $options: 'i' } },
        ];
        
        // Handle companyId search with ID pattern matching
        if (idMatch) {
          const [, prefix, number] = idMatch;
          const prefixUpper = prefix.toUpperCase();
          const escapedPrefix = prefixUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          conditions.push({ companyId: { $regex: `^${escapedPrefix}0*${number}$`, $options: 'i' } });
        } else {
          conditions.push({ companyId: { $regex: escapedSearchTerm, $options: 'i' } });
        }
        
        return conditions;
      };

      if (userRole === 'admin' || userRole === 'superadmin') {
        // Admins can see all companies
        companyQuery.$or = buildCompanySearchConditions();
      } else if (userRole === 'hr') {
        // HR can see companies they created or posted jobs for
        const jobCompanyIds = await Job.find({
          createdBy: req.user._id,
        }).distinct('companyId');
        
        const createdCompanyIds = await Company.find({
          createdBy: req.user._id,
        }).distinct('_id');
        
        const allAccessibleCompanyIds = [...new Set([...jobCompanyIds, ...createdCompanyIds])];
        
        if (allAccessibleCompanyIds.length > 0) {
          companyQuery._id = { $in: allAccessibleCompanyIds };
          companyQuery.$or = buildCompanySearchConditions();
        } else {
          results.companies = [];
          companyQuery.$or = null; // Prevent query execution
        }
      } else if (userRole === 'agent') {
        // Agents can see companies from jobs they have access to
        const { AgentAssignment } = await import('@/models/AgentAssignment');
        const agentAssignment = await AgentAssignment.findOne({
          agentId: req.user._id,
          status: 'active',
        });
        
        if (agentAssignment?.assignedHRs?.length) {
          const hrIds = agentAssignment.assignedHRs;
          const jobCompanyIds = await Job.find({
            createdBy: { $in: hrIds },
          }).distinct('companyId');
          
          if (jobCompanyIds.length > 0) {
            companyQuery._id = { $in: jobCompanyIds };
            companyQuery.$or = buildCompanySearchConditions();
          } else {
            results.companies = [];
            companyQuery.$or = null;
          }
        } else {
          results.companies = [];
          companyQuery.$or = null;
        }
      } else if (userRole === 'candidate') {
        // Candidates can see companies from jobs they can apply to
        const openJobCompanyIds = await Job.find({
          status: { $in: [JobStatus.OPEN, JobStatus.ASSIGNED] },
        }).distinct('companyId');
        
        if (openJobCompanyIds.length > 0) {
          companyQuery._id = { $in: openJobCompanyIds };
          companyQuery.$or = buildCompanySearchConditions();
        } else {
          results.companies = [];
          companyQuery.$or = null;
        }
      } else {
        // Default: all companies
        companyQuery.$or = buildCompanySearchConditions();
      }

      if (companyQuery.$or) {
        const foundCompanies = await Company.find(companyQuery)
          .select('name industry description location companyId rating logoUrl logoFileId _id')
          .sort({ rating: -1, totalHires: -1 })
          .limit(limit)
          .lean();

        results.companies = foundCompanies.map((company: any) => ({
          _id: company._id,
          id: company._id,
          companyId: company.companyId,
          name: company.name,
          industry: company.industry,
          description: company.description,
          location: company.location,
          rating: company.rating,
          logoUrl: company.logoUrl,
          logoFileId: company.logoFileId,
        }));
      }
    }

    // Search Users / HRs
    if (types.includes('users') && (['admin', 'superadmin'].includes(userRole || '') || userRole === 'candidate' || userRole === 'agent')) {
      if (['admin', 'superadmin'].includes(userRole || '')) {
        // Get all users first, then filter by full name in memory
        const allUsers = await User.find({})
          .select('firstName lastName email role customId status profilePhotoFileId')
          .lean();
        
        // Filter users that match the search term (including full name search)
        const searchLower = searchTerm.toLowerCase().trim();
        const matchingUsers = allUsers.filter((user: any) => {
          const firstName = (user.firstName || '').toLowerCase();
          const lastName = (user.lastName || '').toLowerCase();
          const fullName = `${firstName} ${lastName}`.trim();
          const email = (user.email || '').toLowerCase();
          const customId = (user.customId || '').toLowerCase();
          
          // Check if search matches firstName, lastName, full name, email, or customId
          return (
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            customId.includes(searchLower)
          );
        });

        results.users = matchingUsers
          .sort((a: any, b: any) => {
            // Sort by creation date (most recent first)
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          })
          .slice(0, limit);
      } else if (userRole === 'agent') {
        // For agents, search only their assigned HR users
        try {
          const { AgentAssignment } = await import('@/models/AgentAssignment');
          const agentAssignment = await AgentAssignment.findOne({
            agentId: req.user._id,
            status: 'active',
          });
          
          if (!agentAssignment?.assignedHRs?.length) {
            results.users = [];
          } else {
            // Get the assigned HR users and populate their details
            const assignedHRIds = agentAssignment.assignedHRs;
            
            // Fetch all assigned HRs first
            const allAssignedHRs = await User.find({
              _id: { $in: assignedHRIds },
            })
              .select('firstName lastName email role customId status profilePhotoFileId')
              .lean();
            
            // Filter HRs that match the search term (including full name search)
            const searchLower = searchTerm.toLowerCase().trim();
            const matchingHRs = allAssignedHRs.filter((hr: any) => {
              const firstName = (hr.firstName || '').toLowerCase();
              const lastName = (hr.lastName || '').toLowerCase();
              const fullName = `${firstName} ${lastName}`.trim();
              const email = (hr.email || '').toLowerCase();
              const customId = (hr.customId || '').toLowerCase();
              
              // Check if search matches firstName, lastName, full name, email, or customId
              return (
                firstName.includes(searchLower) ||
                lastName.includes(searchLower) ||
                fullName.includes(searchLower) ||
                email.includes(searchLower) ||
                customId.includes(searchLower)
              );
            });
            
            results.users = matchingHRs.slice(0, limit).map((hr: any) => ({
              _id: hr._id,
              id: hr._id,
              firstName: hr.firstName,
              lastName: hr.lastName,
              email: hr.email,
              role: hr.role || 'hr',
              customId: hr.customId,
              profilePhotoFileId: hr.profilePhotoFileId || null,
              status: hr.status,
            }));
          }
        } catch (error) {
          console.error('Error searching HRs for agent:', error);
          results.users = [];
        }
      } else if (userRole === 'candidate') {
        try {
          const candidateDoc = await Candidate.findOne({ userId: req.user!._id }).select('_id').lean();

          if (!candidateDoc) {
            results.users = [];
          } else {
            const { CandidateAssignment } = await import('@/models/CandidateAssignment');
            const assignments = await CandidateAssignment.find({
              candidateId: candidateDoc._id,
            })
              .populate('assignedTo', 'firstName lastName email role customId profilePhotoFileId status')
              .select('assignedTo')
              .lean();

            const hrMap = new Map<string, any>();

            assignments.forEach((assignment: any) => {
              const hr = assignment.assignedTo as any;
              if (!hr?._id) return;
              const hrId = hr._id.toString();
              if (!hrMap.has(hrId)) {
                hrMap.set(hrId, hr);
              }
            });

            if (hrMap.size === 0) {
              results.users = [];
            } else {
              // Filter HRs that match the search term (including full name search)
              const searchLower = searchTerm.toLowerCase().trim();
              const hrResults = Array.from(hrMap.values()).filter((hr: any) => {
                const firstName = (hr.firstName || '').toLowerCase();
                const lastName = (hr.lastName || '').toLowerCase();
                const fullName = `${firstName} ${lastName}`.trim();
                const email = (hr.email || '').toLowerCase();
                const customId = (hr.customId || '').toLowerCase();
                
                // Check if search matches firstName, lastName, full name, email, or customId
                return (
                  firstName.includes(searchLower) ||
                  lastName.includes(searchLower) ||
                  fullName.includes(searchLower) ||
                  email.includes(searchLower) ||
                  customId.includes(searchLower)
                );
              });

              results.users = hrResults.slice(0, limit).map((hr: any) => ({
                _id: hr._id,
                id: hr._id,
                firstName: hr.firstName,
                lastName: hr.lastName,
                email: hr.email,
                role: hr.role || 'hr',
                customId: hr.customId,
                profilePhotoFileId: hr.profilePhotoFileId || null,
                status: hr.status,
              }));
            }
          }
        } catch (error) {
          console.error('Error searching HRs for candidate:', error);
          results.users = [];
        }
      }
    }

    console.log('=== SEARCH RESULTS SUMMARY ===');
    console.log('Total results:', {
      jobs: results.jobs.length,
      candidates: results.candidates.length,
      companies: results.companies.length,
      users: results.users.length,
    });
    console.log('==============================\n');

    res.json({
      success: true,
      data: results,
    });
  });
}

