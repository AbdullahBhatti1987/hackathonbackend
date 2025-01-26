import express from "express";
import sendResponse from "../helpers/sendResponse.js";
import "dotenv/config";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Seeker from "../models/Seeker.model.js";
// import { authorizationAdmin, authorizationseeker } from "../middlewares/authorization.js";


const router = express.Router();

// =======================New seeker Only====================================
// ======================= New seeker Only ====================================
const seekerValidationSchema = Joi.object({
fullName: Joi.string().trim().required(),
mobileNo: Joi.string()
  .pattern(/^03[0-9]{9}$/)
  .required()
  .messages({
    "string.pattern.base": "Mobile number must start with '03' and contain 11 digits.",
  }),
cnic: Joi.string()
  .pattern(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
  .optional()
  .messages({
    "string.pattern.base": "CNIC must be a 13-digit number format 00000-0000000-0.",
  }),
gender: Joi.string().valid("Male", "Female").required(),
address: Joi.string().trim().required(),
city: Joi.string().required(),
branch: Joi.string().required(),
department: Joi.string().required(),
});

router.post("/seeker-registration", async (req, res) => {
let {
  fullName,
  mobileNo,
  cnic,
  gender,
  address,
  city,
  branch,
  department
} = req.body;

const { error } = seekerValidationSchema.validate(req.body);
if (error) {
  return sendResponse(res, 400, null, true, error.details[0].message);
}

try {
  let existingSeeker = await Seeker.findOne({
    $or: [{ cnic }] 
  });
  if (existingSeeker) {
    return sendResponse(res, 400, null, true, "Seeker already exists with this CNIC or mobile number.");
  }

  const newSeeker = new Seeker({
    fullName,
    mobileNo,
    cnic,
    gender,
    address,
    city,
    branch,
    department,
  });

  const savedSeeker = await newSeeker.save();

  return sendResponse(res, 201, savedSeeker, false, `Seeker ${fullName} added successfully`);
} catch (error) {
  console.error("Error saving seeker:", error.message);
  return sendResponse(res, 500, null, true, "Error saving seeker");
}
});


// =========================Login=============================

const seekerLoginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(6).required(),
});

router.post("/seeker-login", async (req, res) => {
  try {
    const { error, value } = seekerLoginSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    const seeker = await Seeker.findOne({ email: value.email }).lean();
    console.log("Currnet seeker=>", seeker);

    if (!seeker) return sendResponse(res, 403, null, true, "seeker is not registered with this email.");

    const isPasswordValid = await bcrypt.compare(value.password, seeker.password);
    if (!isPasswordValid) return sendResponse(res, 403, null, true, "Invalid Credentials");
    let loginTime = Date.now();

    let token = jwt.sign(seeker, process.env.AUTH_SECRET);

    console.log("token=> ", token);
    sendResponse(res, 200, { seeker, token }, false, "seeker login Successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// ================================================================================

router.get("/all-seekers", async (req, res) => {
  const { skip, page, limit, cnic, rollNo,email, mobileNo } = req.query;
  const pageNum = page ? parseInt(page) : 1;
  const limitNum = limit ? parseInt(limit) : 10;
  const skipNum = skip ? parseInt(skip) : (pageNum - 1) * limitNum;
  const query = {};

  if (cnic) query.cnic = { $eq: cnic };
  if (rollNo) query.cnic = { $eq: rollNo };
  const seekers = await Seeker.aggregate([{ $match: query }]);

  try {
    sendResponse(res, 200, { seekers, totalseekers: seekers.length }, false, "seekers fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get single seeker route
router.get("/single-seeker", async (req, res) => {
  try {
    const { cnic } = req.query; // Access query parameter 'cnic'

    if (!cnic) {
      return sendResponse(res, 400, null, true, "Correct rollNo required");
    }

    console.log(cnic); // Log the received cnic
    const seeker = await Seeker.findOne({ cnic: cnic }); // Use the cnic query parameter

    console.log("seeker", seeker); // Log the found seeker
    if (!seeker) return sendResponse(res, 404, null, true, "seeker not found");

    sendResponse(res, 200, seeker, false, "seeker fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete single seeker route
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const seeker = await Seeker.findById(id);

    if (!seeker) return sendResponse(res, 404, null, true, "seeker not found");

    await seeker.findByIdAndDelete(id);

    sendResponse(res, 200, seeker, false, "seeker deleted successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update seeker route
router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    console.log("Body=>", body);

    const id = req.params.id;
    if (!id) return sendResponse(res, 400, null, true, "seeker ID is required");

    const seeker = await Seeker.findByIdAndUpdate({ _id: id }, body, { new: true }).exec();
    console.log("seeker=>", seeker);

    sendResponse(res, 200, seeker, false, "seeker updated successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});


export default router;
