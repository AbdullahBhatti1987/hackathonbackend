import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    mobile: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return /^03[0-9]{9}$/.test(v); // Validates phone numbers starting with '03' and having 11 digits
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    cnic: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{13}$/.test(v); // Validates CNIC (13 digits)
        },
        message: (props) => `${props.value} is not a valid CNIC!`,
      },
    },
    dob: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String, // This can be used to store image URL or path
    },
    password: {
  type: String,
  required: true,
  minlength: 8,
  validate: {
    validator: function (v) {
      return v != null && v.length >= 8; // Ensures password is at least 8 characters long
    },
    message: (props) => "Password is required and must be at least 8 characters long!",
  },
},
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);

export default User;

