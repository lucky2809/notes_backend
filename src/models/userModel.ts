import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  name?: string;
  username?: string;
  googleId?: string;
  otp?: string | null;
  otpExpires?: Date | null;
  otpAttempts: number;
  lastOtpSentAt?: Date | null;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  username: { type: String },
  googleId: String,
   otp: { type: String, default: null },           // 👈 allow null
  otpExpires: { type: Date, default: null },      // 👈 allow null
  otpAttempts: { type: Number, default: 0 },
  lastOtpSentAt: { type: Date, default: null },
});

const User = mongoose.model<UserDocument>("User", UserSchema);
export default User;