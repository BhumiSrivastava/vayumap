import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { getAQIColor, getAQILevel } from "../utils/aqiColors";

// This helper component moves the map when center changes
function MapController({ center, locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const validLoc = locations.find(l => l.coordinates);
      if (validLoc?.coordinates) {
        map.flyTo(
          [validLoc.coordinates.latitude, validLoc.coordinates.longitude],
          11,
          { duration: 1.5 }
    
        );
      }
    }
  }, [locations]);

  return null;
}

export default function Map({ center, locations, onMarkerClick, selectedId }) {
  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* Auto zoom controller */}
      <MapController center={center} locations={locations} />

      {/* Draw a circle for each location */}
      {locations.map((location) => {
        if (!location.coordinates) return null;

        const lat = location.coordinates.latitude;
        const lon = location.coordinates.longitude;
        const aqi = location.aqi;
        const color = getAQIColor(aqi);
        const level = getAQILevel(aqi);
        const isSelected = location.id === selectedId;

        return (
          <CircleMarker
            key={location.id}
            center={[lat, lon]}
            radius={isSelected ? 20 : 14}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.9,
              color: isSelected ? "#ffffff" : "#333",
              weight: isSelected ? 3 : 1,
            }}
            eventHandlers={{
              click: () => onMarkerClick(location),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <div style={{ textAlign: "center", minWidth: "130px" }}>
                <strong>{location.name}</strong>
                <br />
                {aqi !== null ? (
                  <>
                    <span style={{ color: color, fontWeight: "bold" }}>
                      AQI: {aqi}
                    </span>
                    <br />
                    <span>{level?.emoji} {level?.label}</span>
                  </>
                ) : (
                  <span style={{ color: "#999" }}>No data available</span>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}