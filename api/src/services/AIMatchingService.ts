import OpenAI from 'openai';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { JobDocument } from '@/models/Job';
import { CandidateDocument } from '@/models/Candidate';

export interface MatchResult {
  candidateId: string;
  jobId: string;
  matchScore: number; // 0-100
  reasons: string[]; // Reasons for the match
  strengths: string[]; // Candidate strengths for this job
  concerns: string[]; // Potential concerns or gaps
}

export interface AIMatchResponse {
  matches: MatchResult[];
  summary: string;
}

class AIMatchingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Match candidates to a specific job using AI
   * @param job The job to match candidates against
   * @param candidates Array of candidates to evaluate
   * @returns Array of match results sorted by match score
   */
  async matchCandidatesToJob(
    job: JobDocument,
    candidates: CandidateDocument[]
  ): Promise<MatchResult[]> {
    try {
      if (candidates.length === 0) {
        return [];
      }

      // Prepare job information for AI analysis
      const jobInfo = this.formatJobForAI(job);
      
      // Prepare candidates information for AI analysis
      const candidatesInfo = candidates.map(candidate => ({
        id: candidate._id.toString(),
        profile: this.formatCandidateForAI(candidate),
      }));

      // Create prompt for AI matching
      const prompt = this.createMatchingPrompt(jobInfo, candidatesInfo);

      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using efficient model for cost-effectiveness
        messages: [
          {
            role: 'system',
            content: `You are an expert recruitment AI that matches candidates to job positions. 
            Analyze candidate profiles and job requirements carefully. 
            Consider: skills match, experience level, education, certifications, location preferences, 
            salary expectations, and overall fit. Provide match scores from 0-100 and detailed reasoning.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temperature for more consistent matching
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Parse the AI response
      let parsedResponse: { matches: MatchResult[] };
      try {
        parsedResponse = JSON.parse(content);
      } catch (error) {
        logger.error('Failed to parse OpenAI matching response:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: content,
          businessProcess: 'ai_matching',
        });
        throw new Error('Failed to parse AI matching response');
      }

      // Validate and sort matches by score
      const matches = this.validateAndSortMatches(parsedResponse.matches || []);
      
      logger.info('AI matching completed', {
        jobId: job._id.toString(),
        candidatesCount: candidates.length,
        matchesCount: matches.length,
        businessProcess: 'ai_matching',
      });

      return matches;
    } catch (error) {
      logger.error('Error in AI matching:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jobId: job._id.toString(),
        candidatesCount: candidates.length,
        businessProcess: 'ai_matching',
      });
      throw error;
    }
  }

  /**
   * Format job data for AI analysis
   */
  private formatJobForAI(job: JobDocument): string {
    const jobData: any = {
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      workType: job.workType,
      salaryRange: job.salaryRange,
      requirements: {
        skills: job.requirements?.skills || [],
        experience: job.requirements?.experience || {},
        education: job.requirements?.education || {},
        languages: job.requirements?.languages || [],
        certifications: job.requirements?.certifications || [],
      },
      urgency: job.urgency,
      numberOfOpenings: job.numberOfOpenings,
    };

    return JSON.stringify(jobData, null, 2);
  }

  /**
   * Format candidate data for AI analysis
   */
  private formatCandidateForAI(candidate: CandidateDocument): string {
    const candidateData: any = {
      skills: candidate.profile?.skills || [],
      experience: candidate.profile?.experience || [],
      education: candidate.profile?.education || [],
      certifications: candidate.profile?.certifications || [],
      projects: candidate.profile?.projects || [],
      summary: candidate.profile?.summary || '',
      location: candidate.profile?.location || '',
      preferredSalaryRange: candidate.profile?.preferredSalaryRange || {},
      availability: candidate.profile?.availability || {},
      totalExperience: candidate.totalExperience || 0,
    };

    return JSON.stringify(candidateData, null, 2);
  }

  /**
   * Create matching prompt for AI
   */
  private createMatchingPrompt(jobInfo: string, candidatesInfo: Array<{ id: string; profile: string }>): string {
    return `You are analyzing candidates for a job position. Match each candidate to the job and provide:

1. A match score from 0-100 (where 100 is perfect match)
2. Reasons for the match (3-5 key points)
3. Candidate strengths relevant to this job (3-5 points)
4. Potential concerns or gaps (if any)

Return a JSON object with this structure:
{
  "matches": [
    {
      "candidateId": "candidate_id_here",
      "jobId": "job_id_here",
      "matchScore": 85,
      "reasons": ["Reason 1", "Reason 2", "Reason 3"],
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "concerns": ["Concern 1", "Concern 2"] // Can be empty array if no concerns
    }
  ]
}

Job Information:
${jobInfo}

Candidates to Evaluate:
${candidatesInfo.map((c, idx) => `Candidate ${idx + 1} (ID: ${c.id}):\n${c.profile}`).join('\n\n---\n\n')}

Analyze each candidate carefully and provide match scores and detailed reasoning.`;
  }

  /**
   * Validate and sort match results
   */
  private validateAndSortMatches(matches: any[]): MatchResult[] {
    const validatedMatches: MatchResult[] = [];

    for (const match of matches) {
      // Validate match structure
      if (
        !match.candidateId ||
        !match.jobId ||
        typeof match.matchScore !== 'number' ||
        match.matchScore < 0 ||
        match.matchScore > 100
      ) {
        logger.warn('Invalid match result skipped:', match);
        continue;
      }

      validatedMatches.push({
        candidateId: String(match.candidateId),
        jobId: String(match.jobId),
        matchScore: Math.round(match.matchScore),
        reasons: Array.isArray(match.reasons) ? match.reasons : [],
        strengths: Array.isArray(match.strengths) ? match.strengths : [],
        concerns: Array.isArray(match.concerns) ? match.concerns : [],
      });
    }

    // Sort by match score (descending)
    return validatedMatches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Match a single candidate to multiple jobs
   * @param candidate The candidate to match
   * @param jobs Array of jobs to evaluate
   * @returns Array of match results sorted by match score
   */
  async matchCandidateToJobs(
    candidate: CandidateDocument,
    jobs: JobDocument[]
  ): Promise<MatchResult[]> {
    try {
      if (jobs.length === 0) {
        return [];
      }

      const candidateInfo = this.formatCandidateForAI(candidate);
      const jobsInfo = jobs.map(job => ({
        id: job._id.toString(),
        profile: this.formatJobForAI(job),
      }));

      const prompt = `You are analyzing job opportunities for a candidate. Match the candidate to each job and provide:

1. A match score from 0-100 (where 100 is perfect match)
2. Reasons for the match (3-5 key points)
3. Candidate strengths relevant to this job (3-5 points)
4. Potential concerns or gaps (if any)

Return a JSON object with this structure:
{
  "matches": [
    {
      "candidateId": "candidate_id_here",
      "jobId": "job_id_here",
      "matchScore": 85,
      "reasons": ["Reason 1", "Reason 2", "Reason 3"],
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "concerns": ["Concern 1", "Concern 2"] // Can be empty array if no concerns
    }
  ]
}

Candidate Information:
${candidateInfo}

Jobs to Evaluate:
${jobsInfo.map((j, idx) => `Job ${idx + 1} (ID: ${j.id}):\n${j.profile}`).join('\n\n---\n\n')}

Analyze each job carefully and provide match scores and detailed reasoning.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert recruitment AI that matches candidates to job positions. 
            Analyze candidate profiles and job requirements carefully. 
            Consider: skills match, experience level, education, certifications, location preferences, 
            salary expectations, and overall fit. Provide match scores from 0-100 and detailed reasoning.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      let parsedResponse: { matches: MatchResult[] };
      try {
        parsedResponse = JSON.parse(content);
      } catch (error) {
        logger.error('Failed to parse OpenAI matching response:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: content,
          businessProcess: 'ai_matching',
        });
        throw new Error('Failed to parse AI matching response');
      }

      const matches = this.validateAndSortMatches(parsedResponse.matches || []);
      
      logger.info('AI matching completed', {
        candidateId: candidate._id.toString(),
        jobsCount: jobs.length,
        matchesCount: matches.length,
        businessProcess: 'ai_matching',
      });

      return matches;
    } catch (error) {
      logger.error('Error in AI matching:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        candidateId: candidate._id.toString(),
        jobsCount: jobs.length,
        businessProcess: 'ai_matching',
      });
      throw error;
    }
  }
}

export default new AIMatchingService();

