export default function PollutantChart({ measurements }) {
  if (!measurements || measurements.length === 0) return null;

  const pollutants = [
    { key: "pm25", label: "PM2.5", color: "#f87171", max: 300 },
    { key: "pm10", label: "PM10",  color: "#fb923c", max: 400 },
    { key: "no2",  label: "NO₂",   color: "#facc15", max: 200 },
    { key: "co",   label: "CO",    color: "#a78bfa", max: 10  },
    { key: "o3",   label: "O₃",    color: "#34d399", max: 200 },
    { key: "so2",  label: "SO₂",   color: "#60a5fa", max: 200 },
  ];

  function findValue(key) {
    const found = measurements.find(
      (m) => m.parameter === key || m.parameter?.includes(key)
    );
    return found?.value != null ? parseFloat(found.value.toFixed(2)) : null;
  }

  const data = pollutants
    .map(({ key, label, color, max }) => ({
      label,
      color,
      max,
      value: findValue(key),
    }))
    .filter((d) => d.value !== null);

  if (data.length === 0) {
    return (
      <div style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid var(--border)",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "13px",
      }}>
        📊 No pollutant data available for this station
      </div>
    );
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
        marginBottom: "20px",
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}>
        📊 Pollutant Levels
      </h3>

      {/* Pure CSS Bars */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        {data.map(({ label, color, value, max }) => {
          // Calculate width percentage (cap at 100%)
          const pct = Math.min((value / max) * 100, 100);

          return (
            <div key={label}>
              {/* Label + Value */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}>
                <span style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color,
                }}>
                  {label}
                </span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}>
                  {value} µg/m³
                </span>
              </div>

              {/* Bar Track */}
              <div style={{
                width: "100%",
                height: "8px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "99px",
                overflow: "hidden",
              }}>
                {/* Bar Fill */}
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${color}99, ${color})`,
                  borderRadius: "99px",
                  transition: "width 0.8s ease",
                  boxShadow: `0 0 8px ${color}60`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}