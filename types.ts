
export enum Module {
  INPUT = 'Input',
  IDF_CURVE = 'IDF Curves',
  LOT_CALCULATOR = '45x110 Lot C Calculator',
  COLLECTOR_STREET = 'Collector Street C Calculator',
  WEIGHTED_C = 'Weighted C Coef',
}

export interface ProjectMetadata {
  name: string;
  number: string;
  location: string;
  engineer: string;
  references: string;
}

export interface RainfallDepth {
  duration: string;
  [key: string]: string | number; // To accommodate dynamic return periods, e.g., '2-yr', '10-yr'
}

export interface IdfPoint {
  duration: number; // in minutes
  [key: string]: number; // return period intensities
}

export interface LotSurface {
  name: string;
  coverage: number;
  cValue: number;
}

export interface LotCalculatorData {
  minLotArea: number;
  lotWidth: number;
  lotDepth: number;
  frontYard: number;
  rearYard: number;
  sideYard: number;
  maxLotCoverage: number;
  surfaces: LotSurface[];
  c100Multiplier: number;
  c100Cap: number;
}

export interface CollectorSurface {
  name: string;
  width: number;
  cValue: number;
}

export interface CollectorStreetData {
  rwWidth: number;
  streetWidth: number;
  curbWidth: number;
  sidewalkWidth: number;
  parkwayWidth: number;
  medianWidth: number;
  surfaces: CollectorSurface[];
}

export interface SubbasinLandUse {
  name: string;
  c10: number;
}

export interface Subbasin {
  id: string;
  area: number;
  percentages: { [key: string]: number };
}

export interface WeightedCData {
  landUses: SubbasinLandUse[];
  subbasins: Subbasin[];
  c100Multiplier: number;
  c100Cap: number;
}

export interface Project {
  id: string;
  metadata: ProjectMetadata;
  rainfall: {
    returnPeriods: string[];
    depths: RainfallDepth[];
  };
  lotCalculator: LotCalculatorData;
  collectorStreet: CollectorStreetData;
  weightedC: WeightedCData;
}
