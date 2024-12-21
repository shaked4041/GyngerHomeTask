import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBill extends Document {
    id: string;
    amount: number;
    date: string;
    vendorName: string;
}

const BillSchema : Schema = new Schema<IBill>({
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    vendorName: { type: String, required: true }
})

const BillModel: Model<IBill> = mongoose.model<IBill>('Bill', BillSchema)

export default BillModel;
