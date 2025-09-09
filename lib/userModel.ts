import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  dob?: string;
  email: string;
  password: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

// Prevent recompiling model in dev hot reload
const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
