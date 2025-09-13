import mongoose from "mongoose"
import dotenv from 'dotenv'

dotenv.config();
export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
      if(!mongoUri){
        throw new Error('MONGO_URI is not connected');
      }
      await mongoose.connect(mongoUri);
      console.log("MongoDb connected successfully");
    } catch (error) {
        console.error("Error :",error);
        process.exit(1);
    }
} 