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
- Provide the shortest clear answer possible (max 2 short sentences).
- If applicable, list legal references in the format: ###REFERENCES###\nArticle 1: Description\nSection 2: Description\n###ENDREFERENCES###
- If the query involves actionable advice, provide practical steps appropriate to the situation. Do not force a specific number of steps , use least steps possible - provide as many as needed (can be 0, 1, 2, 3, 4, 5, 6, 7 or more than 8 if the situation requires it). Only include steps if they genuinely help the user take action.
- Output the steps in the format: ###STEPS###\n1. **Step Title:** Step description\n2. **Step Title:** Step description\n###ENDSTEPS###
- ALWAYS include relevant contact information for legal helplines, government agencies, or legal aid services when the query involves legal matters. Include phone numbers for emergency legal help, legal aid societies, or relevant government departments.
- Output contact information in the format: ###CONTACTS###\nDepartment Name - Phone: 123-456-7890\nDepartment Name - Email: contact@example.com\nDepartment Name - Website: https://example.com\n###ENDCONTACTS###
- For Indian legal matters, include contacts for: Legal Aid Services, State Legal Services Authority, Police (100), Women Helpline (181), Child Helpline (1098), Cyber Crime Helpline, Consumer Court, etc.
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

      let content = fullText;
      let actionSteps: ActionStep[] = [];
      let legalReferences: LegalReference[] = [];
      let contactInfo: ContactInfo[] = [];

      // Parse references first
      const refsIndex = fullText.indexOf(refsMarker);
      const endRefsIndex = fullText.indexOf(endRefsMarker);
      if (refsIndex !== -1 && endRefsIndex !== -1) {
        const refsText = fullText.substring(refsIndex + refsMarker.length, endRefsIndex).trim();
        legalReferences = this.extractLegalReferences(refsText);
        // Remove references section from content
        content = fullText.substring(0, refsIndex) + fullText.substring(endRefsIndex + endRefsMarker.length);
      } else {
        // Fallback
        legalReferences = this.extractLegalReferences(fullText);
      }

      // Parse steps
      const stepsIndex = content.indexOf(stepsMarker);
      const endStepsIndex = content.indexOf(endStepsMarker);
      if (stepsIndex !== -1 && endStepsIndex !== -1) {
        const stepsText = content.substring(stepsIndex + stepsMarker.length, endStepsIndex).trim();
        actionSteps = this.extractActionSteps(stepsText);
        // Remove steps section from content
        content = content.substring(0, stepsIndex) + content.substring(endStepsIndex + endStepsMarker.length);
      } else {
        // Fallback
        actionSteps = this.extractActionSteps(content);
      }

      // Parse contacts
      const contactsIndex = content.indexOf(contactsMarker);
      const endContactsIndex = content.indexOf(endContactsMarker);
      if (contactsIndex !== -1 && endContactsIndex !== -1) {
        const contactsText = content.substring(contactsIndex + contactsMarker.length, endContactsIndex).trim();
        contactInfo = this.parseContactInfo(contactsText);
        // Remove contacts section from content
        content = content.substring(0, contactsIndex) + content.substring(endContactsIndex + endContactsMarker.length);
      } else {
        // Fallback
        contactInfo = this.extractContactInfo(content);
      }

      // If no contacts were found but this is a legal query, add default emergency contacts
      if (contactInfo.length === 0 && this.isLegalQuery(userQuery)) {
        contactInfo = this.getDefaultLegalContacts(userQuery);
      }

      // Clean up content by removing any remaining markers
      content = content.replace(/###REFERENCES###[\s\S]*?###ENDREFERENCES###/g, '').trim();
      content = content.replace(/###STEPS###[\s\S]*?###ENDSTEPS###/g, '').trim();
      content = content.replace(/###CONTACTS###[\s\S]*?###ENDCONTACTS###/g, '').trim();

      return {
        content,
        legalReferences,
        actionSteps,
        contactInfo
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment. For urgent legal matters, please consult a qualified legal professional.",
        legalReferences: [],
        actionSteps: [],
        contactInfo: []
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
    if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || lowerQuery.includes('help')) {
      contacts.push({
        department: 'Police Emergency',
        helpline: '100',
        type: 'phone',
        description: 'Police Emergency Helpline'
      });
    }

    // Women-related issues
    if (lowerQuery.includes('women') || lowerQuery.includes('domestic violence') || lowerQuery.includes('harassment')) {
      contacts.push({
        department: 'Women Helpline',
        helpline: '181',
        type: 'phone',
        description: 'Women Helpline for domestic violence and harassment'
      });
    }

    // Child-related issues
    if (lowerQuery.includes('child') || lowerQuery.includes('minor') || lowerQuery.includes('abuse')) {
      contacts.push({
        department: 'Child Helpline',
        helpline: '1098',
        type: 'phone',
        description: 'Child Helpline for child abuse and protection'
      });
    }

    // Cyber crime
    if (lowerQuery.includes('cyber') || lowerQuery.includes('online') || lowerQuery.includes('fraud') || lowerQuery.includes('hacking')) {
      contacts.push({
        department: 'Cyber Crime Helpline',
        helpline: '1930',
        type: 'phone',
        description: 'Cyber Crime Reporting Helpline'
      });
    }

    // Legal aid
    if (lowerQuery.includes('legal aid') || lowerQuery.includes('free lawyer') || lowerQuery.includes('poor')) {
      contacts.push({
        department: 'Legal Aid Services',
        helpline: '15100',
        type: 'phone',
        description: 'National Legal Services Authority'
      });
    }

    // Always include general legal helpline
    contacts.push({
      department: 'Legal Services Authority',
      helpline: '15100',
      type: 'phone',
      description: 'National Legal Services Authority for free legal aid'
    });

    // Remove duplicates
    return contacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.helpline === contact.helpline)
    );
  }
}

export const geminiService = new GeminiService();