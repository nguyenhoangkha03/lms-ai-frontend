'use client';

import React, { useState } from 'react';
import { useUploadUserAvatarMutation } from '@/lib/redux/api/admin-api';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userId, setUserId] = useState(''); // nhập userId để test
  const [uploadUserAvatar, { isLoading, error, data }] =
    useUploadUserAvatarMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) {
      alert('Vui lòng chọn file và nhập userId');
      return;
    }

    try {
      const result = await uploadUserAvatar({ userId, file }).unwrap();
      alert('Upload thành công: ' + result.avatarUrl);
    } catch (err: any) {
      console.error(err);
      alert('Upload thất bại: ' + (err?.data?.message || err?.error));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Upload Avatar</h1>

      <div style={{ marginBottom: 10 }}>
        <label>User ID: </label>
        <input
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Nhập userId"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {preview && (
        <div style={{ marginBottom: 10 }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: 150,
              height: 150,
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        </div>
      )}

      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload Avatar'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: 10 }}>
          Error: {(error as any)?.data?.message || JSON.stringify(error)}
        </div>
      )}

      {data && (
        <div style={{ color: 'green', marginTop: 10 }}>
          Success! Avatar URL: {data.avatarUrl}
        </div>
      )}
    </div>
  );
}
