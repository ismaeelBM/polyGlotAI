// Text to Text API Connector

// Import AI service modules, not individual functions
import * as geminiService from './geminiService';
// Import other AI services as they become available
// import * as openaiService from './openaiService';
// import * as claudeService from './claudeService';

// Global setting for which AI model to use
// This could be imported from a config file or set via user preferences
const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'gemini';

/**
 * Returns the appropriate AI service module based on the selected model
 * @returns {Object} - The AI service module containing standardized functions
 */
function getAIService() {
    switch(AI_MODEL.toLowerCase()) {
        case 'gemini':
            return geminiService;
        // Add cases for other AI models as they become available
        // case 'openai':
        //     return openaiService;
        // case 'claude':
        //     return claudeService;
        default:
            console.log(`Using default AI service: gemini`);
            return geminiService;
    }
}

// Calls the appropriate AI service to get highlights from the transcript
// Will call either Gemini, OpenAI, Claude API etc. depending on which AI is selected
export async function getHighlights(transcript) {
    const aiService = getAIService();

    const prompt = `Analyze this conversation in english. Extract the most up to date sentence/word that is currently being discussed.
    For that sentence/word, extract the translation that's being mentioned and give a json object with the following structure:

    {
      "words": 
        {
          "original": "example word",
          "translation": "translation here",
          "pronounciation": "Pronounciation of the word here"
        }
    }
    The pronounciation should be a phonetic transcription of the word using only english letters. DO NOT give any other outputs. If no words are being discussed, return null.
    Here is the transcript as a json object:
    ${JSON.stringify(transcript)}

    Make sure the json object you return is based on the latest thing being discussed. You can know what's the last thing being discussed by checking the last parts of the transcript.
    `;

    // Call the standardized function name that will exist in all AI service modules
    const response = await aiService.getResponsefromPrompt(prompt);
    
    console.log('response IN T2T SERVICE:', response);
    
    // Sanitize the response to extract only the JSON part
    const sanitizedResponse = sanitizeJsonResponse(response);
    
    try {
        return JSON.parse(sanitizedResponse);
    } catch (error) {
        console.error('Error parsing JSON response:', error);
        console.error('Failed to parse:', sanitizedResponse);
        // Return a default response if parsing fails
        return {
            words: {
                original: "Error parsing response",
                translation: "Please try again",
                pronounciation: ""
            }
        };
    }
}

export async function getSummary(transcript) {
    const aiService = getAIService();

    const prompt = `Analyze this conversation that's provided as a json object. It is a conversation between a language learner and a language tutor.
    Extract all the sentences that has been translated and its translation. Extract all the words that has been translated and its translation.
    Give a json object with the following structure:

    {
      "sentences": 
        [
          {
            "original": "sentence here",
            "translation": "translation here",
            "pronunciation": "Pronounciation of the sentence here"
          },
          ...
        ],
      "words": 
        [
          {
            "original": "word here",
            "translation": "translation here",
            "pronunciation": "Pronounciation of the word here"
          },
          ...
        ]
    }
    The pronounciation should be a phonetic transcription of the word using only english letters. 
    The words must contain all the words discussed in sentences but broken down into individual words.
    And any individual words that has been translated must also be included in the words array.
    If any words does not have a direct translation, do not include it in the words array.
    Only break down words and its translation if that translation is correct in an of itself without the context of the sentence.
    
    DO NOT give any other outputs. If no words are being discussed, return null.
    Here is the transcript as a json object:
    ${JSON.stringify(transcript)}
    
    Only give data on what has been translated. Do not give any other data.
    `;

    // Call the standardized function name that will exist in all AI service modules
    const response = await aiService.getResponsefromPrompt(prompt);
    
    console.log('response IN T2T SERVICE:', response);
    
    // Sanitize the response to extract only the JSON part
    const sanitizedResponse = sanitizeJsonResponse(response);
    
    try {
        return JSON.parse(sanitizedResponse);
    } catch (error) {
        console.error('Error parsing JSON response:', error);
        console.error('Failed to parse:', sanitizedResponse);
        // Return a default response if parsing fails
        return {
            words: {
                original: "Error parsing response",
                translation: "Please try again",
                pronounciation: ""
            }
        };
    }
}


/**
 * Sanitizes a response string to extract a valid JSON object
 * Handles cases where the JSON is wrapped in markdown code blocks
 * @param {string} response - The response string from the API
 * @returns {string} - A sanitized string containing only the JSON object
 */
function sanitizeJsonResponse(response) {
    if (!response) return "{}";
    
    // First, try to extract JSON from markdown code blocks
    const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
    const blockMatch = response.match(jsonBlockRegex);
    
    if (blockMatch && blockMatch[1]) {
        return blockMatch[1].trim();
    }
    
    // If no markdown blocks, try to find a JSON object in the string
    const jsonObjectRegex = /(\{[\s\S]*\})/;
    const objectMatch = response.match(jsonObjectRegex);
    
    if (objectMatch && objectMatch[1]) {
        return objectMatch[1].trim();
    }
    
    // If all else fails, return the original response
    return response.trim();
}
