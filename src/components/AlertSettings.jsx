import { useState } from "react";

export default function AlertSettings({ onSetAlert, activeAlert }) {
  const [city, setCity]           = useState("");
  const [threshold, setThreshold] = useState(150);
  const [saved, setSaved]         = useState(false);

  function handleSave() {
    if (!city.trim()) return;

    // Ask for browser notification permission
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        onSetAlert({ city: city.trim(), threshold: Number(threshold) });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Please allow notifications in your browser to use this feature!");
      }
    });
  }

  function handleClear() {
    onSetAlert(null);
    setCity("");
    setThreshold(150);
  }

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "16px",
      padding: "20px",
      border: "1px solid var(--border)",
    }}>
      {/* Title */}
      <h3 style={{
        fontSize: "13px",
        fontWeight: "700",
        color: "var(--text-secondary)",
        marginBottom: "16px",
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}>
        🔔 AQI Alert
      </h3>

      {/* Active alert badge */}
      {activeAlert && (
        <div style={{
          background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.4)",
          borderRadius: "10px",
          padding: "10px 14px",
          marginBottom: "14px",
          fontSize: "12px",
          color: "#60a5fa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>
            ✅ Watching <strong>{activeAlert.city}</strong> — AQI &gt; {activeAlert.threshold}
          </span>
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* City input */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          display: "block",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          City to Watch
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Delhi, Mumbai, London"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
            fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      {/* Threshold slider */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          display: "block",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Alert when AQI exceeds:
          <span style={{
            color: threshold > 200 ? "#8f3f97"
                 : threshold > 150 ? "#ff0000"
                 : threshold > 100 ? "#ff7e00"
                 : threshold > 50  ? "#ffff00"
                 : "#00e400",
            fontWeight: "800",
            fontSize: "16px",
            marginLeft: "8px",
          }}>
            {threshold}
          </span>
        </label>
        <input
          type="range"
          min="50"
          max="300"
          step="10"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          style={{
            width: "100%",
            accentColor: "#3b82f6",
            cursor: "pointer",
          }}
        />
        {/* Scale labels */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "var(--text-muted)",
          marginTop: "4px",
        }}>
          <span style={{ color: "#00e400" }}>50 Good</span>
          <span style={{ color: "#ff7e00" }}>150</span>
          <span style={{ color: "#8f3f97" }}>300 Hazardous</span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!city.trim()}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: city.trim()
            ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
            : "var(--bg-secondary)",
          color: city.trim() ? "#fff" : "var(--text-muted)",
          fontWeight: "700",
          fontSize: "14px",
          cursor: city.trim() ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
        }}
      >
        {saved ? "✅ Alert Set!" : "🔔 Set Alert"}
      </button>
    </div>
  );
}