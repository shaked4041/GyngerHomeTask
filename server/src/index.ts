import express, { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import dotenv from 'dotenv';
import csv from 'csv-parser';
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import connectDB from './db'
import BillModel from './bills/bill.model';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isCSV = file.mimetype === 'text/csv';
    if (!isCSV) {
      return cb(null, false);
    }
    cb(null, true);
  },
});

const fuzzyMatchVendor = (name1: string, name2: string): boolean => {
  const normalize = (str: string): string => str.toLowerCase().replace(/\s/g, '');
  name1 = normalize(name1);
  name2 = normalize(name2);

  if (name1 === name2) return true;
  if (Math.abs(name1.length - name2.length) > 1) return false;
  let mismatchCount = 0;
  for (let i = 0, j = 0; i < name1.length && j < name2.length; i++, j++) {
    if (name1[i] !== name2[j]) {
      mismatchCount++;
      if (name1.length > name2.length) j--;
      if (name1.length < name2.length) i--;

      if (mismatchCount > 1) return false;
    }
  }
  return mismatchCount <= 1;
}


app.post('/bills', upload.single('file'), (req: Request, res: Response)=> {

  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const results: any[] = [];
  const fileBuffer = req.file.buffer;

  const parseCSV = csv({
    mapHeaders: ({ header }) => header.toLowerCase().replace(/\s+/g, ''),
  });

  const readStream = Readable.from(fileBuffer);

  readStream
    .pipe(parseCSV)
    .on('data', (data: any) => {
      const amount = data.amount?.trim();
      const vendorName = data.vendorname?.trim();
      const date = data.date?.trim();

      console.log('Parsed Data:', data);

      if (!amount || !vendorName || !date) {
        console.warn('Skipping row due to missing fields:', data);
        return;
      }

      const duplicate = results.find(
        (bill) =>
          bill.amount === parseFloat(amount) &&
          bill.date === date &&
          fuzzyMatchVendor(bill.vendorName, vendorName)
      );

      if (!duplicate) {
        results.push({
          id: uuidv4(),
          amount: parseFloat(amount),
          date,
          vendorName
        });
      }
    })
    .on('end', async () => {
      if (results.length > 0) {
        try {
          await BillModel.insertMany(results);
          res.status(200).json({ message: 'File processed and data saved to MongoDB', results });
        } catch (error) {
          console.error('Error inserting data into MongoDB:', error);
          res.status(500).json({ error: 'Failed to save data to MongoDB' });
        }
      } else {
        res.status(400).json({ error: 'No valid data to save' });
      }
    })
    .on('error', (err: any) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Error parsing CSV file' });
    });
});




app.get('/bills', async (req: Request, res: Response) => {
  try {
    const bills = await BillModel.find();
    res.status(200).json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
