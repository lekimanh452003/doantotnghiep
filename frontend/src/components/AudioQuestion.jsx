import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
function UploadAudio({ currentQuestion, setCurrentQuestion }) {
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const fileRef = ref(storage, `audios/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
  
      // Gán url vào currentQuestion
      setCurrentQuestion({ ...currentQuestion, audioUrl: url });
    };
  
    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tải lên file âm thanh (nếu có)
        </label>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
      </div>
    );
  }
  
  export default UploadAudio;
  