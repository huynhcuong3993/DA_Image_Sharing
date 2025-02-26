'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ImageUploader() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!files) return;
    setLoading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));

    try {
      await axios.post('/api/upload', formData);
      alert('Upload successful!');
    } catch (error) {
      console.error(error);
      alert('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload Images</h2>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="file-input"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
