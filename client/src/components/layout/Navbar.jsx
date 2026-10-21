/**
 * ============================================================
 * NAVBAR — Cleaner, professional layout
 * ============================================================
 */

import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { selectCartCount } from "../../features/cart/cartSlice";
import { toggleCart } from "../../features/ui/uiSlice";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "../../context/LocationContext";
import SearchAutocomplete from "../common/SearchAutocomplete";
import api from "../../services/api";

const AreaSubmenu = ({ city, currentArea, onSelect }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city?.name) return;
    setLoading(true);
    api
      .get(`/restaurants/areas?city=${encodeURIComponent(city.name)}`)
      .then((res) => setAreas(res.data.areas || []))
      .catch(() => setAreas([]))
      .finally(() => setLoading(false));
  }, [city?.name]);

  if (loading)
    return <div className="location-areas-loading">Loading areas…</div>;
  if (areas.length === 0) return null;

  return (
    <div className="location-areas">
      <div className="location-dropdown-header">
        <span className="location-dropdown-title">
          Popular areas in {city.name}
        </span>
      </div>
      <div className="location-areas-grid">
        <button
          type="button"
          className={`location-area-chip ${!currentArea ? "active" : ""}`}
          onClick={() => onSelect("")}
        >
          🏙️ All areas
        </button>
        {areas.slice(0, 12).map((name) => (
          <button
            key={name}
            type="button"
            className={`location-area-chip ${currentArea === name ? "active" : ""}`}
            onClick={() => onSelect(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const { theme, toggleTheme } = useTheme();

  const {
    city,
    area,
    cities,
    changeCity,
    changeArea,
    detectLocation,
    detecting,
    detectError,
  } = useLocation();

  const [cityOpen, setCityOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const cityRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target))
        setCityOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate("/login");
  };

  const handleDetect = async (e) => {
    e.stopPropagation();
    const detected = await detectLocation();
    if (detected) setCityOpen(false);
  };

  const navItems = [
    { label: "Home", to: "/", end: true },
    { label: "Restaurants", to: "/restaurants" },
    { label: "Cuisines", to: "/restaurants?view=cuisines" },
    { label: "Offers", to: "/offers" },
    { label: "Help", to: "/help" },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🍽️</span>
          <span className="navbar-logo-text">FoodieApp</span>
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-right">
          <div
            className="location-picker"
            ref={cityRef}
            onClick={() => setCityOpen((o) => !o)}
            role="button"
            tabIndex={0}
          >
            <span className="location-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="currentColor"
                />
                <circle cx="12" cy="9" r="2.5" fill="#fff" />
              </svg>
            </span>
            <span className="location-text">
              <span className="location-label">Delivering to</span>
              <span className="location-value">
                {area || city.name}
                <span className="location-state">
                  , {area ? city.name : city.state}
                </span>
                <span className="location-chevron">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </span>

            {cityOpen && (
              <div
                className="location-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="location-detect-btn"
                  onClick={handleDetect}
                  disabled={detecting}
                >
                  <span className="location-detect-icon">
                    {detecting ? (
                      <span className="location-detect-spinner" />
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2v3m0 14v3M2 12h3m14 0h3M12 8a4 4 0 100 8 4 4 0 000-8z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="location-detect-label">
                    {detecting ? "Detecting..." : "Use my current location"}
                  </span>
                </button>

                {detectError && (
                  <div className="location-detect-error">{detectError}</div>
                )}

                <div className="location-dropdown-header">
                  <span className="location-dropdown-title">
                    Choose your city
                  </span>
                  <span className="location-dropdown-count">
                    {cities.length} available
                  </span>
                </div>
                <div className="location-dropdown-list">
                  {cities.map((c) => {
                    const isActive = c.id === city.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`location-option ${isActive ? "active" : ""}`}
                        onClick={() => {
                          changeCity(c);
                          setCityOpen(false);
                        }}
                      >
                        <span className="location-option-pin">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                              fill="currentColor"
                            />
                            <circle cx="12" cy="9" r="2.5" fill="#fff" />
                          </svg>
                        </span>
                        <span className="location-option-info">
                          <span className="location-option-name">{c.name}</span>
                          <span className="location-option-state">
                            {c.state}
                          </span>
                        </span>
                        {isActive && (
                          <span className="location-option-check">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <AreaSubmenu
                  city={city}
                  currentArea={area}
                  onSelect={(areaName) => {
                    changeArea(areaName);
                    setCityOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <div className="navbar-search-slot">
            <SearchAutocomplete variant="navbar" />
          </div>

          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            className="cart-button"
            onClick={() => dispatch(toggleCart())}
            aria-label={`Cart with ${cartCount} items`}
          >
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {token && user ? (
            <div
              className="location-picker"
              ref={profileRef}
              style={{ position: "relative" }}
            >
              <button
                className="profile-avatar"
                onClick={() => setProfileOpen((o) => !o)}
                aria-label="Profile menu"
                style={{ overflow: "hidden", padding: 0 }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  user.name?.[0]?.toUpperCase() || "?"
                )}
              </button>

              {profileOpen && (
                <div
                  className="location-dropdown"
                  style={{ right: 0, left: "auto", minWidth: 240 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: 14 }}>
                      {user.name}
                    </strong>
                    <small style={{ color: "var(--text-3)", fontSize: 12 }}>
                      {user.email}
                    </small>
                  </div>
                  <button
                    className="location-option"
                    onClick={() => {
                      navigate("/profile");
                      setProfileOpen(false);
                    }}
                  >
                    👤 My Profile
                  </button>
                  <button
                    className="location-option"
                    onClick={() => {
                      navigate("/orders");
                      setProfileOpen(false);
                    }}
                  >
                    📦 My Orders
                  </button>
                  <button
                    className="location-option"
                    onClick={() => {
                      navigate("/favorites");
                      setProfileOpen(false);
                    }}
                  >
                    ❤️ Favorites
                  </button>
                  {/* ✅ NEW: Support Tickets in dropdown */}
                  <button
                    className="location-option"
                    onClick={() => {
                      navigate("/support");
                      setProfileOpen(false);
                    }}
                  >
                    🎧 Support Tickets
                  </button>
                  <button
                    className="location-option"
                    onClick={handleLogout}
                    style={{ color: "var(--danger)" }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{ padding: "8px 18px" }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
