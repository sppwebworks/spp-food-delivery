/**
 * ============================================================
 * HERO — Home page top banner (offer badge removed)
 * ============================================================
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function highlightMatch(text = "", query = "") {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const Hero = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [quickPicks, setQuickPicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    api
      .get("/restaurants?limit=100")
      .then((res) => {
        const restaurants = res.data.restaurants || [];
        const set = new Set();
        restaurants.forEach((r) =>
          (r.cuisines || []).forEach((c) =>
            set.add(c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()),
          ),
        );
        const shuffled = Array.from(set).sort(() => 0.5 - Math.random());
        setQuickPicks(shuffled.slice(0, 6));
      })
      .catch(() =>
        setQuickPicks([
          "Biryani",
          "Pizza",
          "Burgers",
          "Dosa",
          "Chinese",
          "Desserts",
        ]),
      );
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(true);

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const c = new AbortController();
      abortRef.current = c;
      try {
        const { data } = await api.get(
          `/restaurants?search=${encodeURIComponent(trimmed)}&limit=6`,
          { signal: c.signal },
        );
        setSuggestions(data.restaurants || []);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== "AbortError" && err.name !== "CanceledError")
          setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const goToSearch = (term) => {
    const q = (term || query).trim();
    if (!q) return;
    setOpen(false);
    inputRef.current?.blur();
    navigate(`/restaurants?q=${encodeURIComponent(q)}`);
  };

  const goToRestaurant = (r) => {
    setOpen(false);
    inputRef.current?.blur();
    navigate(`/restaurants/${r._id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex])
      goToRestaurant(suggestions[activeIndex]);
    else goToSearch(query);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <section className="hero-fullwidth">
      <div className="hero-bg-shape hero-bg-shape-1" />
      <div className="hero-bg-shape hero-bg-shape-2" />
      <div className="hero-emoji hero-emoji-1">🍕</div>
      <div className="hero-emoji hero-emoji-2">🍔</div>
      <div className="hero-emoji hero-emoji-3">🍣</div>
      <div className="hero-emoji hero-emoji-4">🥗</div>
      <div className="hero-emoji hero-emoji-5">🍰</div>

      <div className="container hero-content-center">
        <span className="hero-eyebrow">
          🚀 Now delivering in 30 minutes or less
        </span>
        <h1 className="hero-title-full">
          Good Food. <span>Great Mood.</span>
        </h1>
        <p className="hero-subtitle-full">
          Order from the best restaurants near you. Fresh, fast, and always
          delivered with a smile.
        </p>

        <div className="hero-search-wrap-full" ref={wrapRef}>
          <form className="hero-search-full" onSubmit={handleSubmit}>
            <span className="hero-search-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for a dish or restaurant…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setFocused(true);
                if (query.trim().length >= 2) setOpen(true);
              }}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="hero-search-clear"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setOpen(false);
                  inputRef.current?.focus();
                }}
              >
                ✕
              </button>
            )}
            <button type="submit" className="hero-search-btn">
              Search
            </button>
          </form>

          {focused && query.length === 0 && quickPicks.length > 0 && (
            <div className="hero-quick-picks">
              <span className="hero-quick-label">Try:</span>
              <div className="hero-quick-chips">
                {quickPicks.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="hero-quick-chip"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(t);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {open && query.trim().length >= 2 && (
            <div className="hero-suggestions">
              {loading && suggestions.length === 0 && (
                <div className="hero-suggestions-loading">
                  <span className="hero-suggestions-spinner" />
                  Searching…
                </div>
              )}
              {!loading && suggestions.length === 0 && (
                <div className="hero-suggestions-empty">
                  <span className="hero-suggestions-empty-icon">🔍</span>
                  <div>
                    <strong>No matches for "{query}"</strong>
                    <p>Try a different keyword</p>
                  </div>
                </div>
              )}
              {suggestions.length > 0 && (
                <>
                  <div className="hero-suggestions-header">
                    <span>Restaurants</span>
                    <span>
                      {suggestions.length}{" "}
                      {suggestions.length === 1 ? "match" : "matches"}
                    </span>
                  </div>
                  <ul className="hero-suggestions-list">
                    {suggestions.map((r, i) => (
                      <li key={r._id}>
                        <button
                          type="button"
                          className={`hero-suggestion ${
                            activeIndex === i ? "active" : ""
                          }`}
                          onMouseEnter={() => setActiveIndex(i)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            goToRestaurant(r);
                          }}
                        >
                          <span className="hero-suggestion-img">
                            {r.image ? (
                              <img src={r.image} alt="" />
                            ) : (
                              <span>🍽️</span>
                            )}
                          </span>
                          <span className="hero-suggestion-info">
                            <span className="hero-suggestion-name">
                              {highlightMatch(r.name, query)}
                            </span>
                            <span className="hero-suggestion-meta">
                              {(r.cuisines || []).slice(0, 2).join(" · ")}
                              {r.rating ? ` · ${r.rating}★` : ""}
                            </span>
                          </span>
                          <span className="hero-suggestion-arrow">⏎</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="hero-suggestions-footer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      goToSearch(query);
                    }}
                  >
                    🔎 See all results for <strong>"{query}"</strong> →
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Stats — no offer badge here */}
        <div className="hero-stats-full">
          <div className="hero-stat-full">
            <strong>500+</strong>
            <span>Restaurants</span>
          </div>
          <div className="hero-stat-divider-full" />
          <div className="hero-stat-full">
            <strong>30 min</strong>
            <span>Avg delivery</span>
          </div>
          <div className="hero-stat-divider-full" />
          <div className="hero-stat-full">
            <strong>4.8★</strong>
            <span>1M+ ratings</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
