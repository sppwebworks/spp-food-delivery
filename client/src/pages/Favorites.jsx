import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../features/favorites/favoritesSlice";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import EmptyState from "../components/common/EmptyState";

const Favorites = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  // Filter out placeholder items (they don't have full data)
  const realItems = items.filter((r) => !r._placeholder);

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        ❤️ Your Favorites
      </h1>

      {loading && realItems.length === 0 && (
        <p className="status">Loading...</p>
      )}

      {!loading && realItems.length === 0 && (
        <EmptyState
          icon="🤍"
          title="No favorites yet"
          message="Tap the heart on any restaurant to save it here."
          actionLabel="Browse Restaurants"
          actionLink="/restaurants"
        />
      )}

      {realItems.length > 0 && (
        <div className="restaurants-grid">
          {realItems.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
