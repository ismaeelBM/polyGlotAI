import { ParameterLocation } from './types';

function getSystemPrompt() {
  let sysPrompt = `
  You are a hindi language teacher.
  `;

  sysPrompt = sysPrompt.replace(/"/g, '\"').replace(/\n/g, '\n');

  return sysPrompt;
}

// No tools needed for a basic chat assistant
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
  }
};

export default demoConfig; 