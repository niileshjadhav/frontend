// Enum-like constants using const assertions for better TypeScript support

export const Region = {
  APAC: "APAC",
  US: "US", 
  EU: "EU",
  MEA: "MEA"
} as const;

export type Region = typeof Region[keyof typeof Region];

// Helper functions to get enum values
export const getRegionOptions = () => {
  return Object.values(Region).map(region => ({
    value: region,
    label: region
  }));
};

// Type guards
export const isValidRegion = (region: string): region is Region => {
  return Object.values(Region).includes(region as Region);
};