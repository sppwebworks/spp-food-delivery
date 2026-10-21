/**
 * ============================================================
 * NOT FOUND MIDDLEWARE
 * ============================================================
 * Catches any request that reaches the end of the Express
 * middleware chain without being handled by a route.
 */

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFound;
