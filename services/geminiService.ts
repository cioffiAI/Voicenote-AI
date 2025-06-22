
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY for Gemini is not set. Please set the process.env.API_KEY environment variable. Gemini functionality will be disabled.");
}

// Correct model for general text tasks
const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

const getAiInstance = (): GoogleGenAI => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. API_KEY might be missing or invalid.");
  }
  return ai;
};

const handleError = (error: unknown, context: string): string => {
  console.error(`Error during "${context}":`, error);
  if (error instanceof Error) {
    if (error.message.includes('API key not valid')) {
        return `Error ${context}: The API key is not valid. Please check your configuration.`;
    }
    if (error.message.includes('quota')) {
        return `Error ${context}: You have exceeded your API quota. Please check your Gemini account.`;
    }
    // Use the error message directly if it's already specific from processResponse
    return `Error ${context}: ${error.message}`;
  }
  return `An unknown error occurred while ${context}.`;
}

// Helper function to process Gemini response and check for issues
const processGeminiResponse = (response: GenerateContentResponse, operationDescription: string): string => {
  // Check for block reasons first
  if (response.promptFeedback?.blockReason) {
    const blockMessage = `Content generation for "${operationDescription}" was blocked by the API. Reason: ${response.promptFeedback.blockReason}.`;
    console.error(blockMessage, "Safety Ratings:", response.promptFeedback.safetyRatings);
    throw new Error(blockMessage);
  }

  const textOutput = response.text;

  // If textOutput is valid and non-empty, return it
  if (textOutput && textOutput.trim() !== '') {
    return textOutput;
  }

  // If textOutput is empty or whitespace, check candidates for more info
  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS") {
      const finishMessage = `Content generation for "${operationDescription}" stopped unexpectedly by the API. Reason: ${candidate.finishReason}.`;
      console.error(finishMessage, "Safety Ratings:", candidate.safetyRatings);
      throw new Error(finishMessage);
    }
  }
  
  const emptyResponseMessage = `The API returned an empty or invalid text response for "${operationDescription}" when content was expected.`;
  console.warn(emptyResponseMessage, "Full API Response:", response);
  throw new Error(emptyResponseMessage);
};

export const summarizeText = async (text: string, summaryLanguageName: string): Promise<string> => {
  const currentAi = getAiInstance();
  const operationDescription = `summarizing text in ${summaryLanguageName}`;
  if (!text.trim()) return "Please provide text to summarize.";
  if (!summaryLanguageName) return "Please select a language for the summary.";
  
  try {
    const prompt = `Please provide a concise summary of the following text, in ${summaryLanguageName}:

"${text}"

The summary should capture the main points and key information, presented in ${summaryLanguageName}. Ensure the entire summary is in ${summaryLanguageName}.`;
    
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return processGeminiResponse(response, operationDescription);
  } catch (error) {
    throw new Error(handleError(error, operationDescription));
  }
};

export const translateText = async (text: string, targetLanguageName: string): Promise<string> => {
  const currentAi = getAiInstance();
  const operationDescription = `translating text to ${targetLanguageName}`;
  if (!text.trim()) return "Please provide text to translate.";
  if (!targetLanguageName) return "Please select a target language.";

  try {
    const prompt = `Translate the following text to ${targetLanguageName}:

"${text}"

Provide only the translated text. Ensure the entire translation is in ${targetLanguageName}.`;

    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return processGeminiResponse(response, operationDescription);
  } catch (error) {
    throw new Error(handleError(error, operationDescription));
  }
};

export const diarizeText = async (text: string, numSpeakers: number, languageNameToUse: string): Promise<string> => {
  const currentAi = getAiInstance();
  if (!text.trim()) return "Please provide text for processing.";
  
  // languageNameToUse will always be a specific language name. 'auto' case is removed.
  const languageInstructions = `You are an expert in analyzing conversations and transcribing them accurately in ${languageNameToUse}.
Reformat the following raw transcript to:`;
  const punctuationAndGrammarLanguage = languageNameToUse;
  let operationDescription = `processing transcript in ${languageNameToUse}`;
  
  let speakerTaskInstructions = "";
  if (numSpeakers === 0) { // Auto-detect speakers
      speakerTaskInstructions = `   a. Automatically determine the number of distinct speakers in the conversation.
   b. Clearly identify and label turns for each detected speaker. Use labels like "Speaker 1:", "Speaker 2:", etc. Ensure each new speaker turn starts on a new line.`;
      operationDescription = `auto-detecting speakers and punctuating transcript in ${languageNameToUse}`;

  } else if (numSpeakers > 1) {
      speakerTaskInstructions = `   a. Clearly identify and label turns for approximately ${numSpeakers} distinct speakers. Use labels like "Speaker 1:", "Speaker 2:", ..., "Speaker N:". Ensure each new speaker turn starts on a new line.
   b. If it is difficult to distinguish the exact number of speakers requested, or the content doesn't clearly show that many speakers, do your best to segment by clear speaker shifts up to ${numSpeakers} speakers.`;
      operationDescription = `diarizing and punctuating transcript for ${numSpeakers} speakers in ${languageNameToUse}`;
  } else { // numSpeakers === 1
      speakerTaskInstructions = `   a. Do not add any speaker labels.`;
      operationDescription = `punctuating and correcting grammar in transcript in ${languageNameToUse}`;
  }

  const mainProcessingInstructions = `${speakerTaskInstructions}
   c. Add appropriate punctuation (periods, commas, question marks, exclamation points, etc.) according to ${punctuationAndGrammarLanguage} grammar rules to make the transcript easy to read.
   d. Correct any obvious grammatical errors if possible, while preserving the original meaning and ensuring it is in ${punctuationAndGrammarLanguage}.
   e. Ensure the entire output is in ${punctuationAndGrammarLanguage}.
   f. Do not add any extra commentary, introductions, or conclusions outside of the formatted and punctuated transcript itself. Just provide the refined transcript.`;

  const prompt = `${languageInstructions}
${mainProcessingInstructions}

Original Raw Transcript (assumed to be in or convertible to ${languageNameToUse}):
"""
${text}
"""`;
  
  try {
    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return processGeminiResponse(response, operationDescription);
  } catch (error) {
    throw new Error(handleError(error, operationDescription));
  }
};
