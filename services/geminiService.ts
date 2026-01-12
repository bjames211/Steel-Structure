
import { GoogleGenAI, Type } from "@google/genai";
import { BuildingAnalysis } from "../types";

export const analyzeBuildingImage = async (base64Images: string[]): Promise<BuildingAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const colorOptions = [
    "Charcoal", "Slate Blue", "Burnished Slate", "Forest Green", "Polar White",
    "Light Grey", "Desert Sand", "Crimson Red", "Hawaiian Blue", "Gallery Blue",
    "Colony Green", "Copper Penny", "Rustic Red", "Tan", "Brown", "Black",
    "Burgundy", "Clay", "Ash Grey", "Ivy Green"
  ].join(", ");

  const imageParts = base64Images.map(base64 => ({
    inlineData: {
      data: base64.split(',')[1],
      mimeType: 'image/jpeg'
    }
  }));

  const prompt = `Perform a high-precision industrial analysis of this metal building. 
  IMPORTANT: Look for structural BAY count (vertical frame lines/columns visible on the side walls). 
  Large buildings often have 5-10+ bays. Do not underestimate the scale if multiple bays are visible.

  FEATURES:
  - Count all garage doors and man doors.
  - Count STRUCTURAL BAYS (the vertical lines/panels that repeat along the length). 
  - Estimate the width of one bay (usually 20ft, 25ft, or 30ft).
  - Count total windows.

  DIMENSIONS & SCALE:
  - Use the BAY COUNT to calculate total Length (Length = Bay Count * Bay Width).
  - Use DOOR HEIGHT to estimate the building's Peak Height.
  - Estimate the Gable Side Width.
  - Provide a highly detailed 'estimationLogic' field explaining exactly how you arrived at these numbers (e.g., "Counted 7 bays on the left elevation, estimated at 22ft each, totaling ~154ft length").

  COLORS:
  - Identify Roof, Wall, Trim, and Wainscot colors from: [${colorOptions}].
  - Provide confidence levels for everything.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.OBJECT,
              properties: {
                roof: { type: Type.STRING },
                wall: { type: Type.STRING },
                trim: { type: Type.STRING },
                wainscot: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["roof", "wall", "trim", "wainscot", "confidence"]
            },
            features: {
              type: Type.OBJECT,
              properties: {
                garageDoors: {
                  type: Type.OBJECT,
                  properties: {
                    total: { type: Type.NUMBER },
                    breakdown: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          wall: { type: Type.STRING },
                          count: { type: Type.NUMBER }
                        },
                        required: ["wall", "count"]
                      }
                    }
                  },
                  required: ["total", "breakdown"]
                },
                manDoors: {
                  type: Type.OBJECT,
                  properties: {
                    total: { type: Type.NUMBER },
                    breakdown: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          wall: { type: Type.STRING },
                          count: { type: Type.NUMBER }
                        },
                        required: ["wall", "count"]
                      }
                    }
                  },
                  required: ["total", "breakdown"]
                },
                windows: { type: Type.NUMBER },
                bays: {
                  type: Type.OBJECT,
                  properties: {
                    count: { type: Type.NUMBER },
                    estimatedSpacingFeet: { type: Type.NUMBER }
                  },
                  required: ["count", "estimatedSpacingFeet"]
                },
                confidence: { type: Type.NUMBER }
              },
              required: ["garageDoors", "manDoors", "windows", "bays", "confidence"]
            },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                widthGableSideFeet: { type: Type.NUMBER },
                lengthFeet: { type: Type.NUMBER },
                peakHeightFeet: { type: Type.NUMBER },
                estimatedSquareFootage: { type: Type.NUMBER },
                estimationLogic: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["widthGableSideFeet", "lengthFeet", "peakHeightFeet", "estimatedSquareFootage", "estimationLogic", "confidence"]
            }
          },
          required: ["colors", "features", "dimensions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response.");
    return JSON.parse(text) as BuildingAnalysis;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Analysis failed. Try taking a photo showing the full length of the building to count the structural bays.");
  }
};
