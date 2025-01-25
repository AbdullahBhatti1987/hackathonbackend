import express from "express";
import Student from "../models/Student.js";
import sendResponse from "../helpers/sendResponse.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const router = express.Router();

// const registerSchema = Joi.object({
//   roll_number: Joi.string().required(),
//   full_name: Joi.string().min(3).max(30).required(),
//   email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
//   password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
//   course: Joi.string().required(),
//   country: Joi.string().valid("Pakistan", "Turkey").required(),
//   city: Joi.string().valid("Karachi", "Islamabad", "Peshawar", "Quetta", "Lahore").required(),
//   computerproficiency: Joi.string().required(),
//   mobile_Number: Joi.string().min(10).max(15).required(),
//   cnic: Joi.string().min(15).max(15).required(),
//   father_cnic: Joi.string().min(0).max(15),
//   gender: Joi.string().valid("male", "female").required(),
//   date_of_birth: Joi.string()
//     .pattern(/^(0[1-9]|[12][0-9]|3[01])([0][1-9]|1[0-2])\d{4}$/)
//     .required()
//     .messages({
//       'string.pattern.base': 'Date of birth must be in ddmmyyyy format (e.g., 16011987)'
//     }),
//   address: Joi.string().required(),
//   last_qualification: Joi.string().required(),
//   have_laptop: Joi.string().valid("yes", "no").required(),
//   batchNo: Joi.string().required(),

// });

const loginSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 1, tlds: { allow: ["com"] }, }).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});


// =====================REGISTER=======================================




// =====================LOGIN=======================================

router.post("/login", async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return sendResponse(res, 400, null, true, error.message);
  const student = await Student.findOne({ email: value.email }).lean();
  if (!student) return sendResponse(res, 403, null, true, "Student is not registered.");
  const isPasswordValid = bcrypt.compare(value.password, student.password);
  if (!isPasswordValid) return sendResponse(res, 403, null, true, "Invalid Credentials");
  let token = jwt.sign(student, process.env.AUTH_SECRET)
  console.log("token=> ", token)
  sendResponse(res, 201, { student, token }, false, "Student login Successfully")
});




const newLoginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(8).required(),
});


// User login route
router.post("/new-login", async (req, res) => {
  try {

    const { error, value } = newLoginSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    const user = await User.findOne({ email: value.email }).lean();
    console.log("Currnet user=>", user)

    if (!user) return sendResponse(res, 403, null, true, "User is not registered with this email.");

    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) return sendResponse(res, 403, null, true, "Invalid Credentials");
    let token = jwt.sign(user, process.env.AUTH_SECRET)

    console.log("token=> ", token)
    sendResponse(res, 200, { user, token }, false, "User login Successfully")

  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }

});

// User register route
router.post("/new-register", async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);    

    if (error) return sendResponse(res, 400, null, true, error.message);

    const user = await User.findOne({ email: value.email });
    if (user) return sendResponse(res, 403, null, true, "User already registered with this email");

    const hashedPassword = await bcrypt.hash(value.password, 12);
    value.password = hashedPassword;

    let newUser = new User({ ...value });
    newUser = await newUser.save();
    sendResponse(res, 201, newUser, false, "User Register Successfully")

  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, error.message);
  }

});

// Get all users route
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find();
    sendResponse(res, 200, users, false, "All users fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get single user route
router.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return sendResponse(res, 404, null, true, "User not found")

    sendResponse(res, 200, user, false, "User fetched successfully");

  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
})

// Update user route
router.put("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let user = await User.findById(id);

    if (!user) return sendResponse(res, 404, null, true, "User not found")

    user = await User.findByIdAndUpdate(id, req.body, { new: true });

    sendResponse(res, 200, user, false, "User updated successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
})

// Forgot password route (#Not applicable for now!)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_RESET_PASSWORD_SECRET, {
      expiresIn: '1h'
    });

    // Save the reset token to the user document (or a separate tokens collection)
    user.resetPasswordToken = resetToken;
    await user.save();

    // Send reset password email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Click on this link to reset your password: ${resetUrl}`;

    try {
      await sendEmail(email, 'Password Reset', message);
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined; // Clear the token if email sending fails
      await user.save();
      console.error(error);
      res.status(500).json({ error: 'Failed to send email' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
