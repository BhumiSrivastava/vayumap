// All AQI levels with colors and labels
export const AQI_LEVELS = [
  {
    min: 0,
    max: 50,
    label: "Good",
    color: "#00e400",
    bgColor: "#e8fce8",
    textColor: "#1a5e1a",
    emoji: "😊",
    advice: "Air quality is great! Enjoy outdoor activities freely.",
  },
  {
    min: 51,
    max: 100,
    label: "Moderate",
    color: "#ffff00",
    bgColor: "#fffde8",
    textColor: "#7a6e00",
    emoji: "😐",
    advice: "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.",
  },
  {
    min: 101,
    max: 150,
    label: "Unhealthy for Sensitive Groups",
    color: "#ff7e00",
    bgColor: "#fff3e0",
    textColor: "#7a3a00",
    emoji: "😷",
    advice: "Sensitive groups (children, elderly, asthma patients) should reduce outdoor activity.",
  },
  {
    min: 151,
    max: 200,
    label: "Unhealthy",
    color: "#ff0000",
    bgColor: "#ffe8e8",
    textColor: "#7a0000",
    emoji: "🤧",
    advice: "Everyone may begin to experience health effects. Wear a mask outdoors. Limit outdoor activity.",
  },
  {
    min: 201,
    max: 300,
    label: "Very Unhealthy",
    color: "#8f3f97",
    bgColor: "#f5e8f7",
    textColor: "#4a1f50",
    emoji: "🚨",
    advice: "Health alert! Everyone should avoid prolonged outdoor exertion. Stay indoors if possible.",
  },
  {
    min: 301,
    max: Infinity,
    label: "Hazardous",
    color: "#7e0023",
    bgColor: "#fce8ed",
    textColor: "#4a0015",
    emoji: "☠️",
    advice: "Emergency conditions. Everyone should avoid ALL outdoor activity. Keep windows closed.",
  },
];

// Give it an AQI number → get back the full level object
export function getAQILevel(aqi) {
  if (aqi === null || aqi === undefined) return null;
  return AQI_LEVELS.find((level) => aqi >= level.min && aqi <= level.max)
    || AQI_LEVELS[AQI_LEVELS.length - 1];
}

// Give it an AQI number → get just the hex color string
export function getAQIColor(aqi) {
  const level = getAQILevel(aqi);
  return level ? level.color : "#cccccc";
}

// Convert raw PM2.5 µg/m³ value → AQI number (US EPA formula)
export function pm25ToAQI(pm25) {
  if (pm25 === null || pm25 === undefined || isNaN(pm25)) return null;

  const breakpoints = [
    { pmLow: 0.0,   pmHigh: 12.0,  aqiLow: 0,   aqiHigh: 50  },
    { pmLow: 12.1,  pmHigh: 35.4,  aqiLow: 51,  aqiHigh: 100 },
    { pmLow: 35.5,  pmHigh: 55.4,  aqiLow: 101, aqiHigh: 150 },
    { pmLow: 55.5,  pmHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
    { pmLow: 150.5, pmHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
    { pmLow: 250.5, pmHigh: 500.4, aqiLow: 301, aqiHigh: 500 },
  ];

  const bp = breakpoints.find((b) => pm25 >= b.pmLow && pm25 <= b.pmHigh);
  if (!bp) return pm25 > 500 ? 500 : 0;

  return Math.round(
    ((bp.aqiHigh - bp.aqiLow) / (bp.pmHigh - bp.pmLow)) *
      (pm25 - bp.pmLow) +
      bp.aqiLow
  );
}

// Look through a measurements array → return one AQI number
export function getAQIFromMeasurements(measurements) {
  if (!measurements || measurements.length === 0) return null;

  // Best case: use PM2.5
  const pm25 = measurements.find(
    (m) => m.parameter === "pm25" || m.parameter === "pm2.5"
  );
  if (pm25?.value != null) return pm25ToAQI(pm25.value);

  // Fallback: use PM10 (rough estimate)
  const pm10 = measurements.find((m) => m.parameter === "pm10");
  if (pm10?.value != null) return Math.round(pm10.value * 0.7);

  return null;
}