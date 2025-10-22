import mongoose from "mongoose";
import { Schema } from "mongoose";

const employeeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  employeeId: { type: String, required: true, unique: true },
  dob: { type: Date },
  gender: { type: String },
  maritalStatus: { type: String },
  designation: { type: String },
  department: { type: Schema.Types.ObjectId, ref:"Department", required: true },
  salary: { type: Number, required: true },
  expedienteFile: { type: String },
  expedienteOriginalName: { type: String },
  expedientePublicId: { type: String },
  expedienteUploadedAt: { type: Date },
  documents: [
    {
      label: { type: String, required: true },
      category: { type: String, default: "general" },
      fileUrl: { type: String, required: true },
      originalName: { type: String },
      publicId: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;

