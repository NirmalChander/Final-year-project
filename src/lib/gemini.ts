import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchConstitution } from './constitution';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const AVAILABLE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-pro-latest"
] as const;

export type GeminiModel = typeof AVAILABLE_MODELS[number];

export interface LegalReference {
  section: string;
  description: string;
  url?: string;
}

export interface SimilarCase {
  title: string;
  url: string;
  description: string;
  date?: string;
}

export interface ActionStep {
  step: string;
  description: string;
}

export interface GeminiResponse {
  content: string;
  legalReferences: LegalReference[];
  actionSteps?: ActionStep[];
  contactInfo?: ContactInfo[];
  similarCases?: SimilarCase[];
}

export interface ContactInfo {
  department: string;
  helpline: string;
  type: 'phone' | 'email' | 'website';
  description?: string;
}

export class GeminiService {
  private currentModel: GeminiModel = 'gemini-2.5-flash';
  private model = genAI.getGenerativeModel({ model: this.currentModel });

  getCurrentModel(): GeminiModel {
    return this.currentModel;
  }

  getAvailableModels(): readonly GeminiModel[] {
    return AVAILABLE_MODELS;
  }

  setModel(model: GeminiModel): void {
    this.currentModel = model;
    this.model = genAI.getGenerativeModel({ model });
  }

  async generateLegalResponse(userQuery: string, chatHistory: Array<{ role: 'user' | 'model'; content: string }>, image?: File): Promise<GeminiResponse> {
    // Search for relevant constitution articles
    const relevantArticles = searchConstitution(userQuery);
    const articlesText = relevantArticles.length > 0
      ? `\nRelevant Constitution Articles:\n${relevantArticles.map(article => `Article ${article.articleNumber}: ${article.description}`).join('\n\n')}`
      : '';

    const constitutionContext = `
You are an assistant expert in Indian law. Use the Constitution of India and relevant statutes when applicable.
Be concise, factual, and not a substitute for a lawyer.
Always include relevant legal references (section/article identifiers) when applicable.
Provide practical steps or actions when relevant to the query.
Limit the main answer to 1-2 short sentences, followed by references, steps if applicable, and a one-line disclaimer.
${articlesText}
`;

    const prompt = `${constitutionContext}

User Query: ${userQuery}

Instructions:
- Provide the shortest clear answer possible (max 2 short sentences). **Highlight/Bold the core answer/finding** so it stands out immediately to the user.
- If applicable, list legal references with official reference links in the format: ###REFERENCES###\nArticle 1 | https://example.link : Description\nSection 2 | https://another.link : Description\n###ENDREFERENCES###
- If the query involves actionable advice, provide practical steps appropriate to the situation. Do not force a specific number of steps , use least steps possible - provide as many as needed (can be 0, 1, 2, 3, 4, 5, 6, 7 or more than 8 if the situation requires it). Only include steps if they genuinely help the user take action.
- Output the steps in the format: ###STEPS###\n1. **Step Title:** Step description\n2. **Step Title:** Step description\n###ENDSTEPS###
- ALWAYS include relevant contact information for legal helplines, government agencies, or legal aid services when the query involves legal matters. Provide accurate phone numbers.
- CRITICAL: To avoid hallucinating broken website links, for website URLs, ALWAYS provide a Google Search URL instead of a direct link, unless you are 100% certain the exact official URL is correct.
- Output contact information in the exact format: ###CONTACTS###
Department Name - Phone: 123-456-7890
Department Name - Email: contact@example.com
Department Name - Website: https://www.google.com/search?q=Department+Name+official+contact
###ENDCONTACTS###
- Include 1-2 real, similar case news articles, precedent cases, or real-life examples.
- CRITICAL: AI models often hallucinate fake news URLs that result in broken 404 links. To avoid this, DO NOT provide direct news website links. Instead, provide a Google Search URL for the case or topic.
- Output similar cases exactly in this bullet-point format: ###CASES###\n* Case Title | https://www.google.com/search?q=Your+Search+Query+Here | Brief Description | YYYY-MM-DD\n* Another Case | https://www.google.com/search?q=Another+Query | Description | \n###ENDCASES###
- IMPORTANT: ONLY include contacts that are STRICTLY RELEVANT to the user's specific context. Do not include generic contacts (like Women Helpline, Police, or Cyber Crime) unless the query specifically pertains to those topics.
- End with one-line disclaimer: "Consult a qualified lawyer for specific advice."
- Do not add extra commentary.

Response:`;

    try {
      const chat = this.model.startChat({
        history: chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.09,
          topK: 30,
          topP: 0.7,
          maxOutputTokens: 2048,
        },
      });

      const parts: any[] = [{ text: prompt }];
      if (image) {
        // Convert image file to base64
        const imageData = await this.fileToGenerativePart(image);
        parts.push(imageData);
      }

      const result = await chat.sendMessageStream(parts);
      const stream = result.stream;

      // For now, collect all chunks
      let fullText = '';
      const chunks: string[] = [];
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        chunks.push(chunkText);
      }

