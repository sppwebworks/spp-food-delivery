/**
 * ============================================================
 * RESTAURANT FORM MODAL
 * ============================================================
 * Every field is editable. Image preview, validation, error hints.
 * Includes ImageUploader for URL + Local file upload.
 * ============================================================
 */

import { useEffect, useState } from "react";
import Modal from "./Modal";
import ImageUploader from "./ImageUploader"; // ✅ Added

const emptyForm = {
  name: "",
  description: "",
  image: "",
  cuisines: "",
  address: {
    line1: "",
    line2: "",
    city: "Bangalore",
    pincode: "",
  },
  phone: "",
  rating: 4.5,
  reviewCount: 0,
  deliveryTime: 30,
  priceForTwo: 400,
  offer: "",
  isVeg: false,
  isActive: true,
  isFeatured: false,
};

const RestaurantFormModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        ...emptyForm,
        ...initialData,
        cuisines: Array.isArray(initialData.cuisines)
          ? initialData.cuisines.join(", ")
          : initialData.cuisines || "",
        address: { ...emptyForm.address, ...(initialData.address || {}) },
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const handleAddressChange = (key, value) => {
    setForm((f) => ({ ...f, address: { ...f.address, [key]: value } }));
    if (errors[`address.${key}`]) {
      setErrors((e) => ({ ...e, [`address.${key}`]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Name is required";
    if (!form.image?.trim()) errs.image = "Image is required";
    if (!form.cuisines?.trim()) errs.cuisines = "At least one cuisine required";
    if (!form.address.line1?.trim())
      errs["address.line1"] = "Address line 1 is required";
    if (!form.address.city?.trim()) errs["address.city"] = "City is required";
    if (!form.address.pincode?.trim())
      errs["address.pincode"] = "Pincode is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || "",
      image: form.image.trim(),
      cuisines: String(form.cuisines)
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      address: {
        line1: form.address.line1.trim(),
        line2: form.address.line2?.trim() || "",
        city: form.address.city.trim(),
        pincode: form.address.pincode.trim(),
      },
      phone: form.phone?.trim() || "",
      rating: Number(form.rating) || 4.5,
      reviewCount: Number(form.reviewCount) || 0,
      deliveryTime: Number(form.deliveryTime) || 30,
      priceForTwo: Number(form.priceForTwo) || 400,
      offer: form.offer?.trim() || "",
      isVeg: !!form.isVeg,
      isActive: !!form.isActive,
      isFeatured: !!form.isFeatured,
    };

    await onSave(payload);
    setSaving(false);
  };

  const isEditing = !!initialData;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <h2>{isEditing ? "Edit Restaurant" : "Add Restaurant"}</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        {/* ---------- BASIC INFO ---------- */}
        <label className="admin-form-field">
          <span>Restaurant Name *</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Paradise Biryani"
            autoFocus
            className={errors.name ? "has-error" : ""}
          />
          {errors.name && <small className="field-error">{errors.name}</small>}
        </label>

        <label className="admin-form-field">
          <span>Description</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Iconic Hyderabadi biryani since 1953..."
          />
        </label>

        {/* ---------- IMAGE (UPLOADER RESTORED) ---------- */}
        <div className="admin-form-field">
          <ImageUploader
            label="Cover Image"
            value={form.image}
            onChange={(url) => handleChange("image", url)}
            required
          />
          {errors.image && (
            <small
              className="field-error"
              style={{ display: "block", marginTop: 4 }}
            >
              {errors.image}
            </small>
          )}
        </div>

        {/* ---------- CUISINES ---------- */}
        <label className="admin-form-field">
          <span>Cuisines * (comma-separated)</span>
          <input
            type="text"
            value={form.cuisines}
            onChange={(e) => handleChange("cuisines", e.target.value)}
            placeholder="Biryani, Hyderabadi, Mughlai, North Indian"
            className={errors.cuisines ? "has-error" : ""}
          />
          {errors.cuisines && (
            <small className="field-error">{errors.cuisines}</small>
          )}
          <small className="field-hint">
            Separate with commas. Example: "Pizza, Italian, Fast Food"
          </small>
        </label>

        {/* ---------- ADDRESS ---------- */}
        <div className="admin-form-section-title">📍 Address</div>

        <div className="admin-form-row">
          <label className="admin-form-field">
            <span>Address Line 1 *</span>
            <input
              type="text"
              value={form.address.line1}
              onChange={(e) => handleAddressChange("line1", e.target.value)}
              placeholder="12 MG Road"
              className={errors["address.line1"] ? "has-error" : ""}
            />
            {errors["address.line1"] && (
              <small className="field-error">{errors["address.line1"]}</small>
            )}
          </label>

          <label className="admin-form-field">
            <span>Address Line 2</span>
            <input
              type="text"
              value={form.address.line2}
              onChange={(e) => handleAddressChange("line2", e.target.value)}
              placeholder="Near Metro Station"
            />
          </label>
        </div>

        <div className="admin-form-row">
          <label className="admin-form-field">
            <span>City *</span>
            <input
              type="text"
              value={form.address.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              className={errors["address.city"] ? "has-error" : ""}
            />
            {errors["address.city"] && (
              <small className="field-error">{errors["address.city"]}</small>
            )}
          </label>

          <label className="admin-form-field">
            <span>Pincode *</span>
            <input
              type="text"
              value={form.address.pincode}
              onChange={(e) => handleAddressChange("pincode", e.target.value)}
              maxLength={10}
              placeholder="560001"
              className={errors["address.pincode"] ? "has-error" : ""}
            />
            {errors["address.pincode"] && (
              <small className="field-error">{errors["address.pincode"]}</small>
            )}
          </label>
        </div>

        {/* ---------- CONTACT ---------- */}
        <div className="admin-form-section-title">📞 Contact</div>

        <div className="admin-form-row">
          <label className="admin-form-field">
            <span>Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="08041234567"
            />
          </label>

          <label className="admin-form-field">
            <span>Offer (shown on card)</span>
            <input
              type="text"
              value={form.offer}
              onChange={(e) => handleChange("offer", e.target.value)}
              placeholder="50% OFF up to ₹100"
            />
          </label>
        </div>

        {/* ---------- METRICS ---------- */}
        <div className="admin-form-section-title">⭐ Ratings & Delivery</div>

        <div className="admin-form-row admin-form-row-3">
          <label className="admin-form-field">
            <span>Rating (0–5)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => handleChange("rating", e.target.value)}
            />
          </label>

          <label className="admin-form-field">
            <span>Reviews count</span>
            <input
              type="number"
              min="0"
              value={form.reviewCount}
              onChange={(e) => handleChange("reviewCount", e.target.value)}
              placeholder="1000"
            />
          </label>

          <label className="admin-form-field">
            <span>Delivery time (min)</span>
            <input
              type="number"
              min="5"
              max="120"
              value={form.deliveryTime}
              onChange={(e) => handleChange("deliveryTime", e.target.value)}
            />
          </label>
        </div>

        <label className="admin-form-field">
          <span>Price for two (₹)</span>
          <input
            type="number"
            min="0"
            value={form.priceForTwo}
            onChange={(e) => handleChange("priceForTwo", e.target.value)}
          />
        </label>

        {/* ---------- FLAGS ---------- */}
        <div className="admin-form-flags">
          <label className="admin-form-checkbox">
            <input
              type="checkbox"
              checked={form.isVeg}
              onChange={(e) => handleChange("isVeg", e.target.checked)}
            />
            <span>🟢 Pure Veg</span>
          </label>

          <label className="admin-form-checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
            />
            <span>✅ Active</span>
          </label>

          <label className="admin-form-checkbox">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => handleChange("isFeatured", e.target.checked)}
            />
            <span>⭐ Featured</span>
          </label>
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="modal-actions">
          <button
            type="button"
            className="admin-btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving
              ? "Saving…"
              : isEditing
                ? "Update Restaurant"
                : "Create Restaurant"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RestaurantFormModal;
