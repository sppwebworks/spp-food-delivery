import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import ImageUploader from "./ImageUploader";

const emptyForm = {
  name: "",
  description: "",
  image: "",
  price: "",
  mrp: "",
  category: "",
  isVeg: false,
  isAvailable: true,
  isRecommended: false,
  order: 0,
};

const MenuItemFormModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  existingCategories = [],
}) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  /* ---------- Reset form when modal opens ---------- */
  useEffect(() => {
    if (initialData) {
      setForm({ ...emptyForm, ...initialData });
    } else {
      setForm({
        ...emptyForm,
        // Auto-pick the first existing category if there is one
        category: existingCategories[0] || "",
      });
    }
    setAddingNewCategory(false);
    setNewCategoryInput("");
  }, [initialData, isOpen, existingCategories]);

  /* ---------- Dedupe + sort category list ---------- */
  const categories = useMemo(() => {
    const set = new Set(
      (existingCategories || []).map((c) => String(c).trim()).filter(Boolean),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [existingCategories]);

  /* ---------- Field helpers ---------- */
  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  /* ---------- Category: dropdown change ---------- */
  const handleCategorySelect = (value) => {
    if (value === "__ADD_NEW__") {
      setAddingNewCategory(true);
      setNewCategoryInput("");
      return;
    }
    handleChange("category", value);
  };

  /* ---------- Category: confirm new ---------- */
  const confirmNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    handleChange("category", trimmed);
    setAddingNewCategory(false);
    setNewCategoryInput("");
  };

  /* ---------- Category: cancel new ---------- */
  const cancelNewCategory = () => {
    setAddingNewCategory(false);
    setNewCategoryInput("");
    // If we cancelled and no category is set, fall back to first existing
    if (!form.category && categories.length > 0) {
      handleChange("category", categories[0]);
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category?.trim()) {
      // Simple guard — the category input is required
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: (form.description || "").trim(),
      image: (form.image || "").trim(),
      price: Number(form.price),
      mrp: Number(form.mrp) || 0,
      category: form.category.trim(),
      isVeg: !!form.isVeg,
      isAvailable: !!form.isAvailable,
      isRecommended: !!form.isRecommended,
      order: Number(form.order) || 0,
    };

    await onSave(payload);
    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <h2>{initialData ? "Edit Menu Item" : "Add Menu Item"}</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        {/* ---------- NAME ---------- */}
        <label className="admin-form-field">
          <span>Item Name *</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Chicken Chettinad"
            required
          />
        </label>

        {/* ---------- DESCRIPTION ---------- */}
        <label className="admin-form-field">
          <span>Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Fiery Chettinad curry with roasted spices, coconut, and curry leaves"
          />
        </label>

        {/* ---------- IMAGE ---------- */}
        <ImageUploader
          label="Item Image"
          value={form.image}
          onChange={(url) => handleChange("image", url)}
        />

        {/* ---------- CATEGORY ---------- */}
        <div className="admin-form-field">
          <span>
            Category *{" "}
            {addingNewCategory && (
              <em
                style={{
                  fontStyle: "normal",
                  textTransform: "none",
                  color: "var(--adm-primary)",
                  fontWeight: 700,
                }}
              >
                (new)
              </em>
            )}
          </span>

          {!addingNewCategory ? (
            <div className="category-select-wrap">
              <select
                value={form.category || ""}
                onChange={(e) => handleCategorySelect(e.target.value)}
                required
                className="category-select"
              >
                {!form.category && (
                  <option value="" disabled>
                    Select a category…
                  </option>
                )}
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__ADD_NEW__">➕ Add new category…</option>
              </select>

              {categories.length === 0 && (
                <p className="category-hint">
                  No categories yet — click <strong>Add new</strong> to create
                  your first one.
                </p>
              )}
            </div>
          ) : (
            <div className="category-new-row">
              <input
                type="text"
                autoFocus
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="e.g. Salads, Soups, Combos"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmNewCategory();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelNewCategory();
                  }
                }}
              />
              <button
                type="button"
                className="admin-btn-primary btn-sm"
                onClick={confirmNewCategory}
                disabled={!newCategoryInput.trim()}
              >
                ✓ Use
              </button>
              <button
                type="button"
                className="admin-btn-outline btn-sm"
                onClick={cancelNewCategory}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* ---------- PRICE + MRP ---------- */}
        <div className="admin-form-row">
          <label className="admin-form-field">
            <span>Price (₹) *</span>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              required
            />
          </label>
          <label className="admin-form-field">
            <span>MRP (₹)</span>
            <input
              type="number"
              min="0"
              value={form.mrp}
              onChange={(e) => handleChange("mrp", e.target.value)}
            />
          </label>
        </div>

        {/* ---------- ORDER ---------- */}
        <label className="admin-form-field">
          <span>Order (sort within category)</span>
          <input
            type="number"
            value={form.order}
            onChange={(e) => handleChange("order", e.target.value)}
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
            <span>Is Veg</span>
          </label>
          <label className="admin-form-checkbox">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => handleChange("isAvailable", e.target.checked)}
            />
            <span>Available</span>
          </label>
          <label className="admin-form-checkbox">
            <input
              type="checkbox"
              checked={form.isRecommended}
              onChange={(e) => handleChange("isRecommended", e.target.checked)}
            />
            <span>Bestseller</span>
          </label>
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="modal-actions">
          <button type="button" className="admin-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={saving || !form.category}
          >
            {saving ? "Saving..." : initialData ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MenuItemFormModal;