      // Parse the response
      const stepsMarker = '###STEPS###';
      const endStepsMarker = '###ENDSTEPS###';
      const refsMarker = '###REFERENCES###';
      const endRefsMarker = '###ENDREFERENCES###';
      const contactsMarker = '###CONTACTS###';
      const endContactsMarker = '###ENDCONTACTS###';
      const casesMarker = '###CASES###';
      const endCasesMarker = '###ENDCASES###';

      let content = fullText;
      let actionSteps: ActionStep[] = [];
      let legalReferences: LegalReference[] = [];
      let contactInfo: ContactInfo[] = [];
      let similarCases: SimilarCase[] = [];

      // Extract using regex to handle missing END tags and avoid substring interference
      const casesMatch = fullText.match(/###CASES###([\s\S]*?)(?:###ENDCASES###|$)/i);
      if (casesMatch) {
        similarCases = this.parseSimilarCases(casesMatch[1].trim());
      }

      const refsMatch = fullText.match(/###REFERENCES###([\s\S]*?)(?:###ENDREFERENCES###|$)/i);
      if (refsMatch) {
        legalReferences = this.parseLegalReferences(refsMatch[1].trim());
      } else {
        legalReferences = this.extractLegalReferences(fullText);
      }

      const stepsMatch = fullText.match(/###STEPS###([\s\S]*?)(?:###ENDSTEPS###|$)/i);
      if (stepsMatch) {
        actionSteps = this.extractActionSteps(stepsMatch[1].trim());
      } else {
        actionSteps = this.extractActionSteps(fullText);
      }

      const contactsMatch = fullText.match(/###CONTACTS###([\s\S]*?)(?:###ENDCONTACTS###|$)/i);
      if (contactsMatch) {
        contactInfo = this.parseContactInfo(contactsMatch[1].trim());
      } else {
        contactInfo = this.extractContactInfo(fullText);
      }

      // If no contacts were found but this is a legal query, add default emergency contacts
      if (contactInfo.length === 0 && this.isLegalQuery(userQuery)) {
        contactInfo = this.getDefaultLegalContacts(userQuery);
      }

      // Clean up content by removing any remaining markers and their contents
      content = content.replace(/###CASES###[\s\S]*?(?:###ENDCASES###|$)/gi, '').trim();
      content = content.replace(/###REFERENCES###[\s\S]*?(?:###ENDREFERENCES###|$)/gi, '').trim();
      content = content.replace(/###STEPS###[\s\S]*?(?:###ENDSTEPS###|$)/gi, '').trim();
      content = content.replace(/###CONTACTS###[\s\S]*?(?:###ENDCONTACTS###|$)/gi, '').trim();

      // Also remove any stray END markers just in case
      content = content.replace(/###ENDCASES###/gi, '').trim();
      content = content.replace(/###ENDREFERENCES###/gi, '').trim();
      content = content.replace(/###ENDSTEPS###/gi, '').trim();
      content = content.replace(/###ENDCONTACTS###/gi, '').trim();

      return {
        content,
        legalReferences,
        actionSteps,
        contactInfo,
        similarCases
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: `API Error: ${errorMessage}`,
        legalReferences: [],
        actionSteps: [],
        contactInfo: [],
        similarCases: []
      };
    }
  }

  private async fileToGenerativePart(file: File) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        });
      };
      reader.readAsDataURL(file);
    });
  }

  private extractLegalReferences(text: string): LegalReference[] {
    const references: LegalReference[] = [];
    const patterns = [
      /Article\s+(\d+(?:\([^)]+\))?)/gi,
      /Section\s+(\d+(?:\([^)]+\))?)/gi,
      /Article\s+(\d+[A-Z]?)/gi,
      /Section\s+(\d+[A-Z]?)/gi,
      /(\d+)\s+of\s+the\s+Constitution/gi,
      /Part\s+([IVXLCDM]+(?:\([^)]+\))?)/gi,
    ];

    const lines = text.split('\n');

    for (const line of lines) {
      for (const pattern of patterns) {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            // Extract description from surrounding context
            const description = line.replace(match, '').trim();
            references.push({
              section: match,
              description: description || 'Legal reference'
            });
          }
        }
      }
    }

