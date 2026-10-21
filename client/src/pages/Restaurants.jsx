/**
 * ============================================================
 * RESTAURANTS PAGE  (/restaurants)
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  fetchRestaurants,
  fetchCategories,
  searchMeals,
} from "../features/restaurants/restaurantsSlice";
import { useLocation } from "../context/LocationContext";
import FilterSidebar from "../components/restaurant/FilterSidebar";
import SortOptions from "../components/restaurant/SortOptions";
import RestaurantList from "../components/restaurant/RestaurantList";
import SearchAutocomplete from "../components/common/SearchAutocomplete";
import Pagination from "../components/common/Pagination";

const ITEMS_PER_PAGE = 12;

const initialFilters = {
  sortBy: "relevance",
  cuisines: [],
  rating: [],
  deliveryTime: [],
};

const Restaurants = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { city, area } = useLocation();

  const { items, categories, loading, error } = useSelector(
    (s) => s.restaurants,
  );

  const [filters, setFilters] = useState(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const q = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const page =
    Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  /* Load categories */
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  /* Fetch restaurants */
  useEffect(() => {
    if (q) {
      dispatch(searchMeals(q));
    } else {
      dispatch(
        fetchRestaurants({
          city: city?.name,
          area: area || undefined,
          limit: 200,
        }),
      );
    }
  }, [dispatch, q, city?.name, area]);

  /* Filter handlers */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => setFilters(initialFilters);

  /* Apply filters + sort */
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.cuisines.length > 0) {
      result = result.filter((item) => {
        const list = (item.cuisines || []).map((c) =>
          String(c).toLowerCase().trim(),
        );
        return filters.cuisines.some((c) =>
          list.includes(String(c).toLowerCase().trim()),
        );
      });
    }

    if (filters.rating.length > 0) {
      const minRating = Math.min(...filters.rating.map((r) => parseFloat(r)));
      result = result.filter((item) => parseFloat(item.rating) >= minRating);
    }

    if (filters.deliveryTime.includes("under-30")) {
      result = result.filter((item) => Number(item.deliveryTime) < 30);
    }

    switch (filters.sortBy) {
      case "delivery":
        result.sort((a, b) => Number(a.deliveryTime) - Number(b.deliveryTime));
        break;
      case "cost-low-high":
        result.sort((a, b) => Number(a.priceForTwo) - Number(b.priceForTwo));
        break;
      case "cost-high-low":
        result.sort((a, b) => Number(b.priceForTwo) - Number(a.priceForTwo));
        break;
      case "rating":
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      default:
        break;
    }

    return result;
  }, [items, filters]);

  /* Pagination */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    if (newPage <= 1) next.delete("page");
    else next.set("page", String(newPage));
    navigate(`/restaurants?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Title */
  const title = q
    ? `Search results for "${q}"`
    : urlCategory
      ? `${urlCategory} Restaurants`
      : area
        ? `Restaurants in ${area}, ${city.name}`
        : `Restaurants in ${city.name}`;

  return (
    <div className="container">
      <div className="restaurants-page">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          categories={categories}
        />

        {mobileFiltersOpen && (
          <>
            <div
              className="filter-drawer-overlay"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="filter-sidebar open">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                categories={categories}
              />
            </div>
          </>
        )}

        <main>
          <SearchAutocomplete
            variant="page"
            initialValue={q}
            onSelect={(meal) => navigate(`/restaurants/${meal.id}`)}
          />

          <div className="restaurants-header">
            <div>
              <h1>{title}</h1>
              <p className="count">
                {filteredItems.length} restaurant
                {filteredItems.length !== 1 ? "s" : ""} found
                {totalPages > 1 && (
                  <span style={{ marginLeft: 8 }}>
                    · Page {safePage} of {totalPages}
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              className="filter-toggle-mobile"
              onClick={() => setMobileFiltersOpen(true)}
            >
              ☰ Filters
            </button>
          </div>

          <SortOptions
            value={filters.sortBy}
            onChange={(key) => handleFilterChange("sortBy", key)}
          />

          <RestaurantList
            items={paginatedItems}
            loading={loading}
            error={error}
            emptyIcon="🍽️"
            emptyTitle={q ? `No results for "${q}"` : "No restaurants found"}
            emptyMessage={
              q
                ? "Try a different search term or browse categories."
                : "Try clearing some filters or searching for something else."
            }
          />

          {!loading && filteredItems.length > 0 && totalPages > 1 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={handlePageChange}
              siblingCount={1}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Restaurants;
