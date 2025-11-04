import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;
  if (!uri) {
    throw new Error("MONGO_URI not set");
  }
  await mongoose.connect(`${uri}/${process.env.DB_NAME}`);
  console.log("DB Connected");
};
