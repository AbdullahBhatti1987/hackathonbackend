import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City', 
      required: true
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
    timestamps: true,
  }
);

const Campus = mongoose.model("Campus", campusSchema);

export default Campus;
