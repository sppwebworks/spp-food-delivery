/**
 * ============================================================
 * SEARCH AUTOCOMPLETE — Reusable live search
 * ============================================================
 *
 * Props:
 *   variant       "navbar" | "hero" | "page" (controls styling)
 *   placeholder   string
 *   autoFocus     bool
 *   onSelect      (result) => void  — optional
 *   submitOnEnter bool                — default true
 *
 * Behavior:
 *   - Debounced live search (300ms)
 *   - Keyboard nav: ↑ ↓ Enter Esc
 *   - Click-outside closes
 *   - Recent searches stored in localStorage
 *   - Click result → navigates to /restaurants/:id
 * ============================================================
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchSuggestions } from "../../hooks/useSearchSuggestions";

const RECENT_KEY = "foodiehub.recentSearches";
const MAX_RECENT = 5;

const SearchAutocomplete = ({
  variant = "navbar",
  placeholder = "Search for restaurants, cuisines or dishes...",
  autoFocus = false,
  onSelect = null,
  submitOnEnter = true,
  initialValue = "",
}) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Live search results
  const { suggestions, loading } = useSearchSuggestions(query);

  // Split: recent searches shown when query is empty; suggestions when typing
  const showRecent = focused && !query.trim() && recent.length > 0;
  const showSuggestions = focused && query.trim().length >= 2;
  const showDropdown = open && (showRecent || showSuggestions);

  // Reset highlight when list changes
  useEffect(() => {
    setHighlighted(-1);
  }, [suggestions, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // ⌘K / Ctrl+K shortcut — only when variant is navbar
  useEffect(() => {
    if (variant !== "navbar") return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [variant]);

  /* ---------- Save recent ---------- */
  const saveRecent = (term) => {
    if (!term) return;
    const updated = [term, ...recent.filter((r) => r !== term)].slice(
      0,
      MAX_RECENT,
    );
    setRecent(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  /* ---------- Go to a result ---------- */
  const goToMeal = (meal) => {
    saveRecent(query.trim() || meal.name);
    setOpen(false);
    setFocused(false);
    inputRef.current?.blur();
    if (onSelect) {
      onSelect(meal);
    } else {
      navigate(`/restaurants/${meal.id}`);
    }
  };

  /* ---------- Go to search results ---------- */
  const goToSearchResults = (term) => {
    const q = (term || query).trim();
    if (!q) return;
    saveRecent(q);
    setOpen(false);
    setFocused(false);
    inputRef.current?.blur();
    navigate(`/restaurants?q=${encodeURIComponent(q)}`);
  };

  /* ---------- Keyboard navigation ---------- */
  const totalItems = showSuggestions
    ? suggestions.length
    : showRecent
      ? recent.length
      : 0;

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === "Enter" && submitOnEnter && query.trim()) {
        e.preventDefault();
        goToSearchResults();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && highlighted < totalItems) {
        if (showSuggestions) {
          goToMeal(suggestions[highlighted]);
        } else if (showRecent) {
          setQuery(recent[highlighted]);
          setHighlighted(-1);
        }
      } else if (submitOnEnter) {
        goToSearchResults();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery("");
    setHighlighted(-1);
    inputRef.current?.focus();
    setOpen(true);
  };

  /* ---------- Class names by variant ---------- */
  const wrapClass = useMemo(() => {
    const base = `search-ac search-ac-${variant}`;
    return `${base} ${focused ? "focused" : ""} ${query ? "has-text" : ""}`;
  }, [variant, focused, query]);

  return (
    <div className={wrapClass} ref={containerRef}>
      {/* Input row */}
      <div className="search-ac-input-wrap">
        <span className="search-ac-icon">🔍</span>

        <input
          ref={inputRef}
          type="text"
          className="search-ac-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {query ? (
          <button
            type="button"
            className="search-ac-clear"
            onClick={handleClear}
            aria-label="Clear"
          >
            ✕
          </button>
        ) : variant === "navbar" ? (
          <span className="search-ac-kbd">
            {typeof navigator !== "undefined" && /Mac/.test(navigator.platform)
              ? "⌘K"
              : "Ctrl K"}
          </span>
        ) : null}

        {variant !== "navbar" && (
          <button
            type="button"
            className="search-ac-submit"
            onClick={() => goToSearchResults()}
            disabled={!query.trim()}
          >
            Search {variant === "hero" && <span>→</span>}
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="search-ac-dropdown" role="listbox">
          {/* RECENT */}
          {showRecent && (
            <>
              <div className="search-ac-section">
                <span className="search-ac-section-label">Recent</span>
                <button
                  type="button"
                  className="search-ac-section-clear"
                  onClick={() => {
                    setRecent([]);
                    localStorage.removeItem(RECENT_KEY);
                  }}
                >
                  Clear
                </button>
              </div>
              {recent.map((term, idx) => (
                <button
                  key={term}
                  type="button"
                  className={`search-ac-item ${
                    highlighted === idx ? "highlighted" : ""
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlighted(idx)}
                  onClick={() => {
                    setQuery(term);
                    setOpen(false);
                    navigate(`/restaurants?q=${encodeURIComponent(term)}`);
                  }}
                >
                  <span className="search-ac-item-icon">🕐</span>
                  <span className="search-ac-item-text">{term}</span>
                </button>
              ))}
            </>
          )}

          {/* SUGGESTIONS */}
          {showSuggestions && (
            <>
              <div className="search-ac-section">
                <span className="search-ac-section-label">
                  {loading ? "Searching..." : "Suggestions"}
                </span>
              </div>

              {loading && suggestions.length === 0 && (
                <div className="search-ac-loading">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="search-ac-skeleton">
                      <div className="search-ac-skeleton-img shimmer" />
                      <div className="search-ac-skeleton-text">
                        <div
                          className="shimmer"
                          style={{ width: "60%", height: 12 }}
                        />
                        <div
                          className="shimmer"
                          style={{ width: "40%", height: 10, marginTop: 4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && suggestions.length === 0 && (
                <div className="search-ac-empty">No results for "{query}"</div>
              )}

              {suggestions.map((meal, idx) => (
                <button
                  key={meal.id}
                  type="button"
                  className={`search-ac-item ${
                    highlighted === idx ? "highlighted" : ""
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlighted(idx)}
                  onClick={() => goToMeal(meal)}
                >
                  {meal.image && (
                    <img
                      src={meal.image}
                      alt=""
                      className="search-ac-item-img"
                      loading="lazy"
                    />
                  )}
                  <span className="search-ac-item-text">
                    <strong>{meal.name}</strong>
                    <small>
                      {meal.category}
                      {meal.area ? ` · ${meal.area}` : ""}
                    </small>
                  </span>
                </button>
              ))}

              {suggestions.length > 0 && (
                <button
                  type="button"
                  className="search-ac-see-all"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToSearchResults()}
                >
                  See all results for "{query}" →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
