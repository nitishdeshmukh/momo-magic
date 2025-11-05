import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    phoneNumber: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ["admin", "developer"] },
  },
  { minimize: false, timestamps: true }
);

// Ensure id has a unique index
adminSchema.index({ id: 1 }, { unique: true });

const adminModel =
  mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
