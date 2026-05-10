import { useState, useEffect, useCallback } from "react";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";
import AQICard from "./components/AQICard";
import HealthAdvisory from "./components/HealthAdvisory";
import {
  fetchLocationsByCity,
  fetchLatestMeasurements,
  fetchLocationsByCoords,
  fetchStationAQI,
} from "./services/openaq";
import { getAQIFromMeasurements } from "./utils/aqiColors";
import "leaflet/dist/leaflet.css";
import "./App.css";

export default function App() {
  const [locations, setLocations]               = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [measurements, setMeasurements]         = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState(null);
  const [mapCenter, setMapCenter]               = useState([20.5937, 78.9629]);

  // ─────────────────────────────────────────
  // Search handler
  // ─────────────────────────────────────────
  const handleSearch = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    setSelectedLocation(null);
    setMeasurements([]);

    try {
      const locs = await fetchLocationsByCity(city);

      if (locs.length === 0) {
        setError(`No stations found for "${city}". Try another city.`);
        setLocations([]);
        return;
      }

      // Fetch AQI + measurements for all stations at once
      const enriched = await Promise.all(
        locs.map(async (loc) => {
          try {
            const m = await fetchLatestMeasurements(loc.id);
            const aqiData = await fetchStationAQI(loc.id);
            const aqi = aqiData || getAQIFromMeasurements(m);
            return { ...loc, measurements: m, aqi };
          } catch {
            return { ...loc, measurements: [], aqi: null };
          }
        })
      );

      setLocations(enriched);

      // Move map to first valid location
      const validLoc = enriched.find((l) => l.coordinates);
      if (validLoc?.coordinates) {
        setMapCenter([
          validLoc.coordinates.latitude,
          validLoc.coordinates.longitude,
        ]);
      }
    } catch (err) {
      setError("Something went wrong. Check your API key in .env file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────
  // Auto-location on page load
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLoading(true);
        try {
          const locs = await fetchLocationsByCoords(
            coords.latitude,
            coords.longitude
          );
          const enriched = await Promise.all(
            locs.map(async (loc) => {
              const m = await fetchLatestMeasurements(loc.id);
              const aqiData = await fetchStationAQI(loc.id);
              const aqi = aqiData || getAQIFromMeasurements(m);
              return { ...loc, measurements: m, aqi };
            })
          );
          setLocations(enriched);
          setMapCenter([coords.latitude, coords.longitude]);
        } catch {
          // silently fail
        } finally {
          setLoading(false);
        }
      },
      () => {} // user denied location
    );
  }, []);

  // ─────────────────────────────────────────
  // Marker click
  // ─────────────────────────────────────────
  const handleMarkerClick = useCallback((location) => {
    setSelectedLocation(location);
    setMeasurements(location.measurements || []);
  }, []);

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="brand">
          <span className="brand-logo">🌬️</span>
          <div>
            <h1 className="brand-title">VayuMap</h1>
            <p className="brand-sub">Live Air Quality · India</p>
          </div>
        </div>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </header>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <main className="main-layout">

        {/* LEFT: Map */}
        <div className="map-wrapper">
          <Map
            center={mapCenter}
            locations={locations}
            onMarkerClick={handleMarkerClick}
            selectedId={selectedLocation?.id}
          />
        </div>

        {/* RIGHT: Sidebar */}
        <aside className="sidebar">

          {/* Loading spinner */}
          {loading && (
            <div className="state-box">
              <div className="spinner" />
              <p>Fetching air quality data…</p>
            </div>
          )}

          {/* AQI Card + Health Advisory */}
          {!loading && selectedLocation && (
            <>
              <AQICard
                location={selectedLocation}
                measurements={measurements}
              />
              <HealthAdvisory aqi={selectedLocation.aqi} />
            </>
          )}

          {/* Hint: markers loaded but none clicked */}
          {!loading && !selectedLocation && locations.length > 0 && (
            <div className="state-box">
              <span style={{ fontSize: "32px" }}>📍</span>
              <p>Click any marker on the map to see AQI details</p>
            </div>
          )}

          {/* Hint: nothing searched yet */}
          {!loading && locations.length === 0 && !error && (
            <div className="state-box">
              <span style={{ fontSize: "32px" }}>🔍</span>
              <p>Search an Indian city above to get started</p>
            </div>
          )}

        </aside>
      </main>
    </div>
  );
}