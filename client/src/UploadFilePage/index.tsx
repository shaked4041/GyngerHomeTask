import React, { ChangeEvent, FormEvent, useState } from 'react';
import axios from 'axios';

const FileUpload: React.FC = () => {
    const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if(!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('http://localhost:4000/upload', formData,{
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        console.log("File uploaded successfully:", response.data);
    } catch (error) {
        console.error("Error uploading file:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );  
}

export default FileUpload;
