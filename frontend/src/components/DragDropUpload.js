import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL as API } from "../config";
//const API = process.env.REACT_APP_API || "http://localhost:8080/api";

export default function DragDropUpload({ folder, onUploaded, token }) {
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await axios.post(API + "/files/upload", formData, {
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      // Pass back both original URL and HLS URL
      onUploaded(res.data);
      setProgress(0);
    } catch (err) {
      alert("Upload failed");
      setProgress(0);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleUpload(e.dataTransfer.files[0]);
      }}
      style={{
        border: `2px dashed ${isDragOver ? "green" : "#ccc"}`,
        padding: 20,
        textAlign: "center",
        background: isDragOver ? "#f0fff0" : "#fafafa",
        cursor: "pointer"
      }}
    >
      <input
        type="file"
        style={{display: 'none'}}
        id={"file-"+folder}
        onChange={(e) => handleUpload(e.target.files[0])}
      />
      <label htmlFor={"file-"+folder} style={{cursor: "pointer"}}>
        {progress > 0
          ? `Uploading: ${progress}%`
          : "Drag & Drop file here, or click to select"}
      </label>
    </div>
  );
}