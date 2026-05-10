import { getAQILevel } from "../utils/aqiColors";

export default function AQICard({ location, measurements }) {
  const aqi = location?.aqi;
  const level = getAQILevel(aqi);

  // Format the timestamp nicely
  function formatTime(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Get value of a specific pollutant from measurements array
  function getPollutant(name) {
    const found = measurements.find((m) => m.parameter === name);
    if (!found || found.value === null) return "—";
    return `${found.value.toFixed(1)} ${found.unit || "µg/m³"}`;
  }

  // Get the latest timestamp from measurements
  function getLatestTime() {
    if (!measurements || measurements.length === 0) return null;
    const times = measurements
      .map((m) => new Date(m.date?.utc || m.date))
      .filter((d) => !isNaN(d));
    if (times.length === 0) return null;
    return new Date(Math.max(...times));
  }

  const latestTime = getLatestTime();

  return (
    <div
      style={{
        backgroundColor: level?.bgColor || "#f5f5f5",
        border: `2px solid ${level?.color || "#ccc"}`,
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
      }}
    >
      {/* Station name */}
      <p style={{ color: "#666", fontSize: "13px", margin: "0 0 4px 0" }}>
        📍 {location.city || "India"}
      </p>
      <h2
        style={{
          color: "#222",
          fontSize: "15px",
          margin: "0 0 16px 0",
          fontWeight: "600",
        }}
      >
        {location.name}
      </h2>

      {/* Big AQI number */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: level?.color || "#333",
            lineHeight: 1,
          }}
        >
          {aqi !== null && aqi !== undefined ? aqi : "—"}
        </div>
        <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
          AQI Index
        </div>

        {/* Level badge */}
        {level && (
          <div
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "6px 16px",
              borderRadius: "20px",
              backgroundColor: level.color,
              color:
                level.label === "Moderate" ? level.textColor : "#fff",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            {level.emoji} {level.label}
          </div>
        )}
      </div>

      {/* Pollutant readings grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        {[
          { key: "pm25",  label: "PM2.5" },
          { key: "pm10",  label: "PM10"  },
          { key: "no2",   label: "NO₂"   },
          { key: "co",    label: "CO"    },
          { key: "o3",    label: "O₃"    },
          { key: "so2",   label: "SO₂"   },
        ].map(({ key, label }) => (
          <div
            key={key}
            style={{
              backgroundColor: "rgba(255,255,255,0.6)",
              borderRadius: "10px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}
            >
              {label}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>
              {getPollutant(key)}
            </div>
          </div>
        ))}
      </div>

      {/* Last updated time */}
      {latestTime && (
        <p
          style={{
            fontSize: "11px",
            color: "#999",
            textAlign: "center",
            margin: 0,
          }}
        >
          🕐 Updated: {formatTime(latestTime)}
        </p>
      )}
    </div>
  );
}