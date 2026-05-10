import { useState } from "react";

const POPULAR_CITIES = [
  "Delhi",
  "Mumbai", 
  "Beijing",
  "London",
  "New York",
  "Tokyo",
  "Paris",
  "Dubai",
  "Sydney",
  "Cairo",
];

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }

  function handleChipClick(city) {
    setQuery(city);
    onSearch(city);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

      {/* Search input + button */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any city worldwide… e.g. Tokyo"
          disabled={loading}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "14px",
            outline: "none",
            width: "260px",
          }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            background: loading ? "#334155" : "#3b82f6",
            color: "#fff",
            fontWeight: "700",
            fontSize: "14px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      {/* Popular city chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handleChipClick(city)}
            disabled={loading}
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "12px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {city}
          </button>
        ))}
      </div>

    </div>
  );
}