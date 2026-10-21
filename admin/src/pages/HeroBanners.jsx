import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../features/banner/bannerSlice";
import { fetchCoupons } from "../features/coupons/couponSlice";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const emptyForm = {
  type: "hero",
  title: "",
  subtitle: "",
  image: "",
  ctaText: "Order Now →",
  ctaLink: "/restaurants",
  couponCode: "",
  isActive: true,
};

const HeroBanners = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // ✅ Uses 'adminBanners' to match store.js
  const { items, loading } = useSelector((s) => s.adminBanners);
  const availableCoupons = useSelector((s) => s.coupons?.items || []);

  const heroBanners = items.filter((b) => b.type === "hero");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchBanners());
    dispatch(fetchCoupons());
  }, [dispatch]);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item ? { ...emptyForm, ...item } : emptyForm);
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = data.url.startsWith("http")
        ? data.url
        : `${api.defaults.baseURL.replace("/api", "")}${data.url}`;
      setForm((f) => ({ ...f, image: imageUrl }));
      showToast("Image uploaded", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    setSaving(true);
    const action = editing
      ? updateBanner({ id: editing._id, payload: { ...form, type: "hero" } })
      : createBanner({ ...form, type: "hero" });
    const res = await dispatch(action);
    setSaving(false);

    if (res.error) showToast(res.payload || "Failed to save", "error");
    else {
      showToast(editing ? "Updated" : "Created", "success");
      setModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    await dispatch(deleteBanner(id));
    showToast("Deleted", "success");
  };

  const toggleActive = async (b) => {
    await dispatch(
      updateBanner({ id: b._id, payload: { isActive: !b.isActive } }),
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Hero Banners</h1>
          <p>Large promotional banners on the homepage</p>
        </div>
        <button className="admin-btn-primary" onClick={() => openModal()}>
          + Create Hero Banner
        </button>
      </header>

      <div className="admin-card">
        {loading ? (
          <p>Loading...</p>
        ) : heroBanners.length === 0 ? (
          <p style={{ color: "var(--adm-text-3)", padding: "20px 0" }}>
            No hero banners yet.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroBanners.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title}
                        style={{
                          width: 120,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <span style={{ color: "#999", fontSize: 12 }}>
                        No image
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.title}</div>
                    {b.subtitle && (
                      <div style={{ fontSize: 12, color: "var(--adm-text-3)" }}>
                        {b.subtitle}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="admin-btn-icon"
                      onClick={() => toggleActive(b)}
                    >
                      {b.isActive ? "✅ Active" : "⛔ Inactive"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="admin-btn-icon"
                      onClick={() => openModal(b)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn-icon admin-btn-danger"
                      onClick={() => handleDelete(b._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setModalOpen(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Hero Banner" : "New Hero Banner"}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <label className="admin-form-field">
                <span>Title *</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label className="admin-form-field">
                <span>Subtitle (Optional)</span>
                <input
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                />
              </label>

              <div className="admin-form-field">
                <span>Hero Image (max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--adm-primary)",
                      marginTop: 6,
                    }}
                  >
                    ⏳ Uploading...
                  </div>
                )}
                {form.image && !uploading && (
                  <img
                    src={form.image}
                    alt="preview"
                    style={{
                      marginTop: 10,
                      width: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                )}
              </div>

              <div className="admin-form-row">
                <label className="admin-form-field">
                  <span>Button Text</span>
                  <input
                    value={form.ctaText}
                    onChange={(e) =>
                      setForm({ ...form, ctaText: e.target.value })
                    }
                  />
                </label>
                <label className="admin-form-field">
                  <span>Button Link</span>
                  <input
                    value={form.ctaLink}
                    onChange={(e) =>
                      setForm({ ...form, ctaLink: e.target.value })
                    }
                  />
                </label>
              </div>

              <label className="admin-form-field">
                <span>Attach Coupon (Optional)</span>
                <select
                  value={form.couponCode || ""}
                  onChange={(e) =>
                    setForm({ ...form, couponCode: e.target.value })
                  }
                >
                  <option value="">— No coupon —</option>
                  {availableCoupons.map((c) => (
                    <option key={c._id} value={c.code}>
                      {c.code} —{" "}
                      {c.discountType === "percentage"
                        ? `${c.discountValue}% off`
                        : `₹${c.discountValue} off`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                <span>Show on homepage</span>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving || uploading}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBanners;
