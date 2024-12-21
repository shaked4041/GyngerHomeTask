import styles from './style.module.scss';
import { Bill } from '../../interfaces';

export interface UploadedFilesProps {
    files: Bill[];
}

const UploadedFiles: React.FC<UploadedFilesProps> = ({ files }) => {

    if (!Array.isArray(files)) {
        return <div className={styles.mainContainer}>Error: Files data is not an array</div>;
    }

    return (
        <div className={styles.mainContainer}>
            <h2>Uploaded Files</h2>
            <ul className={styles.innerContainer}>
                {files.length > 0 ? (
                    files.map((file) => (
                        <li key={file.id} className={styles.fileItem}>
                            <span>{file.vendorName || 'Unknown Vendor'}</span> - $<span>{file.amount?.toFixed(2) || '0.00'}</span> -{' '}
                            <span>{file.date ? new Date(file.date).toLocaleDateString() : 'Unknown Date'}</span>
                        </li>
                    ))
                ) : (
                    <li className={styles.emptyMessage}>No files uploaded yet.</li>
                )}
            </ul>
        </div>
    )
}


export default UploadedFiles;