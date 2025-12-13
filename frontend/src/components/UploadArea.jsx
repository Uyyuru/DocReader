import React, { useState, useRef } from "react";
import api from "../api";

export default function UploadArea({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading...');
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/docs/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setStatus('Uploaded: ' + (res.data.filename || 'OK'));
      } else if (res.data && res.data.message) {
        setStatus(res.data.message);
      } else {
        setStatus('Upload response received');
      }
      setFile(null);
      onUploaded && onUploaded();
    } catch (err) {
      const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
      if (err?.response?.status === 401) {
        setError('Not authenticated. Please login before uploading.');
      } else {
        setError(serverMessage || err.message || 'Upload failed');
      }
      setStatus(null);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const openFilePicker = () => inputRef.current && inputRef.current.click();

  return (
    <div className="upload-area">
      <div className="upload-left file-input-wrapper">
        <input ref={inputRef} type="file" id="file-input" onChange={handleFileChange} style={{ display: 'none' }} />
        <button type="button" className="btn file-btn" onClick={openFilePicker}>
          {file ? 'Change file' : 'Choose file'}
        </button>
        <div className="file-name">{file ? file.name : 'No file chosen'}</div>
        <button className="btn upload" onClick={handleUpload} disabled={!file}>Upload</button>
      </div>
      <div className="upload-right">
        {status && <div className="muted">{status}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
