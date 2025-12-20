import React, { useState } from "react";

export default function UploadFile({ folder, onUploaded }) {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("http://localhost:8080/api/files/upload", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: formData
    });

    const url = await res.text();
    onUploaded(url);
  };

  return (
    <div>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={upload}>Upload</button>
    </div>
  );
}
