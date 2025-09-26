import OpenAI from 'openai';
import { env } from '@/config/env';
import { CandidateProfile } from '@/types';
import { logger } from '@/config/logger';

class ResumeParserService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Parses resume text and extracts relevant information into a structured format
   * @param resumeText The text content of the resume
   * @returns Parsed candidate profile information
   */
  async parseResume(resumeText: string): Promise<Partial<CandidateProfile>> {
    try {
      // Create a structured prompt that will help minimize token usage
      const prompt = `Extract the following information from this resume. Format as JSON. Only include fields that are present in the resume. For all dates, use YYYY-MM format (e.g., "2023-09") or "present" for current positions:
{
  "skills": ["skill1", "skill2"],
  "experience": [{
    "company": "Required: Company name",
    "title": "Required: Job title",
    "startDate": "Required: YYYY-MM",
    "endDate": "YYYY-MM or present",
    "description": "Required: Brief description"
  }],
  "education": [{
    "institution": "Required: School name",
    "degree": "Required: Degree type",
    "field": "Required: Field of study",
    "startDate": "YYYY-MM",
    "endDate": "Required: YYYY-MM"
  }],
  "certifications": [{
    "name": "Required: Certification name",
    "issuer": "Required: Issuing organization",
    "issueDate": "Required: YYYY-MM format (e.g., 2023-09). If no date is available, omit this certification entirely",
    "expiryDate": "YYYY-MM if applicable"
  }],
  "projects": [{
    "name": "Required: Project name",
    "description": "Required: Brief description",
    "technologies": ["tech1", "tech2"],
    "githubUrl": "Optional: Full URL",
    "role": "Optional: Your role",
    "startDate": "Required: YYYY-MM",
    "endDate": "YYYY-MM or present"
  }],
  "summary": "brief professional summary",
  "location": "city, country",
  "phoneNumber": "numbers only",
  "linkedinUrl": "full url",
  "portfolioUrl": "full url"
}

Resume text:
${resumeText}`;

      // Make API call with optimized parameters
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106', // Using the latest 3.5 model which is cost-effective
        messages: [
          {
            role: 'system',
            content: 'You are a precise resume parser that extracts structured information. Only include fields that are explicitly present in the resume. Use brief descriptions. Format dates as YYYY-MM. IMPORTANT: Only include certifications if you can extract a valid issue date (YYYY-MM format). If a certification has no clear issue date, omit it entirely.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: "json_object" }, // Ensure JSON response
        temperature: 0.1, // Low temperature for more consistent outputs
      });

      // Parse and validate the response
      let parsedData;
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      try {
        parsedData = JSON.parse(content);
      } catch (error) {
        logger.error('Failed to parse OpenAI response:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: content,
          businessProcess: 'resume_parsing',
        });
        throw new Error('Failed to parse OpenAI response');
      }

      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Invalid response format from OpenAI');
      }


      // Helper function to parse date strings
      const parseDate = (dateStr: string | undefined): Date | undefined => {
        if (!dateStr) return undefined;
        if (dateStr.toLowerCase() === 'present') return undefined;
        try {
          // Handle YYYY-MM format
          if (/^\d{4}-\d{2}$/.test(dateStr)) {
            const date = new Date(dateStr + '-01');
            if (isNaN(date.getTime())) return undefined;
            return date;
          }
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return undefined;
          return date;
        } catch {
          return undefined;
        }
      };

      // Helper function to format experience entries
      const formatExperience = (exp: any) => {
        if (!exp.company || !exp.title || !exp.startDate) return null;
        return {
          company: exp.company,
          position: exp.title,
          startDate: parseDate(exp.startDate),
          endDate: parseDate(exp.endDate),
          current: !exp.endDate || exp.endDate.toLowerCase() === 'present',
          description: (exp.description || '').slice(0, 2000)
        };
      };

      // Helper function to format education entries
      const formatEducation = (edu: any) => {
        if (!edu.institution || !edu.degree || !edu.field) return null;
        const startYear = parseDate(edu.startDate)?.getFullYear();
        const endYear = parseDate(edu.endDate)?.getFullYear();
        return {
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          graduationYear: endYear || startYear || new Date().getFullYear()
        };
      };

      // Helper function to format certification entries
      const formatCertification = (cert: any) => {
        if (!cert.name || !cert.issuer) return null;
        
        // Only include certifications with valid issue dates
        const issueDate = parseDate(cert.issueDate);
        if (!issueDate) return null;
        
        return {
          name: cert.name,
          issuer: cert.issuer,
          issueDate: issueDate,
          expiryDate: parseDate(cert.expiryDate),
          credentialId: cert.credentialId,
          credentialUrl: cert.credentialUrl
        };
      };

      // Helper function to format project entries
      const formatProject = (proj: any) => {
        if (!proj.name) return null;
        return {
          title: proj.name,
          description: (proj.description || '').slice(0, 2000),
          technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
          startDate: parseDate(proj.startDate) || new Date(),
          endDate: parseDate(proj.endDate),
          current: !proj.endDate || proj.endDate.toLowerCase() === 'present',
          projectUrl: proj.projectUrl,
          githubUrl: proj.githubUrl,
          role: proj.role
        };
      };

      // Add default values for required fields if they're missing and validate data
      const profile: Partial<CandidateProfile> = {
        // Validate arrays with maximum lengths to prevent overflow
        skills: Array.isArray(parsedData.skills) ? 
          parsedData.skills.filter((s: unknown) => typeof s === 'string').slice(0, 50) : [],
        experience: (parsedData.experience || [])
          .map(formatExperience)
          .filter((exp: ReturnType<typeof formatExperience>): exp is NonNullable<typeof exp> => exp !== null)
          .slice(0, 20),
        education: (parsedData.education || [])
          .map(formatEducation)
          .filter((edu: ReturnType<typeof formatEducation>): edu is NonNullable<typeof edu> => edu !== null)
          .slice(0, 10),
        certifications: (parsedData.certifications || [])
          .map(formatCertification)
          .filter((cert: ReturnType<typeof formatCertification>): cert is NonNullable<typeof cert> => cert !== null)
          .slice(0, 20),
        projects: (parsedData.projects || [])
          .map(formatProject)
          .filter((proj: ReturnType<typeof formatProject>): proj is NonNullable<typeof proj> => proj !== null)
          .slice(0, 20),
        
        // Validate and sanitize text fields
        summary: typeof parsedData.summary === 'string' ? 
          parsedData.summary.slice(0, 1000) : '',
        location: typeof parsedData.location === 'string' ? 
          parsedData.location.slice(0, 200) : undefined,
        phoneNumber: typeof parsedData.phoneNumber === 'string' && 
          /^[\+]?[1-9][\d]{0,15}$/.test(parsedData.phoneNumber) ? 
          parsedData.phoneNumber : undefined,
        
        // Validate URLs
        linkedinUrl: typeof parsedData.linkedinUrl === 'string' && 
          /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/.test(parsedData.linkedinUrl) ?
          parsedData.linkedinUrl : undefined,
        portfolioUrl: typeof parsedData.portfolioUrl === 'string' && 
          /^https?:\/\/.+$/.test(parsedData.portfolioUrl) ?
          parsedData.portfolioUrl : undefined,
      };

      return profile;
    } catch (error) {
      logger.error('Error parsing resume with OpenAI:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'resume_parsing',
      });
      throw new Error('Failed to parse resume');
    }
  }
}

export const resumeParserService = new ResumeParserService();
