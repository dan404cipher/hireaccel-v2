import OpenAI from 'openai';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

interface ParsedJobDescription {
  title: string;
  description: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  workType?: 'wfo' | 'wfh' | 'remote';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: {
    skills: string[];
    experienceMin?: number;
    experienceMax?: number;
    education?: string[];
    certifications?: string[];
  };
  benefits?: string[];
  numberOfOpenings?: number;
  applicationDeadline?: string;
  duration?: string;
}

class JDParserService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Parses JD text and extracts relevant information into a structured format
   * @param jdText The text content of the job description
   * @returns Parsed job description information
   */
  async parseJD(jdText: string): Promise<ParsedJobDescription> {
    try {
      const prompt = `Extract the following information from this job description. Format as JSON. Only include fields that are present in the JD:

{
  "title": "Required: Job title",
  "description": "Required: Full job description",
  "location": "City, State/Country (optional)",
  "type": "full-time | part-time | contract | internship (optional)",
  "workType": "wfo | wfh | remote (optional, infer from location/description)",
  "salaryRange": {
    "min": 0,
    "max": 0,
    "currency": "INR | USD | EUR | GBP | CAD | AUD"
  },
  "requirements": {
    "skills": ["skill1", "skill2"],
    "experienceMin": 0,
    "experienceMax": 0,
    "education": ["degree1", "degree2"],
    "certifications": ["cert1", "cert2"]
  },
  "benefits": ["benefit1", "benefit2"],
  "numberOfOpenings": 1,
  "applicationDeadline": "YYYY-MM-DD (optional)",
  "duration": "e.g., 6 months, 1 year (only for contract/internship)"
}

Job Description:
${jdText}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k', // Updated to use available model
        messages: [
          {
            role: 'system',
            content: 'You are a precise job description parser that extracts structured information. Only include fields that are explicitly present in the JD. Infer work type from location/description (remote work mentions = remote, office location mentioned = wfo, hybrid mentioned = wfh). For experience, extract years (e.g., "3-5 years" = experienceMin: 3, experienceMax: 5). Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      let parsedData: ParsedJobDescription;
      try {
        parsedData = JSON.parse(content);
      } catch (error) {
        logger.error('Failed to parse OpenAI response:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          response: content,
          businessProcess: 'jd_parsing',
        });
        throw new Error('Failed to parse OpenAI response');
      }

      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Invalid response format from OpenAI');
      }

      // Validate required fields
      if (!parsedData.title || !parsedData.description) {
        throw new Error('Missing required fields: title and description are required');
      }

      // Ensure requirements object exists
      if (!parsedData.requirements) {
        parsedData.requirements = { skills: [] };
      }

      // Ensure skills array exists
      if (!Array.isArray(parsedData.requirements.skills)) {
        parsedData.requirements.skills = [];
      }

      // Normalize workType
      if (parsedData.workType) {
        const normalized = parsedData.workType.toLowerCase();
        if (normalized.includes('remote')) {
          parsedData.workType = 'remote';
        } else if (normalized.includes('hybrid') || normalized.includes('wfh')) {
          parsedData.workType = 'wfh';
        } else {
          parsedData.workType = 'wfo';
        }
      }

      // Normalize job type
      if (parsedData.type) {
        const normalized = parsedData.type.toLowerCase();
        if (normalized.includes('full')) {
          parsedData.type = 'full-time';
        } else if (normalized.includes('part')) {
          parsedData.type = 'part-time';
        } else if (normalized.includes('contract')) {
          parsedData.type = 'contract';
        } else if (normalized.includes('intern')) {
          parsedData.type = 'internship';
        }
      }

      // Ensure default currency
      if (parsedData.salaryRange && !parsedData.salaryRange.currency) {
        parsedData.salaryRange.currency = 'INR';
      }

      logger.info('JD parsed successfully', {
        title: parsedData.title,
        skillsCount: parsedData.requirements.skills.length,
        businessProcess: 'jd_parsing',
      });

      return parsedData;
    } catch (error) {
      logger.error('Failed to parse JD', {
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'jd_parsing',
      });
      throw error;
    }
  }
}

export const jdParserService = new JDParserService();
