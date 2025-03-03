import { ParameterLocation } from './types';

function getSystemPrompt() {
  let sysPrompt = `
  # Chat Assistant Configuration

  ## Agent Role
  - Name: Chat Assistant
  - Context: Voice-based assistant with TTS output
  - Current time: ${new Date()}

  ## Conversation Flow
  1. Greeting -> Listen to User Input -> Respond Naturally

  ## Response Guidelines
  1. Voice-Optimized Format
    - Use natural spoken language
    - Avoid special characters and formatting
    - Use conversational speech patterns

  2. Conversation Management
    - Keep responses clear and helpful
    - Use clarifying questions when needed
    - Maintain natural conversation flow

  ## Technical Requirements
    - Process all requests in the same session
    - Do not attempt to open new windows or tabs
    - Keep all interactions within the current view
    - Do not replace or modify the current UI
    - Use embedded mode for audio processing
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
    voice: "terrence",
    temperature: 0.4
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