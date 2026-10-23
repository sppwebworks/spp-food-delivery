import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/format";

const Riders = () => {
  const { showToast } = useToast();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // New Rider Modal State
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]); // List of customers to choose from
  const [form, setForm] = useState({
    userId: "",
    phone: "",
    vehicleType: "bike",
    vehicleNumber: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const url = filter ? `/admin/riders?status=${filter}` : "/admin/riders";
      const { data } = await api.get(url);
      setRiders(data.riders || []);
    } catch {
      showToast("Failed to load riders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  // Fetch all customers when modal opens to populate the dropdown
  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      // Assuming you have an endpoint to get all users/customers
      const { data } = await api.get("/admin/users");
      // Filter out users who are already admins or riders
      const customers = (data.users || data || []).filter(
        (u) => u.role === "customer" || !u.role,
      );
      setUsers(customers);
    } catch (err) {
      showToast("Failed to load customers", "error");
    }
  };

  const handleCreateRider = async (e) => {
    e.preventDefault();
    if (!form.userId) return showToast("Please select a user", "error");

    setSaving(true);
    try {
      await api.post("/admin/riders", form);
      showToast("Delivery partner added successfully", "success");
      setShowModal(false);
      setForm({
        userId: "",
        phone: "",
        vehicleType: "bike",
        vehicleNumber: "",
      });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add rider", "error");
    } finally {
      setSaving(false);
    }
  };

  const approve = async (id) => {
    try {
      await api.put(`/admin/riders/${id}/approve`);
      showToast("Rider approved", "success");
      load();
    } catch {
      showToast("Approval failed", "error");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this rider?")) return;
    try {
      await api.put(`/admin/riders/${id}/reject`);
      showToast("Rider rejected", "info");
      load();
    } catch {
      showToast("Reject failed", "error");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>🛵 Delivery Partners</h1>
          <p>{riders.length} total</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["", "available", "busy", "offline"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={
                filter === s ? "admin-btn-primary" : "admin-btn-outline"
              }
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {s || "All"}
            </button>
          ))}
          <button
            onClick={handleOpenModal}
            className="admin-btn-primary"
            style={{ padding: "8px 14px", fontSize: 13, marginLeft: 10 }}
          >
            + Add Rider
          </button>
        </div>
      </header>

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : riders.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">🛵</div>
          <h3>No riders yet</h3>
          <p>
            Click "+ Add Rider" to promote a customer to a delivery partner.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 16,
          }}
        >
          {riders.map((r) => (
            <div
              key={r._id}
              style={{
                background: "#fff",
                border: "1px solid #e9e9eb",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <strong>{r.user?.name || "Unknown"}</strong>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    background:
                      r.status === "available"
                        ? "#d1fae5"
                        : r.status === "busy"
                          ? "#fef3c7"
                          : "#e5e7eb",
                    color:
                      r.status === "available"
                        ? "#065f46"
                        : r.status === "busy"
                          ? "#92400e"
                          : "#4b5563",
                    textTransform: "uppercase",
                  }}
                >
                  {r.status}
                </span>
              </div>
              <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 6px" }}>
                📞 {r.phone} · {r.vehicleType}{" "}
                {r.vehicleNumber && `· ${r.vehicleNumber}`}
              </p>
              <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 6px" }}>
                ⭐ {r.rating.toFixed(1)} · {r.totalDeliveries} deliveries · ₹
                {r.totalEarnings}
              </p>
              <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 12px" }}>
                Joined {formatDate(r.createdAt)}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {!r.isApproved ? (
                  <>
                    <button
                      onClick={() => approve(r._id)}
                      className="admin-btn-primary"
                      style={{ flex: 1, padding: 8 }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => reject(r._id)}
                      className="admin-btn-danger"
                      style={{ flex: 1, padding: 8 }}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => reject(r._id)}
                    className="admin-btn-outline"
                    style={{
                      flex: 1,
                      padding: 8,
                      color: "#ef4444",
                      borderColor: "#fee2e2",
                    }}
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Rider Modal */}
      {showModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 500 }}
          >
            <h2>Add Delivery Partner</h2>
            <form
              onSubmit={handleCreateRider}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginTop: 16,
              }}
            >
              <label className="admin-form-field">
                <span>Select Customer *</span>
                <select
                  value={form.userId}
                  onChange={(e) => {
                    const selectedUser = users.find(
                      (u) => u._id === e.target.value,
                    );
                    setForm({
                      ...form,
                      userId: e.target.value,
                      phone: selectedUser?.phone || "",
                    });
                  }}
                  required
                >
                  <option value="">-- Select a user --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-form-field">
                <span>Phone Number *</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </label>

              <div style={{ display: "flex", gap: 12 }}>
                <label className="admin-form-field" style={{ flex: 1 }}>
                  <span>Vehicle Type</span>
                  <select
                    value={form.vehicleType}
                    onChange={(e) =>
                      setForm({ ...form, vehicleType: e.target.value })
                    }
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="car">Car</option>
                  </select>
                </label>

                <label className="admin-form-field" style={{ flex: 1 }}>
                  <span>Vehicle No.</span>
                  <input
                    type="text"
                    placeholder="KA01AB1234"
                    value={form.vehicleNumber}
                    onChange={(e) =>
                      setForm({ ...form, vehicleNumber: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Adding..." : "Add Rider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Riders;
