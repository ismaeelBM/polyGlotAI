const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Makes a request to Gemini API and returns the response
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {string} - The text response from Gemini
 */
export async function getResponsefromPrompt(prompt) {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
}