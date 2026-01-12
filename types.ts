
export interface WallBreakdown {
  wall: string;
  count: number;
}

export interface FeatureDetail {
  total: number;
  breakdown: WallBreakdown[];
}

export interface BuildingAnalysis {
  colors: {
    roof: string;
    wall: string;
    trim: string;
    wainscot: string;
    confidence: number;
  };
  features: {
    garageDoors: FeatureDetail;
    manDoors: FeatureDetail;
    windows: number;
    bays: {
      count: number;
      estimatedSpacingFeet: number;
    };
    confidence: number;
  };
  dimensions: {
    widthGableSideFeet: number;
    lengthFeet: number;
    peakHeightFeet: number;
    estimatedSquareFootage: number;
    estimationLogic: string;
    confidence: number;
  };
}

export interface AppState {
  images: string[];
  loading: boolean;
  error: string | null;
  result: BuildingAnalysis | null;
}
