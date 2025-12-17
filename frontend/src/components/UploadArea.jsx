import React, { useState, useRef } from "react";
import api from "../api";

export default function UploadArea({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;

    setStatus("Uploading...");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/docs/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setStatus("Uploaded successfully");
      setFile(null);
      onUploaded();
    } catch (err) {
      setError("Upload failed");
      setStatus(null);
    }
  };

  return (
    <div className="upload-area">
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button className="btn" onClick={() => inputRef.current.click()}>
        Choose File
      </button>

      <span className="file-name">
        {file ? file.name : "No file chosen"}
      </span>

      <button
        className="btn upload"
        onClick={handleUpload}
        disabled={!file}
      >
        Upload
      </button>

      {status && <div className="muted">{status}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
