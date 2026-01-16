
import { GoogleGenAI, Type } from "@google/genai";
import { BuildingAnalysis, ColorPaletteItem } from "../types";

export const analyzeBuildingImage = async (
  mainImage: string, 
  variantImage?: string, 
  video?: string,
  customPalette?: ColorPaletteItem[],
  brandName: string = "SteelDirect",
  brandPhone: string = "888-555-0100",
  configuratorUrl: string = "https://build.steeldirect.com"
): Promise<BuildingAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const paletteString = customPalette 
    ? customPalette.map(c => c.name).join(", ")
    : "Charcoal, Slate Blue, Burnished Slate, Forest Green, Polar White, Light Grey, Desert Sand, Crimson Red, Hawaiian Blue, Gallery Blue, Colony Green, Copper Penny, Rustic Red, Tan, Brown, Black, Burgundy, Clay, Ash Grey, Ivy Green";

  const prompt = `Act as an Elite Architectural Consultant and Conversion Marketing Specialist for ${brandName}.
  
  TASK: Perform a technical audit and generate a high-conversion e-commerce product package for the metal building in the image.

  CHARACTERFUL TITLING STRATEGY:
  - Generate a unique, bold "Series Identity" based on the building's visual character (e.g., The Ironside, The Cobalt Peak, The Obsidian Vault, The Heritage Barn, The Industrial Titan, The Obsidian Sentinel).
  - DO NOT be generic. Use evocative, premium-sounding architectural names.
  - productTitleShort: Must be punchy. Include the Series Name and basic dimensions (e.g., "The Ironside 40x60").
  - productTitleLong: An SEO-optimized masterpiece that captures the essence of the structure (e.g., "The ${brandName} Cobalt Series: 40x80x16 Custom Industrial Steel Workshop with Premium Wainscot & Dual-Access Systems").

  MARKETING STRATEGY (actualSalesCopy):
  Write professional, persuasive copy following these rules:
  1. **The Hook**: Start with a high-impact opening paragraph about structural permanence, engineering excellence, and aesthetic dominance.
  2. **Variant & Customization Strategy**: Explicitly state: "The structure shown represents a base configuration. Our engineering team specializes in total customization. Sizes (Width, Length, Height), Roof Pitches, and Accessories are all fully modular."
  3. **Call to Action**: Include a strong directive: "Every detail—from color palette to garage door placement—is customizable for your specific personal needs. Contact our specialists at ${brandPhone} or build your own variant at ${configuratorUrl}."
  4. **SEO & Paid Search Focus**: Integrate terms like "Pre-engineered metal building variants", "Custom steel garage kits", and "Climate-certified industrial storage".

  DYNAMIC MARKDOWN TEMPLATE (templateMarkdown):
  Produce a markdown template using variables in brackets: {TITLE_LONG}, {WIDTH}, {LENGTH}, {HEIGHT}, {PITCH}, {COLOR_ROOF}, {COLOR_WALL}, {COLOR_TRIM}, {COLOR_WAINSCOT}, {GARAGE_COUNT}, {MAN_DOOR_COUNT}, {WINDOW_COUNT}, {BRAND}, {PHONE}, {URL}.
  This allows the same high-conversion copy to work across thousands of size and color variants.

  Return a valid JSON object matching the requested schema.`;

  const parts: any[] = [
    { text: prompt },
    { inlineData: { data: mainImage.split(',')[1], mimeType: 'image/jpeg' } }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sku: { type: Type.STRING },
            productTitleShort: { type: Type.STRING },
            productTitleLong: { type: Type.STRING },
            variables: {
              type: Type.OBJECT,
              properties: {
                width: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["value", "thought"] },
                length: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["value", "thought"] },
                wallHeight: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["value", "thought"] },
                peakHeight: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["value", "thought"] },
                pitch: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, thought: { type: Type.STRING } }, required: ["value", "thought"] }
              },
              required: ["width", "length", "wallHeight", "peakHeight", "pitch"]
            },
            colors: {
              type: Type.OBJECT,
              properties: {
                roof: { type: Type.STRING },
                wall: { type: Type.STRING },
                trim: { type: Type.STRING },
                wainscot: { type: Type.STRING },
                thought: { type: Type.STRING }
              },
              required: ["roof", "wall", "trim", "wainscot", "thought"]
            },
            features: {
              type: Type.OBJECT,
              properties: {
                garageDoors: { type: Type.OBJECT, properties: { total: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["total", "thought"] },
                manDoors: { type: Type.OBJECT, properties: { total: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["total", "thought"] },
                windows: { type: Type.OBJECT, properties: { total: { type: Type.NUMBER }, depth: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["total", "thought"] },
                bays: { type: Type.OBJECT, properties: { count: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["count", "thought"] }
              },
              required: ["garageDoors", "manDoors", "windows", "bays"]
            },
            confidence: {
              type: Type.OBJECT,
              properties: {
                sizing: { type: Type.NUMBER },
                colors: { type: Type.NUMBER },
                overall: { type: Type.NUMBER }
              },
              required: ["sizing", "colors", "overall"]
            },
            descriptions: {
              type: Type.OBJECT,
              properties: {
                actualSalesCopy: { type: Type.STRING },
                templateMarkdown: { type: Type.STRING }
              },
              required: ["actualSalesCopy", "templateMarkdown"]
            },
            metadata: {
              type: Type.OBJECT,
              properties: {
                detectedState: { type: Type.STRING }
              },
              required: ["detectedState"]
            }
          },
          required: ["sku", "productTitleShort", "productTitleLong", "variables", "colors", "features", "confidence", "descriptions", "metadata"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI response was empty.");
    return JSON.parse(text) as BuildingAnalysis;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const generate3DVariant = async (analysis: BuildingAnalysis): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Architectural photorealistic 3D render of a steel structure, ${analysis.variables.width.value}x${analysis.variables.length.value}x${analysis.variables.wallHeight.value}, finish in ${analysis.colors.wall} with ${analysis.colors.roof} roof. Professional lighting, 4k detail.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part) throw new Error("No image generated");
    return `data:image/png;base64,${part.inlineData?.data}`;
  } catch (e) {
    throw e;
  }
};
