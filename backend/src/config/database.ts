import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined.");
    }

    const connection = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB Connection Failed");
    console.error(error);

    process.exit(1);
  }
};

export default connectDatabase;