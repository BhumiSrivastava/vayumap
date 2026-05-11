import { useState, useEffect, useCallback } from "react";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";
import AQICard from "./components/AQICard";
import HealthAdvisory from "./components/HealthAdvisory";
import PollutantChart from "./components/PollutantChart";
import AlertSettings from "./components/AlertSettings";
import useAQIAlert from "./hooks/useAQIAlert";
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
  const [activeTab, setActiveTab]               = useState("info");

  // AQI Alert hook
  const { activeAlert, setActiveAlert, alertLog } = useAQIAlert();

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
      () => {}
    );
  }, []);

  // ─────────────────────────────────────────
  // Marker click
  // ─────────────────────────────────────────
  const handleMarkerClick = useCallback((location) => {
    setSelectedLocation(location);
    setMeasurements(location.measurements || []);
    setActiveTab("info");
  }, []);

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="brand">
          <span className="brand-logo">🌬️</span>
          <div>
            <h1 className="brand-title">VayuMap</h1>
            <p className="brand-sub">Live Air Quality · Worldwide 🌍</p>
          </div>
        </div>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </header>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="error-banner">⚠️ {error}</div>
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

          {/* ── Tabs ── */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "12px",
            flexShrink: 0,
          }}>
            {[
              { id: "info",  label: "📊 Info"    },
              { id: "alert", label: "🔔 Alerts"  },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === tab.id
                    ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                    : "var(--bg-card)",
                  color: activeTab === tab.id
                    ? "#fff"
                    : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── INFO TAB ── */}
          {activeTab === "info" && (
            <>
              {loading && (
                <div className="state-box">
                  <div className="spinner" />
                  <p>Fetching air quality data…</p>
                </div>
              )}

              {!loading && selectedLocation && (
                <div className="fade-in">
                  <AQICard
                    location={selectedLocation}
                    measurements={measurements}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <HealthAdvisory aqi={selectedLocation.aqi} />
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <PollutantChart measurements={measurements} />
                  </div>
                </div>
              )}

              {!loading && !selectedLocation && locations.length > 0 && (
                <div className="state-box">
                  <span style={{ fontSize: "32px" }}>📍</span>
                  <p>Click any marker on the map to see AQI details</p>
                </div>
              )}

              {!loading && locations.length === 0 && !error && (
                <div className="state-box">
                  <span style={{ fontSize: "32px" }}>🔍</span>
                  <p>Search any city worldwide to get started</p>
                </div>
              )}
            </>
          )}

          {/* ── ALERTS TAB ── */}
          {activeTab === "alert" && (
            <div className="fade-in">
              <AlertSettings
                onSetAlert={setActiveAlert}
                activeAlert={activeAlert}
              />

              {/* Alert Log */}
              {alertLog.length > 0 && (
                <div style={{
                  marginTop: "12px",
                  background: "var(--bg-card)",
                  borderRadius: "16px",
                  padding: "16px",
                  border: "1px solid var(--border)",
                }}>
                  <h3 style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}>
                    📋 Recent Checks
                  </h3>
                  {alertLog.map((log, i) => (
                    <div key={i} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: i < alertLog.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                      fontSize: "12px",
                    }}>
                      <div>
                        <span style={{
                          color: log.triggered ? "#f87171" : "#34d399",
                          fontWeight: "700",
                          marginRight: "6px",
                        }}>
                          {log.triggered ? "⚠️" : "✅"}
                        </span>
                        <span style={{ color: "var(--text-primary)" }}>
                          {log.city}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}>
                        <span style={{
                          color: log.triggered ? "#f87171" : "#34d399",
                          fontWeight: "700",
                        }}>
                          AQI: {log.aqi}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {log.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </aside>
      </main>
    </div>
  );
}