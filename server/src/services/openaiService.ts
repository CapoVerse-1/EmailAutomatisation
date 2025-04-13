import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  /**
   * Generate marketing email content based on company information
   */
  async generateEmailContent(
    companyName: string, 
    companyDescription: string, 
    emailType: string = 'marketing'
  ): Promise<string> {
    try {
      // Design prompt for different types of emails
      let prompt = this.createPrompt(companyName, companyDescription, emailType);
      
      // Call OpenAI API to generate email content
      const response = await openai.chat.completions.create({
        model: 'gpt-4', // or gpt-3.5-turbo for a more cost-effective option
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const generatedContent = response.choices[0]?.message?.content || '';
      return generatedContent;
    } catch (error) {
      console.error('Error generating email content:', error);
      throw error;
    }
  }

  /**
   * Create appropriate prompt based on email type and company information
   */
  private createPrompt(companyName: string, companyDescription: string, emailType: string): string {
    switch (emailType) {
      case 'marketing':
        return `
          Generate a professional marketing email for ${companyName}.
          
          About the company:
          ${companyDescription}
          
          Guidelines:
          - Write in a professional but friendly tone
          - Include a compelling subject line
          - Keep the email concise (3-4 paragraphs maximum)
          - Include a clear call to action
          - Format the email with HTML tags (use basic formatting only)
          - Do not include any placeholder text or notes about the email being AI-generated
          
          Return only the email content with a subject line at the top.
        `;
      
      case 'follow-up':
        return `
          Generate a follow-up email for ${companyName}.
          
          About the company:
          ${companyDescription}
          
          Guidelines:
          - Assume this is a follow-up to a previous marketing email
          - Reference previous communication without specific details
          - Be polite and not pushy
          - Include a clear but gentle call to action
          - Format the email with HTML tags (use basic formatting only)
          - Keep it brief (2-3 paragraphs)
          
          Return only the email content with a subject line at the top.
        `;
      
      default:
        return `
          Generate a professional email for ${companyName}.
          
          About the company:
          ${companyDescription}
          
          Guidelines:
          - Write in a professional tone
          - Include a relevant subject line
          - Format the email with HTML tags (use basic formatting only)
          - Include a clear purpose and call to action
          
          Return only the email content with a subject line at the top.
        `;
    }
  }
}

export default new OpenAIService(); 