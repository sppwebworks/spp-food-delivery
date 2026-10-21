/**
 * ============================================================
 * PROFILE PAGE  (/profile) — Premium Tabbed Layout + Avatar
 * ============================================================
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { loadUser } from "../features/auth/authSlice";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../features/address/addressSlice";
import Modal from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Added
  const { showToast } = useToast();
  const { user } = useSelector((s) => s.auth);
  const { items: addresses } = useSelector((s) => s.address);

  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "addresses") {
      dispatch(fetchAddresses());
    }
  }, [dispatch, activeTab]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return showToast("Image must be less than 2MB", "error");
    }
    if (!file.type.startsWith("image/")) {
      return showToast("Please upload a valid image", "error");
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      await api.post("/auth/upload-avatar", formData);
      await dispatch(loadUser());
      showToast("Profile picture updated!", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to upload image",
        "error",
      );
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/me", form);
      await dispatch(loadUser());
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast("New passwords do not match", "error");
    }
    if (passwords.newPassword.length < 6) {
      return showToast("Password must be at least 6 characters", "error");
    }
    setChangingPassword(true);
    try {
      await api.put("/auth/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      showToast("Password changed successfully", "success");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Failed to change password. Check current password.",
        "error",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setNewAddr({ label: "Home", line1: "", line2: "", city: "", pincode: "" });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setNewAddr({
      label: addr.label || "Home",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (
      !newAddr.line1.trim() ||
      !newAddr.city.trim() ||
      !newAddr.pincode.trim()
    ) {
      showToast("Line 1, City and Pincode are required", "error");
      return;
    }

    if (editingAddressId) {
      const result = await dispatch(
        updateAddress({ id: editingAddressId, addressData: newAddr }),
      );
      if (updateAddress.fulfilled.match(result)) {
        showToast("Address updated", "success");
        setShowAddressModal(false);
      } else {
        showToast(result.payload || "Failed to update address", "error");
      }
    } else {
      const result = await dispatch(createAddress(newAddr));
      if (createAddress.fulfilled.match(result)) {
        showToast("Address added", "success");
        setShowAddressModal(false);
      } else {
        showToast(result.payload || "Failed to add address", "error");
      }
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    const result = await dispatch(deleteAddress(id));
    if (deleteAddress.fulfilled.match(result)) {
      showToast("Address deleted", "info");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className="container"
      style={{ maxWidth: 960, padding: "24px 20px 60px" }}
    >
      <div className="profile-hero">
        <div className="profile-avatar-wrapper">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="profile-avatar-img"
            />
          ) : (
            <div className="profile-avatar-lg">{getInitials(user?.name)}</div>
          )}

          <button
            type="button"
            className="avatar-edit-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label="Upload profile picture"
          >
            {uploadingAvatar ? <span className="spinner-sm" /> : "📷"}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="profile-hero-info">
          <h1 className="profile-hero-name">{user?.name || "User"}</h1>
          <p className="profile-hero-email">{user?.email}</p>
          <span className="profile-hero-badge">Verified Account</span>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-text">Personal Details</span>
          </button>
          <button
            className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <span className="tab-icon">🔒</span>
            <span className="tab-text">Security & Password</span>
          </button>
          <button
            className={`profile-tab ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <span className="tab-icon">📍</span>
            <span className="tab-text">Saved Addresses</span>
          </button>
          {/* ✅ NEW: Support Tickets tab */}
          <button className="profile-tab" onClick={() => navigate("/support")}>
            <span className="tab-icon">🎧</span>
            <span className="tab-text">Support Tickets</span>
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "details" && (
            <form onSubmit={handleSaveProfile} className="profile-card">
              <div className="profile-card-header">
                <h2>Personal Details</h2>
                <p>Update your basic information here.</p>
              </div>

              <div className="profile-form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <span className="input-icon">📱</span>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Email Address</label>
                <div className="input-with-icon disabled">
                  <span className="input-icon">✉️</span>
                  <input value={user?.email || ""} disabled />
                </div>
                <small className="input-hint">Email cannot be changed.</small>
              </div>

              <div className="profile-actions">
                <button
                  type="submit"
                  className="btn-primary btn-large"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="profile-card">
              <div className="profile-card-header">
                <h2>Change Password</h2>
                <p>
                  Ensure your account is using a long, random password to stay
                  secure.
                </p>
              </div>

              <div className="profile-form-group">
                <label>Current Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>New Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔑</span>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Confirm New Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔑</span>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="submit"
                  className="btn-primary btn-large"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "addresses" && (
            <div className="profile-card">
              <div className="profile-card-header flex-row">
                <div>
                  <h2>Saved Addresses</h2>
                  <p>Manage where you want your food delivered.</p>
                </div>
                <button className="btn-primary" onClick={handleOpenAddAddress}>
                  + Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <EmptyState
                  icon="📍"
                  title="No addresses yet"
                  message="Add your delivery address to place orders faster."
                  actionLabel="Add Address"
                  onAction={handleOpenAddAddress}
                  compact
                />
              ) : (
                <div className="address-grid">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="address-card">
                      <div className="address-card-header">
                        <span className="address-label">
                          {addr.label === "Home"
                            ? "🏠"
                            : addr.label === "Work"
                              ? "💼"
                              : "📍"}{" "}
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="address-default">Default</span>
                        )}
                      </div>

                      <div className="address-card-body">
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>
                          {addr.city} — {addr.pincode}
                        </p>
                      </div>

                      <div className="address-card-actions">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="address-action-btn edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="address-action-btn delete"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      >
        <h2 style={{ marginBottom: 20 }}>
          {editingAddressId ? "Edit Address" : "Add New Address"}
        </h2>
        <form
          onSubmit={handleSaveAddress}
          className="profile-form-group"
          style={{ gap: 14 }}
        >
          <div className="profile-form-group" style={{ marginBottom: 0 }}>
            <label>Save As</label>
            <div className="label-chips">
              {["Home", "Work", "Other"].map((lbl) => (
                <button
                  type="button"
                  key={lbl}
                  className={`label-chip ${newAddr.label === lbl ? "active" : ""}`}
                  onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-form-group" style={{ marginBottom: 0 }}>
            <label>Address Line 1 *</label>
            <input
              placeholder="House/Flat No., Building Name"
              value={newAddr.line1}
              onChange={(e) =>
                setNewAddr({ ...newAddr, line1: e.target.value })
              }
              required
            />
          </div>

          <div className="profile-form-group" style={{ marginBottom: 0 }}>
            <label>Address Line 2 (Optional)</label>
            <input
              placeholder="Street, Landmark"
              value={newAddr.line2}
              onChange={(e) =>
                setNewAddr({ ...newAddr, line2: e.target.value })
              }
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div className="profile-form-group" style={{ marginBottom: 0 }}>
              <label>City *</label>
              <input
                placeholder="City"
                value={newAddr.city}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, city: e.target.value })
                }
                required
              />
            </div>
            <div className="profile-form-group" style={{ marginBottom: 0 }}>
              <label>Pincode *</label>
              <input
                placeholder="6-digit Pincode"
                value={newAddr.pincode}
                onChange={(e) =>
                  setNewAddr({
                    ...newAddr,
                    pincode: e.target.value.replace(/\D/g, ""),
                  })
                }
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowAddressModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingAddressId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
