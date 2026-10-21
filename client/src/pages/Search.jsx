/**
 * ============================================================
 * SEARCH PAGE  (/search?q=...)
 * ============================================================
 * Dedicated search results page. Reads the `q` query param,
 * fetches matching restaurants, and displays them in a grid.
 * ============================================================
 */

import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchMeals } from "../features/restaurants/restaurantsSlice";
import RestaurantList from "../components/restaurant/RestaurantList";
import EmptyState from "../components/common/EmptyState";
import SearchAutocomplete from "../components/common/SearchAutocomplete";

const Search = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { items, loading, error } = useSelector((s) => s.restaurants);

  useEffect(() => {
    if (query) {
      dispatch(searchMeals(query));
    }
  }, [dispatch, query]);

  return (
    <div
      className="container"
      style={{ padding: "40px 20px", minHeight: "70vh" }}
    >
      {/* ---------- SEARCH BAR ---------- */}
      <div style={{ maxWidth: 720, marginBottom: 32 }}>
        <SearchAutocomplete
          variant="page"
          initialValue={query}
          onSelect={(meal) => {
            window.location.href = `/restaurants/${meal.id}`;
          }}
        />
      </div>

      {/* ---------- HEADER ---------- */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 8,
            letterSpacing: "-0.5px",
          }}
        >
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 500 }}>
          {loading
            ? "Searching..."
            : `${items.length} restaurant${items.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* ---------- RESULTS ---------- */}
      {!query ? (
        <EmptyState
          icon="🔍"
          title="Start typing to search"
          message="Search for restaurants, cuisines, or dishes."
          actionLabel="Browse All Restaurants"
          actionLink="/restaurants"
        />
      ) : error ? (
        <div className="status error">
          {typeof error === "string"
            ? error
            : "Failed to search. Please try again."}
        </div>
      ) : (
        <RestaurantList
          items={items}
          loading={loading}
          error={error}
          emptyIcon="🔍"
          emptyTitle={`No results for "${query}"`}
          emptyMessage="Try a different keyword or browse all restaurants."
        />
      )}

      {/* ---------- BACK LINK ---------- */}
      {query && (
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Link
            to="/restaurants"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ← Browse all restaurants
          </Link>
        </div>
      )}
    </div>
  );
};

export default Search;
