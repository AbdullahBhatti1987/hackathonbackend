import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    city: {
      type: String,
    },
    country: {
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

const City = mongoose.model("City", citySchema);

export default City;
