// import { Link } from "react-router-dom";

// export default function HeroBanner({ banner }) {
//   if (!banner) return null;

//   return (
//     <div className="hero-banner">
//       {banner.image && (
//         <img
//           src={banner.image}
//           alt={banner.title}
//           className="hero-banner-img"
//         />
//       )}
//       <div className="hero-banner-overlay" />
//       <div className="hero-banner-content">
//         <h1>{banner.title}</h1>
//         {banner.subtitle && <p>{banner.subtitle}</p>}
//         {banner.couponCode && (
//           <div className="hero-banner-code">Use code: {banner.couponCode}</div>
//         )}
//         <Link
//           to={banner.ctaLink || "/restaurants"}
//           className="btn-primary btn-large"
//         >
//           {banner.ctaText || "Order Now →"}
//         </Link>
//       </div>
//     </div>
//   );
// }

import { Link } from "react-router-dom";

export default function HeroBanner({ banner }) {
  if (!banner) return null;

  return (
    <section
      className="hero-banner-full"
      style={{
        backgroundImage: banner.image ? `url(${banner.image})` : "none",
      }}
    >
      {/* Dark gradient overlay so text is readable */}
      <div className="hero-banner-overlay" />

      <div className="hero-banner-container">
        <h1>{banner.title}</h1>
        {banner.subtitle && <p>{banner.subtitle}</p>}

        {banner.couponCode && (
          <div className="hero-banner-code">
            Use code: <strong>{banner.couponCode}</strong>
          </div>
        )}

        <Link to={banner.ctaLink || "/restaurants"} className="hero-banner-btn">
          {banner.ctaText || "Order Now →"}
        </Link>
      </div>
    </section>
  );
}
