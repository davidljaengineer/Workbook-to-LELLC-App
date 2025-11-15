
export const RAINFALL_DURATIONS = [
  '5-min', '10-min', '15-min', '30-min', '60-min', '2-hr', '3-hr', '6-hr', '12-hr', '24-hr'
];

export const DURATION_TO_MINUTES: { [key: string]: number } = {
  '5-min': 5,
  '10-min': 10,
  '15-min': 15,
  '30-min': 30,
  '60-min': 60,
  '2-hr': 120,
  '3-hr': 180,
  '6-hr': 360,
  '12-hr': 720,
  '24-hr': 1440,
};
