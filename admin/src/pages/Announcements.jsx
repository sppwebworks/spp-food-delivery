import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../features/banners/adminBannersSlice";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  type: "top",
  title: "",
  couponCode: "",
  ctaText: "Order Now →",
  ctaLink: "/restaurants",
  isActive: true,
};

const Announcements = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { items, loading } = useSelector((s) => s.adminBanners);

  // Filter to only show "top" banners
  const topBanners = items.filter((b) => b.type === "top");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item ? { ...emptyForm, ...item } : emptyForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("Announcement text is required", "error");
      return;
    }

    setSaving(true);
    const action = editing
      ? updateBanner({ id: editing._id, payload: { ...form, type: "top" } })
      : createBanner({ ...form, type: "top" });
    const res = await dispatch(action);
    setSaving(false);

    if (res.error) {
      showToast(res.payload?.message || "Failed to save", "error");
    } else {
      showToast(
        editing ? "Announcement updated" : "Announcement created",
        "success",
      );
      setModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await dispatch(deleteBanner(id));
    showToast("Deleted", "success");
  };

  const toggleActive = async (banner) => {
    await dispatch(
      updateBanner({ id: banner._id, payload: { isActive: !banner.isActive } }),
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Announcements</h1>
          <p>Manage the orange banner at the very top of the site</p>
        </div>
        <button className="admin-btn-primary" onClick={() => openModal()}>
          + Create Announcement
        </button>
      </header>

      <div className="admin-card">
        {loading ? (
          <p>Loading...</p>
        ) : topBanners.length === 0 ? (
          <p style={{ color: "var(--adm-text-3)", padding: "20px 0" }}>
            No announcements yet. Create your first one!
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Coupon Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topBanners.map((b) => (
                <tr key={b._id}>
                  <td>
                    <span
                      style={{
                        padding: "6px 12px",
                        background: "linear-gradient(90deg,#fc8019,#e56f0e)",
                        color: "#fff",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        display: "inline-block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 250,
                      }}
                    >
                      🎁 {b.title}
                    </span>
                  </td>
                  <td>
                    {b.couponCode ? (
                      <span
                        style={{
                          fontFamily: "monospace",
                          background: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {b.couponCode}
                      </span>
                    ) : (
                      "—"
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
            <h2>{editing ? "Edit Announcement" : "New Announcement"}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <label className="admin-form-field">
                <span>Announcement Text *</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="32% OFF on your first order above ₹199"
                  required
                />
              </label>

              <div className="admin-form-row">
                <label className="admin-form-field">
                  <span>Coupon Code (Optional)</span>
                  <input
                    value={form.couponCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        couponCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="WELCOME32"
                  />
                </label>
                <label className="admin-form-field">
                  <span>Button Text</span>
                  <input
                    value={form.ctaText}
                    onChange={(e) =>
                      setForm({ ...form, ctaText: e.target.value })
                    }
                  />
                </label>
              </div>

              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                <span>Show this announcement on the site</span>
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
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
