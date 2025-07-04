'use server';

/**
 * @fileOverview Extracts text content from various file types.
 *
 * - extractTextFromFile - A function that handles text extraction from files.
 * - ExtractTextFromFileInput - The input type for the extractTextFromFile function.
 * - ExtractTextFromFileOutput - The return type for the extractTextFromFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  text: z.string().describe('The extracted text content from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return extractTextFromFileFlow(input);
}


const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async ({ fileDataUri }) => {
    const [meta, data] = fileDataUri.split(',');
    if (!meta || !data) {
        throw new Error('Invalid data URI');
    }
    const mimeType = meta.match(/:(.*?);/)?.[1];
    const buffer = Buffer.from(data, 'base64');
  
    let text = '';
  
    if (mimeType === 'application/pdf') {
      const nodeRequire = (await import('module')).createRequire(import.meta.url);
      const pdf = nodeRequire('pdf-parse');
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimeType === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  
    return { text };
  }
);
