import express from "express";
import sendResponse from "../helpers/sendResponse.js";
import "dotenv/config";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { authorizationAdmin, authorizationUser } from "../middlewares/authorization.js";
import { upload, uploadToCloudinary } from "../imageuploader/imageuploader.js";

const router = express.Router();

// =======================New User Only====================================

const UserValidationSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  fatherName: Joi.string().trim().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .optional(),
  mobile: Joi.string()
    .pattern(/^03[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must start with '03' and contain 11 digits.",
    }),
  cnic: Joi.string()
    .pattern(/^[0-9]{13}$/)
    .optional()
    .messages({
      "string.pattern.base": "CNIC must be a 13-digit number format 00000-0000000-0.",
    }),
  dob: Joi.date().iso().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  role: Joi.string().valid("admin", "user").required(),
  address: Joi.string().trim().required(),
  city: Joi.string().required(),
  password: Joi.string().optional().min(8).messages({
    "string.min": "Password must be at least 8 characters long.",
  }),
  imageUrl: Joi.string().optional(),
});

router.post("/user-signup", async (req, res) => {
  console.log("Request Body:", req.body); 

  const { fullName, fatherName, password, email, mobile, cnic, dob, gender, address, city, role } = req.body;

  const { error } = UserValidationSchema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, null, true, error.details[0].message);
  }

  try {
    let existingUser = await User.findOne({
      $or: [{ email }, { mobile }, { cnic }],
    });
    if (existingUser) {
      return sendResponse(res, 400, null, true, "User already exists with this email, mobile number, or CNIC.");
    }

    let imageUrl;
    if (req.file) {
      try {
        if (req.file.size > 1 * 1024 * 1024) {
          return sendResponse(res, 400, null, true, "File size exceeds the limit of 1MB.");
        }

        const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedFormats.includes(req.file.mimetype)) {
          return sendResponse(res, 400, null, true, "Only .jpeg, .jpg, and .png formats are allowed.");
        }

        const uploadResult = await uploadToCloudinary(req.file);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return sendResponse(res, 500, null, true, "Error uploading image");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      fullName,
      fatherName,
      password: hashedPassword,
      email,
      mobile,
      cnic,
      dob,
      gender,
      address,
      city,
      role,
      imageUrl,
    });

    const savedUser = await newUser.save();

    return sendResponse(res, 201, savedUser, false, `User ${fullName} added successfully`);
  } catch (error) {
    console.error("Error saving user:", error.message);
    return sendResponse(res, 500, null, true, "Error saving user");
  }
});

// =========================Login=============================

const userLoginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(8).required(),
});

router.post("/user-login", async (req, res) => {
  console.log("Request Body:", req.body);
  try {
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    const user = await User.findOne({ email: value.email }).lean();
    console.log("Current user=>", user);

    if (!user) return sendResponse(res, 403, null, true, "User is not registered with this email.");

    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) return sendResponse(res, 403, null, true, "Invalid Credentials");

    let token = jwt.sign(user, process.env.AUTH_SECRET);

    console.log("token=> ", token);
    sendResponse(res, 200, { user, token }, false, "User login Successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get all users
router.get("/all-users", async (req, res) => {
  const { email, cnic } = req.query;
  const query = {};
  if (email) query.email = email;
  if (cnic) query.cnic = cnic;

  try {
    const users = await User.find(query);
    sendResponse(res, 200, users, false, "Users fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get single user route
router.get("/single-user", async (req, res) => {
  try {
    const { cnic } = req.query;

    if (!cnic) {
      return sendResponse(res, 400, null, true, "Correct CNIC required");
    }

    const user = await User.findOne({ cnic: cnic });

    if (!user) return sendResponse(res, 404, null, true, "User not found");

    sendResponse(res, 200, user, false, "User fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete single user route
router.delete("/:id",authorizationAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return sendResponse(res, 404, null, true, "User not found");

    await User.findByIdAndDelete(id);

    sendResponse(res, 200, user, false, "User deleted successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update user route
router.put("/:id",authorizationAdmin, async (req, res) => {
  try {
    const body = req.body;

    const id = req.params.id;
    if (!id) return sendResponse(res, 400, null, true, "User ID is required");

    const user = await User.findByIdAndUpdate({ _id: id }, body, { new: true }).exec();

    sendResponse(res, 200, user, false, "User updated successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Forgot password route (#Not applicable for now!)
router.post("/:id/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_RESET_PASSWORD_SECRET, {
      expiresIn: "1h",
    });

    user.resetPasswordToken = resetToken;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Click on this link to reset your password: ${resetUrl}`;

    try {
      await sendEmail(email, "Password Reset", message);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      await user.save();
      console.error(error);
      res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
