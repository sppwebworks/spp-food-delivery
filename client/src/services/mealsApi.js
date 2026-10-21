/**
 * ============================================================
 * MEALS API SERVICE — TheMealDB
 * ============================================================
 *
 * Base URL: https://www.themealdb.com/api/json/v1/1
 * No API key required (free tier).
 *
 * Transforms TheMealDB's meal shape into our restaurant shape:
 *   id, name, image, description, category, area, tags,
 *   price, rating, reviews, deliveryTime, priceForTwo, isVeg
 *
 * Functions:
 *   getByCategory(category)
 *   getCategories()
 *   search(query)
 *   getById(id)
 *   getFullDetails(id) — includes ingredients list
 *   getRandom()
 *
 * ⚠️ IMPORTANT:
 * TheMealDB's /filter.php endpoint returns STRIPPED meals
 * (only idMeal, strMeal, strMealThumb — no strCategory/strArea).
 * We re-attach the category on getByCategory so client-side
 * filtering works correctly.
 * ============================================================
 */

import axios from "axios";

const mealdb = axios.create({
  baseURL:
    import.meta.env.VITE_MEALDB_URL ||
    "https://www.themealdb.com/api/json/v1/1",
  timeout: 15000,
});

/* ---------- Helpers ---------- */

/**
 * Deterministic pseudo-random number from a string seed.
 * Same meal ID → same price/rating every time.
 */
const seedFromId = (id) => {
  const num = parseInt(String(id).slice(-4), 10) || 1000;
  return num;
};

/**
 * Transform TheMealDB meal → our app's restaurant/meal shape.
 * Works for /search.php and /lookup.php responses (which include
 * strCategory/strArea), but NOT for /filter.php responses.
 */
const transformMeal = (meal) => {
  const seed = seedFromId(meal.idMeal);

  const price = 150 + (seed % 20) * 10; // 150-340
  const rating = (4.0 + (seed % 10) / 10).toFixed(1); // 4.0-4.9
  const reviews = `${((seed % 5) + 1).toFixed(1)}K`; // 1.0K-5.9K
  const deliveryTime = 20 + (seed % 3) * 5; // 20 / 25 / 30

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    description: meal.strInstructions
      ? meal.strInstructions.slice(0, 140).trim() + "..."
      : "",
    image: meal.strMealThumb,
    category: meal.strCategory || "Misc",
    area: meal.strArea || "International",
    tags: meal.strTags
      ? meal.strTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    price,
    rating,
    reviews,
    deliveryTime,
    priceForTwo: price * 2,
    isVeg: seed % 3 === 0,
  };
};

/**
 * Extract ingredients from a full meal object
 * (only present in /lookup.php responses)
 */
const extractIngredients = (meal) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing?.trim()) {
      ingredients.push({
        name: ing.trim(),
        measure: measure?.trim() || "",
      });
    }
  }
  return ingredients;
};

/* ---------- Public API ---------- */

export const mealsApi = {
  /**
   * Get meals in a category (Beef, Chicken, Dessert, Pasta, ...)
   *
   * TheMealDB /filter.php returns stripped meals — only idMeal,
   * strMeal, strMealThumb. We re-inject the category we searched
   * for so client-side filtering has something to match against.
   */
  getByCategory: async (category = "Beef") => {
    const { data } = await mealdb.get(`/filter.php?c=${category}`);
    return (data.meals || []).map((meal) => {
      const base = transformMeal(meal);
      return {
        ...base,
        category: category, // re-attach the category we asked for
        area: base.area || "International",
      };
    });
  },

  /**
   * Get all categories for the category strip / filter sidebar
   * Returns array of { idCategory, strCategory, strCategoryThumb, ... }
   */
  getCategories: async () => {
    const { data } = await mealdb.get("/categories.php");
    return data.categories || [];
  },

  /**
   * Search meals by name (returns full meal objects with category/area)
   */
  search: async (query) => {
    if (!query?.trim()) return [];
    const { data } = await mealdb.get(
      `/search.php?s=${encodeURIComponent(query.trim())}`,
    );
    return (data.meals || []).map(transformMeal);
  },

  /**
   * Get a single meal by ID (basic shape)
   */
  getById: async (id) => {
    const { data } = await mealdb.get(`/lookup.php?i=${id}`);
    const meal = data.meals?.[0];
    return meal ? transformMeal(meal) : null;
  },

  /**
   * Get full details including ingredients + instructions
   * Used by the item detail page.
   */
  getFullDetails: async (id) => {
    const { data } = await mealdb.get(`/lookup.php?i=${id}`);
    const meal = data.meals?.[0];
    if (!meal) return null;

    return {
      ...transformMeal(meal),
      ingredients: extractIngredients(meal),
      instructions: meal.strInstructions || "",
      youtube: meal.strYoutube || "",
      source: meal.strSource || "",
    };
  },

  /**
   * Random meal — used for "Surprise me" features
   */
  getRandom: async () => {
    const { data } = await mealdb.get("/random.php");
    const meal = data.meals?.[0];
    return meal ? transformMeal(meal) : null;
  },
};

export default mealsApi;
