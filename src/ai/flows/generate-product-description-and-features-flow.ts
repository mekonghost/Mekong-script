'use server';
/**
 * @fileOverview A Genkit flow for generating compelling, gaming-oriented product descriptions and formatted feature lists for FiveM scripts.
 *
 * - generateProductDescriptionAndFeatures - A function that optimizes raw script data into marketing-ready content.
 * - GenerateProductDescriptionAndFeaturesInput - The input type for the generateProductDescriptionAndFeatures function.
 * - GenerateProductDescriptionAndFeaturesOutput - The return type for the generateProductDescriptionAndFeatures function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionAndFeaturesInputSchema = z.object({
  scriptName: z.string().describe('The name of the FiveM script.'),
  rawDescription: z.string().describe('A brief, unoptimized description of the script.'),
  rawFeatures: z.array(z.string()).describe('A list of raw features for the script.'),
  framework: z.enum(['QBCore', 'ESX', 'Standalone']).describe('The FiveM framework the script is compatible with.'),
  price: z.number().optional().describe('The price of the script, if available.'),
});
export type GenerateProductDescriptionAndFeaturesInput = z.infer<typeof GenerateProductDescriptionAndFeaturesInputSchema>;

const GenerateProductDescriptionAndFeaturesOutputSchema = z.object({
  description: z.string().describe('A compelling, gaming-oriented product description for the FiveM script, suitable for a professional gaming marketplace. Use an exciting, neon, cyber style.'),
  features: z.array(z.string()).describe('A well-formatted, concise list of key features for the FiveM script, presented as bullet points or similar.'),
});
export type GenerateProductDescriptionAndFeaturesOutput = z.infer<typeof GenerateProductDescriptionAndFeaturesOutputSchema>;

export async function generateProductDescriptionAndFeatures(input: GenerateProductDescriptionAndFeaturesInput): Promise<GenerateProductDescriptionAndFeaturesOutput> {
  return generateProductDescriptionAndFeaturesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionAndFeaturesPrompt',
  input: { schema: GenerateProductDescriptionAndFeaturesInputSchema },
  output: { schema: GenerateProductDescriptionAndFeaturesOutputSchema },
  prompt: `You are an expert copywriter and marketing specialist for a futuristic, neon-themed gaming marketplace selling FiveM scripts. Your goal is to transform raw script data into highly engaging and concise product descriptions and feature lists that appeal to a gaming audience, emphasizing a 'cyber', 'neon', 'premium', and 'cool' aesthetic.

Generate a compelling product description and a clear, concise list of key features based on the provided script details.

Instructions:
1.  **Description**: Write a product description that is exciting, highlights the benefits, and incorporates the 'neon/cyber gaming' style. Make it sound premium and professional. It should be between 100-200 words.
2.  **Features**: Rephrase and format the raw features into a bulleted list of 5-8 strong selling points. Each feature should be clear, concise, and highlight its value to the user.

Input Script Details:
Script Name: {{{scriptName}}}
Framework: {{{framework}}}
Price: {{#if price}}\${{{price}}}{{else}}Not specified{{/if}}
Raw Description: {{{rawDescription}}}
Raw Features:
{{#each rawFeatures}}- {{{this}}}
{{/each}}

Output Format (Strictly follow this structure):
Description: [Generated compelling description]
Features:
- [Formatted feature 1]
- [Formatted feature 2]
- [Formatted feature 3]
...`,
});

const generateProductDescriptionAndFeaturesFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionAndFeaturesFlow',
    inputSchema: GenerateProductDescriptionAndFeaturesInputSchema,
    outputSchema: GenerateProductDescriptionAndFeaturesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
