import { GoogleGenAI } from '@google/genai';

const apiKey = 'AIzaSyC0GFSI24-Icy4PiPI1lXSUy04riKR1CzE';
const ai = new GoogleGenAI({ apiKey });

async function testOCR() {
  console.log("Testing image OCR with gemini-2.5-flash...");
  
  // 1x1 transparent png base64
  const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: "Analyze this image and return a JSON object with { status: 'tested_ok' }." },
          { inlineData: { mimeType: 'image/png', data: sampleBase64 } }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("OCR Result:", response.text);
  } catch (err) {
    console.error("OCR Error:", err);
  }
}

testOCR();
