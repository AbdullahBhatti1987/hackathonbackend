import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
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
    password: {
      type: String,
      minlength: 8,
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
      unique: false,
      validate: {
        validator: function (v) {
          return /^[0-9]{13}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CNIC!`,
      },
    },
    dob: {
      type: Date,
      required: true,
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    empNo: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "receptionist", "staff"],
      default: "staff",
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("User", employeeSchema);

export default Employee;
