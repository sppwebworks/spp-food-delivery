/**
 * ============================================================
 * CUISINES PAGE  (/cuisines)
 * ============================================================
 * Shows all categories as tiles. Clicking one navigates
 * to /restaurants?category=Beef
 * ============================================================
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../features/restaurants/restaurantsSlice";

const Cuisines = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading } = useSelector((s) => s.restaurants);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleClick = (categoryName) => {
    navigate(`/restaurants?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="container" style={{ padding: "32px 24px" }}>
      <h1 style={{ marginBottom: 8 }}>Explore Cuisines</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 32 }}>
        Pick a cuisine to see delicious meals
      </p>

      {loading && <p className="status">Loading cuisines...</p>}

      <div className="cuisines-grid">
        {categories.map((cat) => (
          <button
            key={cat.idCategory}
            className="cuisine-tile"
            onClick={() => handleClick(cat.strCategory)}
          >
            <div className="cuisine-tile-image">
              <img
                src={cat.strCategoryThumb}
                alt={cat.strCategory}
                loading="lazy"
              />
            </div>
            <h3>{cat.strCategory}</h3>
            <p>{cat.strCategoryDescription?.slice(0, 60)}...</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Cuisines;
