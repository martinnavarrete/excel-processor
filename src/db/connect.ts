import mongoose from 'mongoose';
const URL = 'mongodb://localhost:27017/excel-processor';

export function connect() {
  console.log('Connecting to MongoDB');
  return mongoose
    .connect(URL, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      console.log('Error connecting to MongoDB', err);
      process.exit(1);
    });
}
