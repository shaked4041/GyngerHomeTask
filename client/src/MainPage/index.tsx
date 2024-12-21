import { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload'
import UploadedFiles from '../components/UploadedFiles'
import styles from './style.module.scss';
import { Bill } from '../interfaces';
import axios from 'axios';

const MainPage: React.FC = () => {

  const [files, setFiles] = useState<Bill[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:4000/bills');
        console.log('Fetched bills:', response.data); // Check what you get in response
        if (Array.isArray(response.data)) {
          setFiles(response.data);
        } else {
          console.error('Response data is not an array:', response.data);
        }
      } catch (error: any) {
        console.error('Error fetching bills:', error.message);
      }
    };

    fetchFiles();
  }, []);

  const handleFileUploaded = (newFile: Bill) => {
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };  



  return (
    <div className={styles.mainPageContainer}>
      <h1 className={styles.title}>Upload Your File</h1>
      <FileUpload onFileUploaded={handleFileUploaded} />
      <UploadedFiles key={files.length} files={files} />
    </div>
  )
}


export default MainPage;
