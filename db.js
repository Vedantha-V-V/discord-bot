import { connect } from 'mongoose'
import { config } from 'dotenv'

config()

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI, {});
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

export default connectDB;