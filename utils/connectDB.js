import mongoose from 'mongoose';

const connectDB = async () => {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
      return;
    } catch (error) {
      attempts++;
      console.error(`MongoDB connection error (attempt ${attempts}/${maxRetries}):`, error);
      if (attempts === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s before retry
    }
  }
};

export default connectDB;