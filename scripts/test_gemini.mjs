import { GoogleGenAI } from '@google/genai';

const apiKey = 'AIzaSyC0GFSI24-Icy4PiPI1lXSUy04riKR1CzE';
const ai = new GoogleGenAI({ apiKey });

async function testGemini() {
  console.log("Testing with API Key:", apiKey.slice(0, 10) + '...');
  
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  for (const model of modelsToTest) {
    console.log(`\nTesting model: ${model}...`);
    try {
      const res = await ai.models.generateContent({
        model: model,
        contents: "Hello, reply with OK"
      });
      console.log(`SUCCESS [${model}]:`, res.text?.trim());
    } catch (err) {
      console.error(`FAILED [${model}]:`, err.message || err);
    }
  }
}

testGemini();
