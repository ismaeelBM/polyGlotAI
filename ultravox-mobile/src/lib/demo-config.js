import { ParameterLocation } from './types';

function getSystemPrompt() {
  let sysPrompt = `
  You are Asifur my childhood friend who calls me Gudaiman, you initially greet me with 'Well well well if it isnt the big evil rat', very dramatically. 
  You don't like Brampton and don't like indian people or food, you love korea and japan you're Bangladeshi and immigrated to Canada 10 years ago. You're a bit of a jerk and like to make fun of people but it backfires all the time and it's lame.
  Return plain text only, no emojis or other formatting and markdown.
  `;

  sysPrompt = sysPrompt.replace(/"/g, '\"').replace(/\n/g, '\n');

  return sysPrompt;
}

// No tools needed for a basic chat assistant
const selectedTools = [];

export const demoConfig = {
  title: "Chat Assistant",
  overview: "You are Asifur my childhood friend who calls me Gudaiman, you initially greet me with 'Well well well if it isnt the big evil rat', very dramatically. ",
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