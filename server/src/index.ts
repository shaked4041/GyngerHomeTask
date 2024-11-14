import express, { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import csv from 'csvtojson';

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:4000', 
  }));

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueName}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get('/', (req: Request, res: Response) => {
  res.send('hellooooooo');
});

app.post('/upload', upload.single('file'), (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
        console.log('File uploaded:', req.file);
      res.status(200).json({ message: 'File uploaded successfully' });
      csv().fromFile(req.file.path).then((jsonObj) => {
        console.log(jsonObj);
      })
            return;
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
  });
  
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
