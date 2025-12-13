const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateAnswer(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = generateAnswer;
