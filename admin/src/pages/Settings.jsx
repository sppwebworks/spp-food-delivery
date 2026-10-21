/**
 * ============================================================
 * ADMIN SETTINGS — Store Configuration Only
 * ============================================================
 * NOTE: Announcements and Hero Banners are now managed in
 * their own dedicated pages under the sidebar.
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminSettings,
  updateAdminSettings,
} from "../features/settings/adminSettingsSlice";
import { useToast } from "../context/ToastContext";

const Settings = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { data, loading, saving, error } = useSelector((s) => s.adminSettings);

  const [form, setForm] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminSettings());
  }, [dispatch]);

  // Initialize form with strict fallbacks
  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        isStoreOpen: data.isStoreOpen !== false,
      });
    }
  }, [data]);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    // Force strict casting for the database
    const payload = {
      isStoreOpen: form.isStoreOpen === true,
      minOrderValue: Number(form.minOrderValue) || 0,
      deliveryFee: Number(form.deliveryFee) || 0,
      freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
      packagingFee: Number(form.packagingFee) || 0,
      taxRate: Number(form.taxRate) || 0,
      currency: form.currency || "INR",
    };

    const res = await dispatch(updateAdminSettings(payload));
    if (updateAdminSettings.fulfilled.match(res)) {
      showToast("Settings saved", "success");
    } else {
      showToast(res.payload || "Failed to save", "error");
    }
  };

  if (loading && !form)
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading settings…</div>
      </div>
    );

  if (error && !form)
    return (
      <div className="admin-page">
        <div className="admin-error">{error}</div>
      </div>
    );

  if (!form) return null;

  return (
    <div className="admin-page" style={{ maxWidth: 900 }}>
      <header className="admin-page-header">
        <div>
          <h1>Settings</h1>
          <p>Store configuration and pricing controls</p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* ============ STORE CONFIG ============ */}
        <div className="admin-card">
          <h2>Store Configuration</h2>

          <label
            className="admin-form-checkbox"
            style={{ marginBottom: 16, display: "flex", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={form.isStoreOpen === true}
              onChange={(e) => handleChange("isStoreOpen", e.target.checked)}
              style={{ cursor: "pointer", width: 18, height: 18 }}
            />
            <span>Accepting new orders</span>
          </label>

          <div className="admin-form-row">
            <label className="admin-form-field">
              <span>Min order value (₹)</span>
              <input
                type="number"
                min="0"
                value={form.minOrderValue ?? 0}
                onChange={(e) => handleChange("minOrderValue", e.target.value)}
              />
            </label>
            <label className="admin-form-field">
              <span>Delivery fee (₹)</span>
              <input
                type="number"
                min="0"
                value={form.deliveryFee ?? 0}
                onChange={(e) => handleChange("deliveryFee", e.target.value)}
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label className="admin-form-field">
              <span>Free delivery above (₹)</span>
              <input
                type="number"
                min="0"
                value={form.freeDeliveryThreshold ?? 0}
                onChange={(e) =>
                  handleChange("freeDeliveryThreshold", e.target.value)
                }
              />
            </label>
            <label className="admin-form-field">
              <span>Packaging fee (₹)</span>
              <input
                type="number"
                min="0"
                value={form.packagingFee ?? 0}
                onChange={(e) => handleChange("packagingFee", e.target.value)}
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label className="admin-form-field">
              <span>Tax rate (%)</span>
              <input
                type="number"
                min="0"
                max="50"
                value={form.taxRate ?? 0}
                onChange={(e) => handleChange("taxRate", e.target.value)}
              />
            </label>
            <label className="admin-form-field">
              <span>Currency</span>
              <input
                type="text"
                maxLength={5}
                value={form.currency || "INR"}
                onChange={(e) => handleChange("currency", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={saving}
            style={{ width: 200 }}
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

// /**
//  * ============================================================
//  * ADMIN SETTINGS — Store + Announcement Bar
//  * ============================================================
//  */

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchAdminSettings,
//   updateAdminSettings,
// } from "../features/settings/adminSettingsSlice";
// import { useToast } from "../context/ToastContext";

// const Settings = () => {
//   const dispatch = useDispatch();
//   const { showToast } = useToast();
//   const { data, loading, saving, error } = useSelector((s) => s.adminSettings);

//   const [form, setForm] = useState(null);

//   useEffect(() => {
//     dispatch(fetchAdminSettings());
//   }, [dispatch]);

//   // Initialize form with strict fallbacks so checkboxes never get "null"
//   useEffect(() => {
//     if (data) {
//       setForm({
//         ...data,
//         isStoreOpen: data.isStoreOpen !== false, // Default to true if missing
//         announcementEnabled: data.announcementEnabled !== false,
//       });
//     }
//   }, [data]);

//   const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form) return;

//     // Force strict boolean casting for the database
//     const payload = {
//       isStoreOpen: form.isStoreOpen === true,
//       minOrderValue: Number(form.minOrderValue) || 0,
//       deliveryFee: Number(form.deliveryFee) || 0,
//       freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
//       packagingFee: Number(form.packagingFee) || 0,
//       taxRate: Number(form.taxRate) || 0,
//       currency: form.currency || "INR",
//       announcementEnabled: form.announcementEnabled === true,
//       announcementText: form.announcementText || "",
//       announcementCtaText: form.announcementCtaText || "",
//       announcementCtaLink: form.announcementCtaLink || "",
//       announcementEmoji: form.announcementEmoji || "🎁",
//     };

//     const res = await dispatch(updateAdminSettings(payload));
//     if (updateAdminSettings.fulfilled.match(res)) {
//       showToast("Settings saved", "success");
//     } else {
//       showToast(res.payload || "Failed to save", "error");
//     }
//   };

//   if (loading && !form)
//     return (
//       <div className="admin-page">
//         <div className="admin-loading">Loading settings…</div>
//       </div>
//     );

//   if (error && !form)
//     return (
//       <div className="admin-page">
//         <div className="admin-error">{error}</div>
//       </div>
//     );

//   if (!form) return null;

//   return (
//     <div className="admin-page" style={{ maxWidth: 900 }}>
//       <header className="admin-page-header">
//         <div>
//           <h1>Settings</h1>
//           <p>Store controls and announcement bar for customers</p>
//         </div>
//       </header>

//       <form
//         onSubmit={handleSubmit}
//         style={{ display: "flex", flexDirection: "column", gap: 20 }}
//       >
//         {/* ============ ANNOUNCEMENT BAR ============ */}
//         <div className="admin-card">
//           <h2>Announcement Bar (above navbar)</h2>

//           <label
//             className="admin-form-checkbox"
//             style={{ marginBottom: 16, display: "flex", cursor: "pointer" }}
//           >
//             <input
//               type="checkbox"
//               checked={form.announcementEnabled === true}
//               onChange={(e) =>
//                 handleChange("announcementEnabled", e.target.checked)
//               }
//               style={{ cursor: "pointer", width: 18, height: 18 }}
//             />
//             <span>Show announcement bar to customers</span>
//           </label>

//           <div className="admin-form" style={{ gap: 14 }}>
//             <label className="admin-form-field">
//               <span>Emoji</span>
//               <input
//                 type="text"
//                 maxLength={8}
//                 value={form.announcementEmoji || ""}
//                 onChange={(e) =>
//                   handleChange("announcementEmoji", e.target.value)
//                 }
//                 placeholder="🎁"
//               />
//             </label>

//             <label className="admin-form-field">
//               <span>Text</span>
//               <input
//                 type="text"
//                 maxLength={120}
//                 value={form.announcementText || ""}
//                 onChange={(e) =>
//                   handleChange("announcementText", e.target.value)
//                 }
//                 placeholder="50% OFF on your first order above ₹199"
//               />
//             </label>

//             <div className="admin-form-row">
//               <label className="admin-form-field">
//                 <span>Button text</span>
//                 <input
//                   type="text"
//                   maxLength={30}
//                   value={form.announcementCtaText || ""}
//                   onChange={(e) =>
//                     handleChange("announcementCtaText", e.target.value)
//                   }
//                   placeholder="Order Now →"
//                 />
//               </label>
//               <label className="admin-form-field">
//                 <span>Button link</span>
//                 <input
//                   type="text"
//                   maxLength={200}
//                   value={form.announcementCtaLink || ""}
//                   onChange={(e) =>
//                     handleChange("announcementCtaLink", e.target.value)
//                   }
//                   placeholder="/restaurants"
//                 />
//               </label>
//             </div>
//           </div>

//           <p className="admin-muted" style={{ marginTop: 14, fontSize: 12 }}>
//             Preview:{" "}
//             <span
//               style={{
//                 display: "inline-block",
//                 marginLeft: 8,
//                 padding: "4px 12px",
//                 borderRadius: 20,
//                 background: "linear-gradient(90deg,#fc8019,#e56f0e)",
//                 color: "#fff",
//                 fontSize: 12,
//                 fontWeight: 600,
//               }}
//             >
//               {form.announcementEmoji || "🎁"} {form.announcementText || "—"}{" "}
//               {form.announcementCtaText || ""}
//             </span>
//           </p>
//         </div>

//         {/* ============ STORE ============ */}
//         <div className="admin-card">
//           <h2>Store</h2>

//           <label
//             className="admin-form-checkbox"
//             style={{ marginBottom: 16, display: "flex", cursor: "pointer" }}
//           >
//             <input
//               type="checkbox"
//               checked={form.isStoreOpen === true}
//               onChange={(e) => handleChange("isStoreOpen", e.target.checked)}
//               style={{ cursor: "pointer", width: 18, height: 18 }}
//             />
//             <span>Accepting new orders</span>
//           </label>

//           <div className="admin-form-row">
//             <label className="admin-form-field">
//               <span>Min order value (₹)</span>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.minOrderValue ?? 0}
//                 onChange={(e) => handleChange("minOrderValue", e.target.value)}
//               />
//             </label>
//             <label className="admin-form-field">
//               <span>Delivery fee (₹)</span>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.deliveryFee ?? 0}
//                 onChange={(e) => handleChange("deliveryFee", e.target.value)}
//               />
//             </label>
//           </div>

//           <div className="admin-form-row">
//             <label className="admin-form-field">
//               <span>Free delivery above (₹)</span>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.freeDeliveryThreshold ?? 0}
//                 onChange={(e) =>
//                   handleChange("freeDeliveryThreshold", e.target.value)
//                 }
//               />
//             </label>
//             <label className="admin-form-field">
//               <span>Packaging fee (₹)</span>
//               <input
//                 type="number"
//                 min="0"
//                 value={form.packagingFee ?? 0}
//                 onChange={(e) => handleChange("packagingFee", e.target.value)}
//               />
//             </label>
//           </div>

//           <div className="admin-form-row">
//             <label className="admin-form-field">
//               <span>Tax rate (%)</span>
//               <input
//                 type="number"
//                 min="0"
//                 max="50"
//                 value={form.taxRate ?? 0}
//                 onChange={(e) => handleChange("taxRate", e.target.value)}
//               />
//             </label>
//             <label className="admin-form-field">
//               <span>Currency</span>
//               <input
//                 type="text"
//                 maxLength={5}
//                 value={form.currency || "INR"}
//                 onChange={(e) => handleChange("currency", e.target.value)}
//               />
//             </label>
//           </div>
//         </div>

//         <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
//           <button
//             type="submit"
//             className="admin-btn-primary"
//             disabled={saving}
//             style={{ width: 200 }}
//           >
//             {saving ? "Saving…" : "Save Settings"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Settings;
