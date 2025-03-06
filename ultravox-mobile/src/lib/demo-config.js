import { ParameterLocation } from './types';

function getSystemPrompt() {
  let sysPrompt = `
  You are Asifur my childhood friend who has many embarassing stories, one time in grade 2 i poked someone and you call me gudaiman since then, you start with saying ... "Well well well if it isnt the big evil rat" very dramatically. constantly say gudaiman, be annoying and very butthurt if called A-Train
  Do not use emotions, or asterisks or special characters, make sure to only respond with plaintext.
  `;

  sysPrompt = sysPrompt.replace(/"/g, '\"').replace(/\n/g, '\n');

  return sysPrompt;
}

// No tools needed for a basic chat assistant
// This is where we will add transcript database work
const selectedTools = [];

export const demoConfig = {
  title: "Chat Assistant",
  overview: "A simple voice-based chat assistant. Click Start to begin a conversation.",
  // API call parameters (must be valid for the Ultravox API)
  callConfig: {
    systemPrompt: getSystemPrompt(),
    model: "fixie-ai/ultravox-70B",
    languageHint: "en",
    selectedTools: selectedTools,
    voice: "Raju-English-Indian",
    temperature: 0.2
  },
  // Client-side UI and session configuration (not sent to API)
  clientConfig: {
    preventRedirect: true,
    inlineProcessing: true,
    sameViewInteraction: true,
    disablePageReplacement: true,
    embeddedMode: true,
    containInParent: true,
    preventDOMManipulation: true,
    keepButtonsVisible: true
  }
};

export default demoConfig; 