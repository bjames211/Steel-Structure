
export interface ColorPaletteItem {
  name: string;
  hex: string;
}

export interface WallBreakdown {
  wall: string;
  count: number;
}

export interface FeatureDetail {
  total: number;
  breakdown: WallBreakdown[];
}

export interface DimensionRule {
  enabled: boolean;
  offset: number; // +/- adjustment
}

export interface WebsiteConfig {
  id: string;
  name: string;
  brand: string;
  phone: string;
  configuratorUrl: string;
  description: string;
  rules: {
    width: DimensionRule;
    length: DimensionRule;
    height: DimensionRule;
    allowRedIron: boolean;
    allowGalvanized: boolean;
    states: string[];
  };
}

export interface CreatedProduct {
  id: string;
  timestamp: number;
  sku: string;
  productTitleShort: string; // Punchy, unique display title
  productTitleLong: string;  // Detailed, SEO-rich title
  websiteId: string;
  websiteName: string;
  brand: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
    pitch: string;
  };
  colors: {
    roof: string;
    wall: string;
    trim: string;
    wainscot: string;
  };
  features: {
    garageDoors: number;
    manDoors: number;
    windows: number;
  };
  confidence: {
    sizing: number;
    colors: number;
  };
  description: string;
  state: string;
  imageUrl: string;
  fullAnalysis: BuildingAnalysis;
}

export interface VariableInsight {
  value: number | string;
  thought: string;
}

export interface FeatureInsight {
  total: number;
  thought: string;
}

export interface BuildingAnalysis {
  sku: string;
  productTitleShort: string;
  productTitleLong: string;
  variables: {
    width: VariableInsight;
    length: VariableInsight;
    wallHeight: VariableInsight;
    peakHeight: VariableInsight;
    pitch: VariableInsight;
  };
  colors: {
    roof: string;
    wall: string;
    trim: string;
    wainscot: string;
    thought: string;
  };
  features: {
    garageDoors: FeatureInsight;
    manDoors: FeatureInsight;
    windows: FeatureInsight;
    bays: FeatureInsight;
  };
  confidence: {
    sizing: number;
    colors: number;
    overall: number;
  };
  descriptions: {
    actualSalesCopy: string;
    templateMarkdown: string;
  };
  metadata: {
    detectedState: string;
  };
}

export type SteelFrameType = 'Red Iron' | 'Galvanized' | 'Both';

export interface AppState {
  mainImage: string | null;
  variantImage: string | null;
  video: string | null;
  loading: boolean;
  generatingImage: boolean;
  generatedVariantUrl: string | null;
  error: string | null;
  result: BuildingAnalysis | null;
  view: 'analysis' | 'settings' | 'inventory';
  websites: WebsiteConfig[];
  selectedWebsiteId: string;
  inventory: CreatedProduct[];
  editingProductId: string | null;
  viewingProductId: string | null; // Track which product is being viewed in detail
  settings: {
    steelFrame: SteelFrameType;
    state: string;
  };
  colorPalette: ColorPaletteItem[];
  queue: string[];
  autoProcess: boolean;
}
