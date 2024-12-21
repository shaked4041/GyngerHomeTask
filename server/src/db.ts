import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URL as string;
        if (!mongoURI) {
            throw new Error('Mongo URI is not defined in the environment variables');
          }
        await mongoose.connect(mongoURI);
        console.log("DB - Connection Success");
    } catch (error) {
        console.log("MongoDB error:", error);
    }
}

export default connectDB;
