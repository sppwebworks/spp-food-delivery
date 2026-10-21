/**
 * ============================================================
 * IMAGE UPLOADER — Tabs for URL input + file upload
 * ============================================================
 * Props:
 *   value        → string (current image URL)
 *   onChange     → (url) => void
 *   label        → string (default "Image")
 *   required     → bool (default false)
 *   uploadUrl    → API endpoint for uploads (default "/upload")
 * ============================================================
 */

import { useRef, useState } from "react";
import api from "../services/api";

const ImageUploader = ({
  value = "",
  onChange,
  label = "Image",
  required = false,
  uploadUrl = "/upload",
}) => {
  const [mode, setMode] = useState("url"); // "url" | "upload"
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleUrlChange = (e) => {
    setError("");
    onChange(e.target.value.trim());
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError("");

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Backend responds with { url: "/uploads/..." } or similar
      const imageUrl = data.url || data.path || data.imageUrl;
      if (!imageUrl) throw new Error("No URL returned from server");

      // If server returns relative path, prefix with backend origin
      const fullUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${imageUrl}`;

      onChange(fullUrl);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="image-uploader">
      {/* Label + tabs */}
      <div className="image-uploader-label">
        <span>
          {label} {required && <em>*</em>}
        </span>
        <div className="image-uploader-tabs">
          <button
            type="button"
            className={`image-uploader-tab ${mode === "url" ? "active" : ""}`}
            onClick={() => setMode("url")}
          >
            🔗 URL
          </button>
          <button
            type="button"
            className={`image-uploader-tab ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
          >
            📤 Upload
          </button>
        </div>
      </div>

      {/* URL mode */}
      {mode === "url" && (
        <input
          type="url"
          className="image-uploader-input"
          placeholder="https://images.unsplash.com/photo-..."
          value={value}
          onChange={handleUrlChange}
        />
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <div
          className={`image-uploader-drop ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="image-uploader-state">
              <div className="image-uploader-spinner" />
              <p className="image-uploader-text">Uploading...</p>
            </div>
          ) : (
            <div className="image-uploader-state">
              <div className="image-uploader-icon">📤</div>
              <p className="image-uploader-text">
                <strong>Click to upload</strong> or drag & drop
              </p>
              <p className="image-uploader-hint">PNG, JPG, WebP · max 5 MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="image-uploader-preview">
          <img src={value} alt="Preview" />
          <div className="image-uploader-preview-info">
            <span className="image-uploader-preview-label">Preview</span>
            <div className="image-uploader-preview-actions">
              <button
                type="button"
                className="image-uploader-action image-uploader-action-danger"
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="image-uploader-error">{error}</div>}
    </div>
  );
};

export default ImageUploader;
