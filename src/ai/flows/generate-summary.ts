// src/ai/flows/generate-summary.ts
'use server';

/**
 * @fileOverview AI flow to generate study materials including a summary, key concepts, and flashcards.
 *
 * - generateStudyMaterials - A function that takes text content and returns all generated materials.
 * - GenerateStudyMaterialsInput - The input type for the generateStudyMaterials function.
 * - GenerateStudyMaterialsOutput - The return type for the generateStudyMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyMaterialsInputSchema = z.object({
  content: z
    .string()
    .describe('The text content to be processed, such as lecture notes or a document excerpt.'),
});
export type GenerateStudyMaterialsInput = z.infer<typeof GenerateStudyMaterialsInputSchema>;

const GenerateStudyMaterialsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the input content.'),
  keyConcepts: z.array(z.string()).describe('The key concepts extracted from the content.'),
  flashcards: z
    .array(z.object({question: z.string(), answer: z.string()}))
    .describe('Generated flashcards, formatted as questions and answers.'),
});
export type GenerateStudyMaterialsOutput = z.infer<typeof GenerateStudyMaterialsOutputSchema>;

export async function generateStudyMaterials(input: GenerateStudyMaterialsInput): Promise<GenerateStudyMaterialsOutput> {
  return generateStudyMaterialsFlow(input);
}

const generateStudyMaterialsPrompt = ai.definePrompt({
  name: 'generateStudyMaterialsPrompt',
  input: {schema: GenerateStudyMaterialsInputSchema},
  output: {schema: GenerateStudyMaterialsOutputSchema},
  prompt: `You are an expert AI academic assistant. From the content provided below, please perform the following tasks:
1.  Generate a concise summary.
2.  Extract the most important key concepts as a list of strings.
3.  Create a set of flashcards (question and answer format) based on the key concepts.

Content: {{{content}}}

Return the results in the specified JSON format.`,
});

const generateStudyMaterialsFlow = ai.defineFlow(
  {
    name: 'generateStudyMaterialsFlow',
    inputSchema: GenerateStudyMaterialsInputSchema,
    outputSchema: GenerateStudyMaterialsOutputSchema,
  },
  async input => {
    const {output} = await generateStudyMaterialsPrompt(input);
    return output!;
  }
);
