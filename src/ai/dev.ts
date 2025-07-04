import { config } from 'dotenv';
config();

import '@/ai/flows/extract-key-concepts.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-summary.ts';
import '@/ai/flows/extract-text-from-file.ts';
