/**
 * ============================================================
 * CATEGORY STRIP — "What's on your mind?" with Scroll Buttons
 * ============================================================
 */

import { useMemo, useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setActiveCategory } from "../../features/restaurants/restaurantsSlice";

const CUISINE_EMOJI = {
  Biryani: "🍛",
  Hyderabadi: "🍛",
  Mughlai: "🥘",
  "North Indian": "🍲",
  Pizza: "🍕",
  Italian: "🍝",
  Burgers: "🍔",
  American: "🌭",
  "Fast Food": "🍟",
  Chinese: "🥡",
  "Indo-Chinese": "🥡",
  Asian: "🍜",
  "South Indian": "🥘",
  Dosa: "🥞",
  Breakfast: "🍳",
  Vegetarian: "🥗",
  Desserts: "🍰",
  "Ice Cream": "🍦",
  Cakes: "🎂",
  Bakery: "🥐",
  Kebabs: "🍢",
  Tandoori: "🍖",
  Thali: "🍽️",
  Punjabi: "🍛",
  Chettinad: "🌶️",
  Tamil: "🍛",
  Beverages: "🥤",
  Coffee: "☕",
  Seafood: "🦐",
  Salads: "🥗",
  Soups: "🍲",
  Combos: "🍱",
};

const CategoryStrip = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const { categories, items, activeCategory } = useSelector(
    (s) => s.restaurants,
  );

  const cuisineImages = useMemo(() => {
    const map = {};
    items.forEach((r) => {
      (r.cuisines || []).forEach((c) => {
        if (!map[c] && r.image) map[c] = r.image;
      });
    });
    return map;
  }, [items]);

  // Handle scroll button visibility
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    setShowLeft(scrollLeft > 0);
    // Use a 1px buffer to avoid rounding issues
    setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    // Re-check on window resize
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    // Scroll by 3/4 of the visible width
    const scrollAmount =
      direction === "left" ? -(clientWidth * 0.75) : clientWidth * 0.75;

    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  const handleClick = (cuisine) => {
    dispatch(setActiveCategory(cuisine));
    navigate(`/restaurants?category=${encodeURIComponent(cuisine)}`);
  };

  return (
    <section className="category-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">What's on your mind?</h2>
          <p className="section-subtitle">
            Browse our wide selection of cuisines
          </p>
        </div>
      </div>

      <div className="category-strip-wrapper">
        {/* Left Scroll Button */}
        {showLeft && (
          <button
            type="button"
            className="scroll-btn category-scroll-btn left"
            onClick={() => scroll("left")}
            aria-label="Scroll categories left"
          >
            ‹
          </button>
        )}

        {/* The Scrollable List */}
        <div className="category-strip" ref={scrollRef} onScroll={checkScroll}>
          {categories.map((cuisine) => {
            const image = cuisineImages[cuisine];
            const emoji = CUISINE_EMOJI[cuisine] || "🍽️";
            const isActive = activeCategory === cuisine;

            return (
              <button
                key={cuisine}
                type="button"
                className={`category-item ${isActive ? "active" : ""}`}
                onClick={() => handleClick(cuisine)}
                aria-label={`Browse ${cuisine} restaurants`}
              >
                <div className="category-item-image">
                  {image ? (
                    <img src={image} alt="" loading="lazy" />
                  ) : (
                    <span className="category-item-emoji">{emoji}</span>
                  )}
                  <span className="category-item-overlay" />
                </div>
                <span className="category-item-name">{cuisine}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {showRight && (
          <button
            type="button"
            className="scroll-btn category-scroll-btn right"
            onClick={() => scroll("right")}
            aria-label="Scroll categories right"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
};

export default CategoryStrip;
