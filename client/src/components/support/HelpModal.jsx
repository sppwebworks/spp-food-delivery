/**
 * ============================================================
 * HELP MODAL — submit support ticket
 * ============================================================
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTicket } from "../../features/support/supportSlice";
import { useToast } from "../../context/ToastContext";
import Modal from "../common/Modal";

const CATEGORIES = [
  { value: "delivery", label: "🚴 Delivery Issue" },
  { value: "payment", label: "💳 Payment Issue" },
  { value: "quality", label: "🍽️ Food Quality" },
  { value: "wrong_item", label: "❌ Wrong / Missing Item" },
  { value: "refund", label: "💰 Refund" },
  { value: "other", label: "📝 Other" },
];

const HelpModal = ({ isOpen, onClose, orderId = null, orderLabel = "" }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { submitting } = useSelector((s) => s.support);

  const [category, setCategory] = useState("other");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      return showToast("Please enter a subject", "error");
    }
    if (description.trim().length < 10) {
      return showToast(
        "Please describe your issue in more detail (10+ chars)",
        "error",
      );
    }

    const result = await dispatch(
      createTicket({
        orderId,
        category,
        subject: subject.trim(),
        description: description.trim(),
      }),
    );

    if (createTicket.fulfilled.match(result)) {
      showToast(
        result.payload.message ||
          "Ticket created! We'll respond within 24 hours.",
        "success",
      );
      setSubject("");
      setDescription("");
      setCategory("other");
      onClose();
    } else {
      showToast(result.payload || "Failed to create ticket", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
        🎧 Get Help
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>
        {orderLabel
          ? `Regarding: ${orderLabel}`
          : "Tell us what's wrong and we'll help you fix it."}
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        {/* Category */}
        <div>
          <label style={labelStyle}>What's this about?</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label style={labelStyle}>Subject</label>
          <input
            type="text"
            placeholder="Brief summary of the issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            required
            style={inputStyle}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              marginTop: 4,
              textAlign: "right",
            }}
          >
            {subject.length}/200
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Details</label>
          <textarea
            placeholder="Please describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            required
            rows={5}
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              marginTop: 4,
              textAlign: "right",
            }}
          >
            {description.length}/2000
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 8 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-2)",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1.5px solid var(--border)",
  fontSize: 14,
  fontFamily: "inherit",
  background: "var(--bg)",
  color: "var(--text)",
};

export default HelpModal;
