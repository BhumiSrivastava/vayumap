import { getAQILevel } from "../utils/aqiColors";

export default function HealthAdvisory({ aqi }) {
  // If no AQI data yet, show nothing
  if (aqi === null || aqi === undefined) return null;

  const level = getAQILevel(aqi);
  if (!level) return null;

  // Different advice for different groups of people
  const groupAdvice = [
    {
      group: "👶 Children",
      advice:
        aqi <= 50
          ? "Safe to play outside"
          : aqi <= 100
          ? "Outdoor play is okay"
          : aqi <= 150
          ? "Limit time outside"
          : "Stay indoors",
    },
    {
      group: "🧓 Elderly",
      advice:
        aqi <= 50
          ? "Great for outdoor walks"
          : aqi <= 100
          ? "Short walks are fine"
          : aqi <= 150
          ? "Avoid strenuous activity"
          : "Stay indoors",
    },
    {
      group: "🫁 Asthma / Heart",
      advice:
        aqi <= 50
          ? "No precautions needed"
          : aqi <= 100
          ? "Keep inhaler handy"
          : aqi <= 150
          ? "Avoid outdoor exercise"
          : "Stay indoors, use medication",
    },
    {
      group: "🏃 Healthy Adults",
      advice:
        aqi <= 50
          ? "Enjoy outdoor exercise"
          : aqi <= 100
          ? "Outdoor activity is fine"
          : aqi <= 150
          ? "Reduce intense exercise"
          : aqi <= 200
          ? "Avoid outdoor exercise"
          : "No outdoor activity",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: level.bgColor,
        border: `2px solid ${level.color}`,
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
      }}
    >
      {/* Title */}
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "15px",
          fontWeight: "700",
          color: level.textColor,
        }}
      >
        🏥 Health Advisory
      </h3>

      {/* Main advice text */}
      <p
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: level.textColor,
          lineHeight: "1.5",
        }}
      >
        {level.advice}
      </p>

      {/* Divider line */}
      <div
        style={{
          height: "1px",
          backgroundColor: level.color,
          opacity: 0.3,
          marginBottom: "14px",
        }}
      />

      {/* Per-group advice */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {groupAdvice.map(({ group, advice }) => (
          <div
            key={group}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.5)",
              borderRadius: "10px",
              padding: "8px 12px",
              gap: "10px",
            }}
          >
            {/* Group name */}
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: level.textColor,
                minWidth: "110px",
              }}
            >
              {group}
            </span>

            {/* Advice for that group */}
            <span
              style={{
                fontSize: "12px",
                color: level.textColor,
                textAlign: "right",
              }}
            >
              {advice}
            </span>
          </div>
        ))}
      </div>

      {/* Wear mask reminder if AQI is bad */}
      {aqi > 150 && (
        <div
          style={{
            marginTop: "14px",
            backgroundColor: level.color,
            borderRadius: "10px",
            padding: "10px 14px",
            textAlign: "center",
            color: "#fff",
            fontWeight: "700",
            fontSize: "13px",
          }}
        >
          😷 Wear an N95 mask outdoors
        </div>
      )}
    </div>
  );
}