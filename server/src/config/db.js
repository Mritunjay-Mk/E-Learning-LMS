import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (!env.mongoUri) {
    if (env.isProduction) {
      throw new Error('MONGO_URI is required in production.');
    }
    console.warn('MONGO_URI is not set. Server started without a database connection.');
    return null;
  }

  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName
  });
  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
  return connection;
};
