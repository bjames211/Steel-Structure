
import { GoogleGenAI, Type } from "@google/genai";
import { BuildingAnalysis, ColorPaletteItem } from "../types";

export const analyzeBuildingImage = async (
  mainImage: string, 
  variantImage?: string, 
  video?: string,
  customPalette?: ColorPaletteItem[],
  brandName: string = "SteelStructure AI",
  brandPhone: string = "Contact Support",
  configuratorUrl: string = "https://configurator.yoursite.com"
): Promise<BuildingAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const paletteString = customPalette 
    ? customPalette.map(c => c.name).join(", ")
    : "Charcoal, Slate Blue, Burnished Slate, Forest Green, Polar White, Light Grey, Desert Sand, Crimson Red, Hawaiian Blue, Gallery Blue, Colony Green, Copper Penny, Rustic Red, Tan, Brown, Black, Burgundy, Clay, Ash Grey, Ivy Green";

  const prompt = `Perform an elite architectural audit and SEO generation for a metal building under the brand: "${brandName}".
  
  CORE DIMENSIONS & REASONING:
  - Detect Width, Length, Wall Height, Peak Height, and Roof Pitch.
  - For EVERY variable, provide a 'thought' explaining your calculation.
  
  ARCHITECTURAL FINISHES:
  - Map colors strictly to this palette: [${paletteString}].
  
  UNIQUE TITLE STRATEGY:
  - Generate two distinct titles with immense "character" and architectural flair.
  - DO NOT use generic names. Use a "Series Name" approach (e.g., Titan, Sentinel, Apex, Zenith, Ironclad, Heritage).
  - productTitleShort: (3-5 words) A punchy, memorable name. (e.g., "The Midnight Sentinel {WIDTH}x{LENGTH}")
  - productTitleLong: (8-12 words) A descriptive, SEO-optimized title. (e.g., "The ${brandName} Zenith Series {WIDTH}x{LENGTH} Triple-Bay Heavy Duty Workshop in {COLOR_WALL}")

  WORLD-CLASS SALES TEMPLATE:
  Both 'actualSalesCopy' and 'templateMarkdown' must follow this EXACT structure:

  # {TITLE_LONG}
  
  ## Precision Engineering meets Architectural Excellence
  {A powerful opening paragraph (3-4 sentences) describing the building's aesthetic dominance and structural integrity. Explain how this specific configuration provides the ultimate solution for storage, workspace, or commercial utility.}
  
  ## Verified Structural Specifications
  - **Overall Sizing:** {WIDTH}' Width x {LENGTH}' Length
  - **Vertical Clearance:** {HEIGHT}' Side Walls
  - **Roof System:** High-Strength {PITCH} Pitch Design
  
  ## Elite Finish & Palette
  - **Main Wall Finish:** {COLOR_WALL}
  - **Roof Finish:** {COLOR_ROOF}
  - **Trim & Accents:** {COLOR_TRIM}
  - **Protective Wainscot:** {COLOR_WAINSCOT}
  
  ## Access & Functional Features
  - **Industrial Roll-up Doors:** {GARAGE_COUNT}
  - **Personnel Entry:** {MAN_DOOR_COUNT}
  - **Natural Lighting (Windows):** {WINDOW_COUNT}
  
  ## The ${brandName} Promise
  {A paragraph detailing why customers choose ${brandName}. Mention 26ga or 29ga steel quality, precision pre-punching, and the brand's commitment to durability in extreme weather.}
  
  ## Tailor This Structure to Your Vision
  Love this design but need to adjust the dimensions or color scheme? You can customize every inch of this building online.
  - **Modify Online:** ${configuratorUrl}
  - **Speak with a Specialist:** ${brandPhone}
  - **Brand Portal:** Visit the official ${brandName} website for more information.

  OUTPUT INSTRUCTIONS:
  1. 'actualSalesCopy': Fill the template with ACTUAL detected data and the LONG title.
  2. 'templateMarkdown': Use placeholders like {TITLE_SHORT}, {TITLE_LONG}, {WIDTH}, {LENGTH}, {HEIGHT}, {PITCH}, {COLOR_ROOF}, {COLOR_WALL}, {COLOR_TRIM}, {COLOR_WAINSCOT}, {GARAGE_COUNT}, {MAN_DOOR_COUNT}, {WINDOW_COUNT}, {BRAND}, {PHONE}, and {URL}.
  
  CONFIDENCE:
  - Score 'sizing' and 'colors' from 0 to 1.
  
  Return a valid JSON object matching the requested schema exactly.`;

  const parts: any[] = [
    { text: prompt },
    { inlineData: { data: mainImage.split(',')[1], mimeType: 'image/jpeg' } }
  ];

  if (variantImage) {
    parts.push({ inlineData: { data: variantImage.split(',')[1], mimeType: 'image/jpeg' } });
  }

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
                windows: { type: Type.OBJECT, properties: { total: { type: Type.NUMBER }, thought: { type: Type.STRING } }, required: ["total", "thought"] },
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
  const prompt = `Architectural 3D render of a metal building: ${analysis.variables.width.value}'x${analysis.variables.length.value}'x${analysis.variables.wallHeight.value}'. Colors: ${analysis.colors.roof} and ${analysis.colors.wall}. Photorealistic, high quality.`;
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
