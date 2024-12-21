import React, { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import styles from './style.module.scss';
import { Bill } from '../../interfaces';
import { IoCloudUploadSharp } from "react-icons/io5";

interface FileUploadProps {
  onFileUploaded: (file: Bill) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setErrorMessage('No file selected');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/csv'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Unsupported file type. Please upload a PDF, image, or CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post('http://localhost:4000/bills', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (Array.isArray(response.data)) {
        response.data.forEach((fileData: Bill) => onFileUploaded(fileData));        
      } else {
        onFileUploaded(response.data);
      }

      setFile(null);      
    } catch (error: any) {
      console.error('Error uploading file:', error.message || error);
      setErrorMessage('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className={styles.mainContainer}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>

        <div className={styles.iconContainer}>
          <label htmlFor="file-upload" className={styles.uploadLabel}>
            <IoCloudUploadSharp className={styles.uploadIcon} aria-label="Upload icon" />
          </label>
          <input type="file"
            id="file-upload"
            style={{ display: 'none' }}
            aria-label="File upload input"
            onChange={handleFileChange} />
        </div>
        {file && <span className={styles.fileName}>Selected File: {file.name}</span>}
        <button type="submit" disabled={isUploading} className={styles.submitButton}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
    </div>
  );
}

export default FileUpload;
