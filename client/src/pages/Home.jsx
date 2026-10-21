/**
 * ============================================================
 * HOME PAGE
 * ============================================================
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRestaurants,
  fetchCategories,
} from "../features/restaurants/restaurantsSlice";
import { fetchActiveBanners } from "../features/banner/bannerSlice";
import Hero from "../components/home/Hero";
import HeroBanner from "../components/home/HeroBanner";
import CategoryStrip from "../components/home/CategoryStrip";
import PopularRow from "../components/home/PopularRow";
import FeaturedGrid from "../components/home/FeaturedGrid";
import ValueProps from "../components/home/ValueProps";

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.restaurants);

  // ✅ Get banner state including loading status
  const { hero, loading: bannerLoading } = useSelector((s) => s.banner);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchRestaurants({ limit: 200 }));
    dispatch(fetchActiveBanners());
  }, [dispatch]);

  const featured = [...items]
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 8);

  /* ✅ RENDER LOGIC:
     1. If fetching banner -> show dark loading skeleton (prevents static Hero flicker)
     2. If banner exists -> show dynamic Hero Banner
     3. If no banner -> show static Hero
  */
  const renderHero = () => {
    if (bannerLoading) {
      return (
        <div
          style={{
            width: "100%",
            height: 500,
            background:
              "linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite linear",
          }}
        />
      );
    }
    if (hero) return <HeroBanner banner={hero} />;
    return <Hero />;
  };

  return (
    <div className="home-page">
      {/* ✅ Full width is controlled by HeroBanner.css */}
      {renderHero()}

      <div className="container">
        <CategoryStrip />

        {error && (
          <div className="status error" style={{ marginTop: 20 }}>
            {error}
          </div>
        )}

        <PopularRow
          restaurants={featured}
          loading={loading}
          title="Popular Right Now"
        />

        <FeaturedGrid
          restaurants={items}
          loading={loading}
          title="All Restaurants"
        />

        <ValueProps />
      </div>
    </div>
  );
};

export default Home;
