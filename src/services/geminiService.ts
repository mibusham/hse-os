import { GoogleGenAI, Type } from "@google/genai";

export interface SafetyAnalysisResult {
  mitigation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const getApiKey = (): string => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env?.API_KEY) ||
    'AIzaSyC0GFSI24-Icy4PiPI1lXSUy04riKR1CzE'
  );
};

/**
 * Analyzes a construction site finding for safety risks and mitigation strategies.
 */
export const analyzeSafetyFinding = async (description: string): Promise<SafetyAnalysisResult | null> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `As an experienced Construction Safety & Health Officer (SHO / SSS), analyze this site observation/finding: "${description}". Provide a brief actionable mitigation strategy (maximum 1 sentence) and a risk level ('Low', 'Medium', or 'High').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mitigation: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["mitigation", "riskLevel"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as SafetyAnalysisResult;
  } catch (error) {
    console.error("Error analyzing safety finding:", error);
    return null;
  }
};

/**
 * Suggests a specific safety training topic based on current site findings.
 */
export const suggestTrainingTopic = async (findings: string[]): Promise<string | null> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const findingsContext = findings.length > 0 
    ? `Current site findings: ${findings.join(", ")}.` 
    : "No major hazards reported today.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a certified Site Safety Supervisor. Based on these observations: ${findingsContext}, suggest ONE specific and relevant safety training topic for today's morning toolbox talk. Return ONLY the topic title in uppercase plain text.`,
    });

    return response.text?.trim() || "GENERAL WORKPLACE SAFETY AWARENESS";
  } catch (error) {
    console.error("Error suggesting training topic:", error);
    return "SAFETY INDUCTION & PPE REFRESHER";
  }
};

export interface ExtractedWorkerIdData {
  fullName?: string;
  passportNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  passportExpiry?: string;
  documentType?: 'Passport' | 'UNHCR' | 'NRIC' | 'Other';
}

export interface ExtractedWorkerPermitData {
  permitNumber?: string;
  permitExpiry?: string;
}

/**
 * Performs high-precision OCR and structured information extraction on worker documentation images
 * (Passport, NRIC, CIDB Green Card, UNHCR Card, Work Permit / PLKS / Visa).
 */
export const analyzeWorkerDocument = async (
  base64Data: string, 
  type: 'id' | 'permit'
): Promise<any> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  let promptText = "";
  
  if (type === 'permit') {
    promptText = `
      Analyze this Working Permit, Visa, or PLKS (Pas Lawatan Kerja Sementara) document image. 
      Extract the following details accurately into a pure JSON object:
      - permitNumber (string: the official permit or serial/pass number)
      - permitExpiry (string in standard ISO format YYYY-MM-DD: the expiration or valid until date)
      
      If you cannot identify a specific field, return null for that field. Return ONLY valid JSON.
    `;
  } else {
    promptText = `
      Analyze this official worker identification document. It may be a Passport bio page, CIDB Green Card, NRIC (MyKad), UNHCR Card, or Site Induction Form. 
      Extract the following details accurately into a pure JSON object:
      - fullName (string: full legal name in uppercase)
      - passportNumber (string: passport number or national ID / IC number)
      - nationality (string: worker country of citizenship e.g. Bangladesh, Indonesia, Myanmar, Nepal, Malaysia, etc.)
      - dateOfBirth (string in ISO format YYYY-MM-DD)
      - gender (string: exactly 'MALE' or 'FEMALE')
      - passportExpiry (string in ISO format YYYY-MM-DD: date of passport/ID expiration)
      - documentType (string: one of 'Passport', 'UNHCR', 'NRIC', or 'Other' based on clear visual evidence)
      
      If you cannot identify a specific field, return null for that field. Return ONLY valid JSON.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: promptText },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Document OCR Error:", error);
    throw error;
  }
};
