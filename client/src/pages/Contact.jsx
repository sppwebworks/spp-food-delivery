/**
 * ============================================================
 * CONTACT PAGE  (/contact)
 * ============================================================
 * Sections:
 *   1. Hero — "Say hello"
 *   2. Contact cards (Email, Phone, Address, Hours)
 *   3. Contact form (submits to /api/contact)
 *   4. FAQ accordion
 * ============================================================
 */

import { useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const CONTACT_INFO = [
  {
    icon: "📧",
    title: "Email Us",
    value: "hello@foodiehub.com",
    hint: "We reply within 24 hours",
    href: "mailto:hello@foodiehub.com",
  },
  {
    icon: "📞",
    title: "Call Us",
    value: "+91 98765 43210",
    hint: "Mon–Sat, 9 AM – 9 PM",
    href: "tel:+919876543210",
  },
  {
    icon: "📍",
    title: "Visit Us",
    value: "MG Road, Bangalore",
    hint: "Karnataka 560001, India",
    href: "https://maps.google.com/?q=MG+Road+Bangalore",
  },
  {
    icon: "🕐",
    title: "Working Hours",
    value: "9 AM – 9 PM",
    hint: "Monday to Saturday",
    href: null,
  },
];

const FAQ = [
  {
    q: "How do I track my order?",
    a: "Open your Orders page → tap the order → you'll see a live tracker that updates from 'Placed' to 'Delivered'.",
  },
  {
    q: "Can I cancel an order?",
    a: "Yes — you can cancel up to 2 minutes after placing the order. After that, the kitchen has already started preparing.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery, all major credit/debit cards via Stripe, Razorpay (UPI + cards + netbanking), and PhonePe.",
  },
  {
    q: "Do you deliver to my area?",
    a: "Enter your city on the Home page. If we deliver there, you'll see restaurants near you instantly.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds for cancelled or undelivered orders are processed within 3–5 business days to your original payment method.",
  },
];

const SUBJECTS = [
  "General Inquiry",
  "Order Issue",
  "Payment Problem",
  "Restaurant Partnership",
  "Report a Bug",
  "Feedback",
];

const Contact = () => {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (form.message.trim().length < 10) {
      showToast("Message must be at least 10 characters", "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });

      showToast("Message sent! We'll reply within 24 hours 🎉", "success");
      setForm({
        name: "",
        email: "",
        subject: SUBJECTS[0],
        message: "",
      });
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to send message",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* ============ HERO ============ */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <span className="contact-hero-eyebrow">GET IN TOUCH</span>
          <h1 className="contact-hero-title">
            We'd love to <span>hear from you</span>.
          </h1>
          <p className="contact-hero-subtitle">
            Questions, feedback, partnerships, or just want to say hi? Our team
            reads every message and replies within 24 hours.
          </p>
        </div>

        <div className="contact-hero-art" aria-hidden="true">
          <div className="contact-hero-emoji">💬</div>
          <div className="contact-hero-emoji contact-hero-emoji-2">✉️</div>
          <div className="contact-hero-emoji contact-hero-emoji-3">📞</div>
        </div>
      </section>

      {/* ============ CONTACT CARDS ============ */}
      <section className="contact-cards">
        {CONTACT_INFO.map((item) => {
          const Card = item.href ? "a" : "div";
          const extra = item.href
            ? {
                href: item.href,
                target: item.href.startsWith("http") ? "_blank" : undefined,
                rel: item.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined,
              }
            : {};
          return (
            <Card key={item.title} className="contact-card" {...extra}>
              <div className="contact-card-icon">{item.icon}</div>
              <h3 className="contact-card-title">{item.title}</h3>
              <p className="contact-card-value">{item.value}</p>
              <p className="contact-card-hint">{item.hint}</p>
            </Card>
          );
        })}
      </section>

      {/* ============ FORM + SIDE ============ */}
      <section className="contact-main">
        {/* FORM */}
        <div className="contact-form-card">
          <div className="contact-form-header">
            <h2>Send us a message</h2>
            <p>Fill in the form and we'll get back to you shortly.</p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <label className="contact-field">
                <span>
                  Full Name <em>*</em>
                </span>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  maxLength={60}
                  required
                />
              </label>

              <label className="contact-field">
                <span>
                  Email <em>*</em>
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="contact-field">
              <span>Subject</span>
              <select
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="contact-field">
              <span>
                Message <em>*</em>
              </span>
              <textarea
                rows={6}
                placeholder="How can we help you?"
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                maxLength={2000}
                required
              />
              <small className="contact-char-count">
                {form.message.length}/2000 characters
              </small>
            </label>

            <button
              type="submit"
              className="btn-primary btn-large contact-submit"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Message →"}
            </button>
          </form>
        </div>

        {/* SIDE PANEL */}
        <aside className="contact-side">
          <div className="contact-side-card contact-side-primary">
            <div className="contact-side-icon">🚀</div>
            <h3>Fast Response</h3>
            <p>
              Most inquiries get a reply in under 6 hours during working days.
            </p>
          </div>

          <div className="contact-side-card">
            <div className="contact-side-icon">🛡️</div>
            <h3>Order Issues?</h3>
            <p>
              For order-specific issues, have your Order ID ready to speed
              things up.
            </p>
          </div>

          <div className="contact-side-card">
            <div className="contact-side-icon">🤝</div>
            <h3>Partnerships</h3>
            <p>
              Restaurant owner? Choose "Restaurant Partnership" as the subject.
            </p>
          </div>
        </aside>
      </section>

      {/* ============ FAQ ============ */}
      <section className="contact-faq">
        <div className="contact-faq-header">
          <span className="contact-hero-eyebrow">FREQUENTLY ASKED</span>
          <h2>Quick answers</h2>
          <p>Most common questions, answered.</p>
        </div>

        <div className="contact-faq-list">
          {FAQ.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className={`contact-faq-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="contact-faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="contact-faq-icon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <div className="contact-faq-answer">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Contact;