    // Remove duplicates
    return references.filter((ref, index, self) =>
      index === self.findIndex(r => r.section === ref.section)
    );
  }

  private parseLegalReferences(refsText: string): LegalReference[] {
    const references: LegalReference[] = [];
    const lines = refsText.split('\n');

    for (const line of lines) {
      // First try to match format with URL: "Section | https://link : Description"
      const urlMatch = line.match(/^(.+?)\s*\|\s*(https?:\/\/[^\s]+)\s*:\s*(.+)$/);
      if (urlMatch) {
        references.push({
          section: urlMatch[1].trim(),
          url: urlMatch[2].trim(),
          description: urlMatch[3].trim()
        });
        continue;
      }

      // Fallback to format without URL: "Section : Description"
      const match = line.match(/^(.+?):\s*(.+)$/);
      if (match) {
        references.push({
          section: match[1].trim(),
          description: match[2].trim()
        });
      }
    }

    return references;
  }

  private parseContactInfo(contactsText: string): ContactInfo[] {
    const contacts: ContactInfo[] = [];
    const lines = contactsText.split('\n');

    for (const line of lines) {
      // Parse format: "Department Name - Phone: 123-456-7890"
      const phoneMatch = line.match(/^(.+?)\s*-\s*Phone:\s*(.+)$/);
      if (phoneMatch) {
        contacts.push({
          department: phoneMatch[1].trim(),
          helpline: phoneMatch[2].trim(),
          type: 'phone',
          description: `Phone: ${phoneMatch[2].trim()}`
        });
        continue;
      }

      const emailMatch = line.match(/^(.+?)\s*-\s*Email:\s*(.+)$/);
      if (emailMatch) {
        contacts.push({
          department: emailMatch[1].trim(),
          helpline: emailMatch[2].trim(),
          type: 'email',
          description: `Email: ${emailMatch[2].trim()}`
        });
        continue;
      }

      const websiteMatch = line.match(/^(.+?)\s*-\s*Website:\s*(.+)$/);
      if (websiteMatch) {
        contacts.push({
          department: websiteMatch[1].trim(),
          helpline: websiteMatch[2].trim(),
          type: 'website',
          description: `Website: ${websiteMatch[2].trim()}`
        });
        continue;
      }
    }

    return contacts;
  }

  private extractContactInfo(text: string): ContactInfo[] {
    const contacts: ContactInfo[] = [];

    // Look for various contact patterns
    const patterns = [
      // Phone numbers - more comprehensive patterns
      { type: 'phone', regex: /helpline:?\s*([\d\s\-+(\)]+)/gi, label: 'Helpline' },
      { type: 'phone', regex: /toll[-\s]free:?\s*([\d\s\-+(\)]+)/gi, label: 'Toll-free' },
      { type: 'phone', regex: /contact:?\s*([\d\s\-+(\)]+)/gi, label: 'Contact' },
      { type: 'phone', regex: /phone:?\s*([\d\s\-+(\)]+)/gi, label: 'Phone' },
      { type: 'phone', regex: /emergency:?\s*([\d\s\-+(\)]+)/gi, label: 'Emergency' },
      { type: 'phone', regex: /dial:?\s*([\d\s\-+(\)]+)/gi, label: 'Dial' },
      // Email addresses
      { type: 'email', regex: /email:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, label: 'Email' },
      // Website URLs
      { type: 'website', regex: /website:?\s*(https?:\/\/[^\s]+)/gi, label: 'Website' },
      { type: 'website', regex: /(https?:\/\/[^\s]+)/gi, label: 'Website' },
    ];

    const lines = text.split('\n');

    for (const line of lines) {
      for (const pattern of patterns) {
        const matches = line.match(pattern.regex);
        if (matches) {
          for (const match of matches) {
            const value = match.replace(pattern.regex, '$1');
            const department = line.replace(match, '').trim() || pattern.label;
            contacts.push({
              department: department.replace(/^[-•*]\s*/, ''), // Remove bullet points
              helpline: value,
              type: pattern.type as 'phone' | 'email' | 'website',
              description: `${pattern.label}: ${value}`
            });
          }
        }
      }
    }

    // Remove duplicates
    return contacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.helpline === contact.helpline)
    );
  }

  private extractActionSteps(text: string): ActionStep[] {
    const steps: ActionStep[] = [];

    // Look for numbered steps with **title:** format
    const lines = text.split('\n');

    for (const line of lines) {
      // Match numbered steps like "1. **Title:** description"
      const stepMatch = line.match(/^(\d+)\.\s*\*\*(.+?):\*\*\s*(.+)$/);
      if (stepMatch) {
        const stepNumber = stepMatch[1];
        const stepTitle = stepMatch[2].trim();
        const stepDescription = stepMatch[3].trim();

        steps.push({
          step: stepNumber,
          description: `**${stepTitle}:** ${stepDescription}`
        });
      }
    }

    return steps;
  }

  private isLegalQuery(query: string): boolean {
    const legalKeywords = [
      'law', 'legal', 'court', 'police', 'crime', 'arrest', 'bail', 'divorce', 'marriage',
      'property', 'contract', 'rights', 'constitution', 'article', 'section', 'act',
      'complaint', 'case', 'litigation', 'advocate', 'lawyer', 'judgement', 'sentence',
      'evidence', 'witness', 'defendant', 'plaintiff', 'petition', 'appeal', 'tribunal',
      'domestic violence', 'harassment', 'fraud'
    ];

    const lowerQuery = query.toLowerCase();
    return legalKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private getDefaultLegalContacts(query: string): ContactInfo[] {
    const contacts: ContactInfo[] = [];
    const lowerQuery = query.toLowerCase();

    // Emergency contacts
    if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || lowerQuery.includes('attack') || lowerQuery.includes('danger') || lowerQuery.includes('assault')) {
      contacts.push({
        department: 'Police Emergency',
        helpline: '100',
        type: 'phone',
        description: 'Police Emergency Helpline'
      });
    }

    // Women-related issues
    if (lowerQuery.match(/\bwomen\b/) || lowerQuery.includes('domestic violence') || lowerQuery.includes('dowry') || lowerQuery.includes('harassment')) {
      contacts.push({
        department: 'Women Helpline',
        helpline: '181',
        type: 'phone',
        description: 'Women Helpline for domestic violence and harassment'
      }, {
        department: 'National Commission for Women',
        helpline: 'https://ncw.nic.in/helplines',
        type: 'website',
        description: 'Official Website of NCW'
      });
    }

    // Child-related issues
    if (lowerQuery.includes('child') || lowerQuery.includes('minor') || lowerQuery.includes('abuse')) {
      contacts.push({
        department: 'Child Helpline',
        helpline: '1098',
        type: 'phone',
        description: 'Child Helpline for child abuse and protection'
      }, {
        department: 'NCPCR',
        helpline: 'https://ncpcr.gov.in/',
        type: 'website',
        description: 'Official Website of NCPCR'
      });
    }

    // Cyber crime
    if (lowerQuery.includes('cyber') || lowerQuery.includes('online') || lowerQuery.includes('fraud') || lowerQuery.includes('hacking')) {
      contacts.push({
        department: 'Cyber Crime Helpline',
        helpline: '1930',
        type: 'phone',
        description: 'Cyber Crime Reporting Helpline'
      }, {
        department: 'Cyber Crime Portal',
        helpline: 'https://cybercrime.gov.in/',
        type: 'website',
        description: 'National Cyber Crime Reporting Portal'
      });
    }

    // Legal aid
    if (lowerQuery.includes('legal aid') || lowerQuery.includes('free lawyer') || lowerQuery.includes('poor')) {
      contacts.push({
        department: 'Legal Aid Services',
        helpline: '15100',
        type: 'phone',
        description: 'National Legal Services Authority'
      }, {
        department: 'NALSA',
        helpline: 'https://nalsa.gov.in/',
        type: 'website',
        description: 'Official Website of NALSA'
      });
    }

    // Always include general legal helpline
    contacts.push({
      department: 'Legal Services Authority',
      helpline: '15100',
      type: 'phone',
      description: 'National Legal Services Authority for free legal aid'
    }, {
      department: 'NALSA Website',
      helpline: 'https://nalsa.gov.in/',
      type: 'website',
      description: 'Official Website of NALSA'
    });

    // Remove duplicates
    return contacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.helpline === contact.helpline)
    );
  }

  private parseSimilarCases(casesText: string): SimilarCase[] {
    const cases: SimilarCase[] = [];

    // Sometimes the model puts multiple cases on one line or uses bullet points
    // Let's use regex to reliably split by bullet points or cases
    const caseLines = casesText.split(/\n|\*/).filter(line => line.trim() !== '');

    for (const line of caseLines) {
      if (!line.trim()) continue;
      // Format: "Title | URL | Description | Date" or without Date
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        cases.push({
          title: parts[0],
          url: parts[1],
          description: parts[2],
          date: parts.length > 3 && parts[3] ? parts[3] : undefined
        });
      }
    }

    return cases;
  }
}

export const geminiService = new GeminiService();