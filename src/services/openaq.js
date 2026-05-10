import axios from "axios";

const API_KEY = import.meta.env.VITE_WAQI_API_KEY;
const BASE_URL = "https://api.waqi.info";

const client = axios.create({
  baseURL: BASE_URL,
});

// ─────────────────────────────────────────
// Convert any city name → coordinates
// Uses OpenStreetMap Nominatim (free, no key)
// ─────────────────────────────────────────
async function getCityCoordinates(city) {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: city,
          format: "json",
          limit: 1,
          featuretype: "city",
          addressdetails: 1,
        },
        headers: {
          "Accept-Language": "en",
          "User-Agent": "VayuMap/1.0",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// 1. Search stations by city name (works for ANY Indian city!)
export async function fetchLocationsByCity(city) {
  try {
    // Step 1: Convert city name to coordinates
    console.log(`Getting coordinates for: ${city}`);
    const coords = await getCityCoordinates(city);

    if (!coords) {
      console.warn("Could not find coordinates for:", city);
      throw new Error(`City "${city}" not found`);
    }

    console.log(`Found coordinates:`, coords);

    // Step 2: Find AQI stations near those coordinates
    const stations = await fetchLocationsByCoords(coords.lat, coords.lon);

    if (stations.length === 0) {
      throw new Error(`No AQI stations found near ${city}`);
    }

    return stations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
}

// 2. Get latest measurements for a station
export async function fetchLatestMeasurements(stationId) {
  try {
    const response = await client.get(`/feed/@${stationId}/`, {
      params: { token: API_KEY },
    });

    if (response.data.status !== "ok") {
      throw new Error("API error");
    }

    const data = response.data.data;
    const iaqi = data.iaqi || {};

    return [
      { parameter: "pm25", value: iaqi.pm25?.v ?? null, unit: "µg/m³" },
      { parameter: "pm10", value: iaqi.pm10?.v ?? null, unit: "µg/m³" },
      { parameter: "no2",  value: iaqi.no2?.v  ?? null, unit: "µg/m³" },
      { parameter: "co",   value: iaqi.co?.v   ?? null, unit: "mg/m³"  },
      { parameter: "o3",   value: iaqi.o3?.v   ?? null, unit: "µg/m³" },
      { parameter: "so2",  value: iaqi.so2?.v  ?? null, unit: "µg/m³" },
    ].filter((m) => m.value !== null);
  } catch (error) {
    console.error("Error fetching measurements:", error);
    throw error;
  }
}

// 3. Get AQI number directly for a station
export async function fetchStationAQI(stationId) {
  try {
    const response = await client.get(`/feed/@${stationId}/`, {
      params: { token: API_KEY },
    });

    if (response.data.status !== "ok") return null;
    return response.data.data.aqi;
  } catch (error) {
    console.error("Error fetching AQI:", error);
    return null;
  }
}

// 4. Find stations near coordinates (radius search)
export async function fetchLocationsByCoords(lat, lon) {
  try {
    const response = await client.get("/map/bounds/", {
      params: {
        token: API_KEY,
        latlng: `${lat - 0.3},${lon - 0.3},${lat + 0.3},${lon + 0.3}`,
      },
    });

    if (response.data.status !== "ok") return [];

    const stations = response.data.data || [];

    return stations.map((station) => ({
      id: station.uid,
      name: station.station.name,
      coordinates: {
        latitude: station.lat,
        longitude: station.lon,
      },
      aqi: station.aqi === "-" ? null : parseInt(station.aqi),
      city: station.station.name,
    }));
  } catch (error) {
    console.error("Error fetching by coords:", error);
    return [];
  }
}