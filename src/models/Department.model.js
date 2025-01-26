import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,  
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',  
      required: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',  
      required: true,
    },
    contact: {
      type: String,
    },
    email: {
      type: String,
    },
    createdBy: {
      type: String,
      default: null,  
    },
    updates: [
      {
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: String, default: null },
       
      },
    ],
  },
  {
    timestamps: true,  // This adds createdAt and updatedAt fields
  }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
