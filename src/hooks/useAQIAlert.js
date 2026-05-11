import { useState, useEffect, useRef } from "react";
import { fetchLocationsByCity, fetchStationAQI } from "../services/openaq";

export default function useAQIAlert() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertLog, setAlertLog]       = useState([]);
  const intervalRef                   = useRef(null);

  // Start/stop monitoring when alert changes
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // If no alert set, stop here
    if (!activeAlert) return;

    // Check immediately on set
    checkAQI(activeAlert);

    // Then check every 5 minutes
    intervalRef.current = setInterval(() => {
      checkAQI(activeAlert);
    }, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeAlert]);

  // Core check function
  async function checkAQI(alert) {
    try {
      console.log(`🔍 Checking AQI for ${alert.city}...`);

      // Get stations for the city
      const stations = await fetchLocationsByCity(alert.city);
      if (!stations || stations.length === 0) return;

      // Get AQI for first station
      const aqi = await fetchStationAQI(stations[0].id);
      if (aqi === null) return;

      console.log(`📊 ${alert.city} AQI: ${aqi} (threshold: ${alert.threshold})`);

      // Log every check
      const logEntry = {
        city: alert.city,
        aqi,
        threshold: alert.threshold,
        time: new Date().toLocaleTimeString("en-IN"),
        triggered: aqi > alert.threshold,
      };

      setAlertLog((prev) => [logEntry, ...prev].slice(0, 5));

      // Fire notification if AQI exceeds threshold
      if (aqi > alert.threshold) {
        fireNotification(alert.city, aqi, alert.threshold);
      }
    } catch (error) {
      console.error("Alert check failed:", error);
    }
  }

  // Fire browser notification
  function fireNotification(city, aqi, threshold) {
    if (Notification.permission !== "granted") return;

    const level = aqi > 300 ? "☠️ Hazardous"
                : aqi > 200 ? "🚨 Very Unhealthy"
                : aqi > 150 ? "🤧 Unhealthy"
                : aqi > 100 ? "😷 Unhealthy for Sensitive"
                : "😐 Moderate";

    new Notification(`⚠️ VayuMap Alert — ${city}`, {
      body: `AQI is ${aqi} (${level})\nExceeds your limit of ${threshold}`,
      icon: "/vite.svg",
      badge: "/vite.svg",
    });
  }

  return {
    activeAlert,
    setActiveAlert,
    alertLog,
  };
}