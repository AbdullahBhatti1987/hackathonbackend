import mongoose from "mongoose";

const seekerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      unique: false, // Change it later to true
      validate: {
        validator: function (v) {
          return /^03[0-9]{9}$/.test(v); // Validates phone numbers starting with '03' and having 11 digits
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    cnic: {
      type: String,
      unique: false, // Change it later to true
      validate: {
        validator: function (v) {
          return /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CNIC!`,
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Seeker = mongoose.model("Seeker", seekerSchema);

export default Seeker;
