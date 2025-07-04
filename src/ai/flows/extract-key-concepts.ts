'use server';

/**
 * @fileOverview Extracts key concepts from the uploaded content.
 *
 * - extractKeyConcepts - A function that handles the key concept extraction process.
 * - ExtractKeyConceptsInput - The input type for the extractKeyConcepts function.
 * - ExtractKeyConceptsOutput - The return type for the extractKeyConcepts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeyConceptsInputSchema = z.object({
  content: z.string().describe('The content to extract key concepts from.'),
});
export type ExtractKeyConceptsInput = z.infer<typeof ExtractKeyConceptsInputSchema>;

const ExtractKeyConceptsOutputSchema = z.object({
  keyConcepts: z.array(z.string()).describe('The key concepts extracted from the content.'),
});
export type ExtractKeyConceptsOutput = z.infer<typeof ExtractKeyConceptsOutputSchema>;

export async function extractKeyConcepts(input: ExtractKeyConceptsInput): Promise<ExtractKeyConceptsOutput> {
  return extractKeyConceptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractKeyConceptsPrompt',
  input: {schema: ExtractKeyConceptsInputSchema},
  output: {schema: ExtractKeyConceptsOutputSchema},
  prompt: `You are an expert academic assistant. Your task is to identify and extract the key concepts from the provided content.

Content: {{{content}}}

Extract the key concepts from the content above and return them as a list of strings. Focus on the most important and central ideas.

{{#if keyConcepts}}
Key Concepts:
{{#each keyConcepts}}
- {{{this}}}
{{/each}}
{{else}}
No key concepts found.
{{/if}}`,
});

const extractKeyConceptsFlow = ai.defineFlow(
  {
    name: 'extractKeyConceptsFlow',
    inputSchema: ExtractKeyConceptsInputSchema,
    outputSchema: ExtractKeyConceptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
