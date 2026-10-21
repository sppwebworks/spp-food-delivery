/**
 * ============================================================
 * useSearchSuggestions — Live search from OUR backend
 * ============================================================
 * Debounced 300ms. Searches restaurants by name.
 * ============================================================
 */

import { useEffect, useState, useRef } from "react";
import api from "../services/api";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

export const useSearchSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const trimmed = query?.trim() || "";

    if (trimmed.length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      // Cancel previous
      if (abortRef.current) {
        abortRef.current.abort?.();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const { data } = await api.get(
          `/restaurants?search=${encodeURIComponent(trimmed)}&limit=10`,
          { signal: controller.signal },
        );

        // Map backend restaurant shape → dropdown-friendly shape
        const restaurants = data.restaurants || [];
        setSuggestions(
          restaurants.slice(0, 6).map((r) => ({
            id: r._id,
            name: r.name,
            image: r.image,
            category: r.cuisines?.[0] || "Restaurant",
            area: r.address?.city || "",
          })),
        );
      } catch (err) {
        if (err.name !== "AbortError" && err.name !== "CanceledError") {
          console.warn("Autocomplete error:", err.message);
        }
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
};

export default useSearchSuggestions;
