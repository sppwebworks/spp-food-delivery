/**
 * ============================================================
 * LOCATION CONTEXT — City + Area with auto-detect
 * ============================================================
 * Features:
 *   - Persist to localStorage
 *   - Auto-detect city via browser geolocation + Nominatim
 *   - Manual city selection
 *   - Manual area selection (sub-region within a city)
 * ============================================================
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const LocationContext = createContext();

const STORAGE_KEY = "foodie_location";

/* Cities we serve — extend as needed */
const CITIES = [
  { id: "bangalore", name: "Bangalore", state: "Karnataka" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra" },
  { id: "delhi", name: "Delhi", state: "Delhi NCR" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { id: "pune", name: "Pune", state: "Maharashtra" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal" },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat" },
];

const DEFAULT_CITY = CITIES[0];

export const LocationProvider = ({ children }) => {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [area, setArea] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);

  /* ---------- Load from localStorage on mount ---------- */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.city) setCity(saved.city);
      if (saved?.area) setArea(saved.area);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  /* ---------- Persist changes ---------- */
  useEffect(() => {
    if (city) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ city, area }));
    }
  }, [city, area]);

  /* ---------- Change city (resets area) ---------- */
  const changeCity = useCallback((nextCity) => {
    setCity(nextCity);
    setArea("");
  }, []);

  /* ---------- Change area ---------- */
  const changeArea = useCallback((nextArea) => {
    setArea(nextArea || "");
  }, []);

  /* ---------- Auto-detect via browser geolocation ---------- */
  const detectLocation = useCallback(async () => {
    setDetectError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDetectError("Geolocation not supported by this browser");
      return null;
    }

    setDetecting(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              { headers: { Accept: "application/json" } },
            );

            if (!res.ok) throw new Error("Geocoding service unavailable");

            const data = await res.json();
            const addr = data.address || {};

            const detectedCity =
              addr.city || addr.town || addr.village || addr.county || "";
            const detectedState = addr.state || "";

            const matched = CITIES.find(
              (c) =>
                c.name.toLowerCase() === detectedCity.toLowerCase() ||
                c.name.toLowerCase() === detectedState.toLowerCase(),
            );

            if (matched) {
              changeCity(matched);
              resolve(matched);
            } else if (detectedCity) {
              const custom = {
                id: detectedCity.toLowerCase().replace(/\s+/g, "-"),
                name: detectedCity,
                state: detectedState,
              };
              changeCity(custom);
              resolve(custom);
            } else {
              setDetectError("Could not determine city from your location");
              resolve(null);
            }
          } catch (err) {
            setDetectError(err.message || "Failed to detect location");
            resolve(null);
          } finally {
            setDetecting(false);
          }
        },
        (err) => {
          setDetecting(false);
          const message =
            err.code === 1
              ? "Permission denied — enable location access"
              : err.code === 2
                ? "Position unavailable"
                : "Location request timed out";
          setDetectError(message);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      );
    });
  }, [changeCity]);

  const value = {
    city,
    area,
    cities: CITIES,
    detecting,
    detectError,
    changeCity,
    changeArea,
    detectLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
};

export default LocationContext;
