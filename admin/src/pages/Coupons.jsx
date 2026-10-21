import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatDate } from "../utils/format";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "",
  expiresAt: "",
  maxUses: "",
  isActive: true,
};

const Coupons = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/coupons");
      setCoupons(data.coupons || []);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      ...coupon,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await api.delete(`/admin/coupons/${coupon._id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
      showToast("Coupon deleted", "success");
    } catch (e) {
      showToast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/admin/coupons/${editing._id}`, form);
        setCoupons((prev) =>
          prev.map((c) => (c._id === editing._id ? data : c)),
        );
        showToast("Coupon updated", "success");
      } else {
        const { data } = await api.post("/admin/coupons", form);
        setCoupons((prev) => [data, ...prev]);
        showToast("Coupon created", "success");
      }
      setModalOpen(false);
    } catch (e) {
      showToast(e.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Coupons</h1>
          <p>
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          onClick={handleCreate}
        >
          + Create Coupon
        </button>
      </header>

      {loading && coupons.length === 0 && (
        <div className="admin-loading">Loading...</div>
      )}

      {!loading && coupons.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">🎟️</div>
          <h3>No coupons yet</h3>
          <p>Click "Create Coupon" to add your first discount code</p>
        </div>
      )}

      {coupons.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Expires</th>
                <th>Used</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td>
                    <code
                      style={{
                        background: "var(--adm-primary-light)",
                        color: "var(--adm-primary)",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontWeight: 800,
                      }}
                    >
                      {c.code}
                    </code>
                  </td>
                  <td>
                    <strong>
                      {c.discountType === "percentage"
                        ? `${c.discountValue}%`
                        : formatCurrency(c.discountValue)}
                    </strong>
                    {c.discountType === "percentage" && c.maxDiscount > 0 && (
                      <small
                        style={{ display: "block", color: "var(--adm-text-3)" }}
                      >
                        max {formatCurrency(c.maxDiscount)}
                      </small>
                    )}
                  </td>
                  <td>
                    {c.minOrderValue > 0
                      ? formatCurrency(c.minOrderValue)
                      : "—"}
                  </td>
                  <td>{formatDate(c.expiresAt)}</td>
                  <td>
                    {c.usedCount} / {c.maxUses > 0 ? c.maxUses : "∞"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${c.isActive ? "status-delivered" : "status-cancelled"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="admin-btn-outline btn-sm"
                        onClick={() => handleEdit(c)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="admin-btn-danger btn-sm"
                        onClick={() => handleDelete(c)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560 }}
          >
            <h2>{editing ? "Edit Coupon" : "Create Coupon"}</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <label className="admin-form-field">
                  <span>Code *</span>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    required
                    disabled={!!editing}
                  />
                </label>
                <label className="admin-form-field">
                  <span>Type *</span>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </label>
              </div>
              <label className="admin-form-field">
                <span>Description</span>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <div className="admin-form-row">
                <label className="admin-form-field">
                  <span>Discount Value *</span>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({ ...form, discountValue: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="admin-form-field">
                  <span>Max Discount (₹)</span>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) =>
                      setForm({ ...form, maxDiscount: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-form-field">
                  <span>Min Order (₹)</span>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) =>
                      setForm({ ...form, minOrderValue: e.target.value })
                    }
                  />
                </label>
                <label className="admin-form-field">
                  <span>Max Uses</span>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm({ ...form, maxUses: e.target.value })
                    }
                  />
                </label>
              </div>
              <label className="admin-form-field">
                <span>Expires At *</span>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  required
                />
              </label>
              <div className="admin-form-checkbox" style={{ padding: "8px 0" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  id="isActive"
                />
                <label htmlFor="isActive" style={{ marginLeft: 8 }}>
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Coupons;
