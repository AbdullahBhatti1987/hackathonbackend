import express from "express";
import sendResponse from "../helpers/sendResponse.js";
import "dotenv/config";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.model.js";
import { authorizationAdmin, authorizationReceptionist, authorizationStaff } from "../middlewares/authorization.js";
import { upload, uploadToCloudinary } from "../components/imageuploader.js";

const router = express.Router();

// =======================New Employee Only====================================

const EmployeeValidationSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  fatherName: Joi.string().trim().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .optional(),
  mobileNo: Joi.string()
    .pattern(/^03[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must start with '03' and contain exactly 11 digits.",
      "any.required": "Mobile number is required.",
    }),

  cnic: Joi.string()
    .pattern(/^[0-9]{13}$/)
    .optional()
    .messages({
      "string.pattern.base": "CNIC must be a 13-digit number format 00000-0000000-0.",
    }),
  dob: Joi.date().iso().required(),
  gender: Joi.string().valid("Male", "Female").required(),
  branch: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  department: Joi.string().required(),
  empNo: Joi.string().optional(),
  city: Joi.string().required(),
  role: Joi.string().valid("admin", "receptionist", "staff").default("staff"),
  password: Joi.string().min(8).optional().messages({
    "string.min": "Password must be at least 8 characters long.",
    "any.required": "Password is required for employee roles.",
  }),
  imageUrl: Joi.string().optional(),
});

router.post("/emp-registration", authorizationAdmin,  upload.single("imageUrl"), async (req, res) => {
  let { fullName, fatherName, password, department, email, mobileNo, cnic, dob, gender, address, branch, city, role } =
    req.body;

  console.log("Request Body:", req.body);

  const { error } = EmployeeValidationSchema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, null, true, error.details[0].message);
  }

  try {
    let existingEmployee = await Employee.findOne({
      $or: [{ cnic }],
    });

    if (!mobileNo) {
      return sendResponse(res, 400, null, true, "Mobile number is required.");
    }

    if (existingEmployee) {
      return sendResponse(res, 400, null, true, "Employee already exists with this CNIC.");
    }

    if (req.file) {
      console.log("File uploaded:", req.file);
    } else {
      console.log("No file received");
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
    let empNo;
    try {
      const lastEmp = await Employee.find().sort({ empNo: -1 }).limit(1).lean();

      const lastEmpNumber = lastEmp.length > 0 && lastEmp[0].empNo ? parseInt(lastEmp[0].empNo.split("-")[1], 10) : 0;
      const nextEmpNumber = lastEmpNumber + 1;
      empNo = `EMP-${nextEmpNumber.toString().padStart(6, "0")}`;
    } catch (error) {
      return sendResponse(res, 500, null, true, "Error generating employee number");
    }

    console.log("Image uploaded to Cloudinary:", imageUrl);
    console.log("Generated employee number:", empNo);

    // Create new employee
    const newEmployee = new Employee({
      fullName,
      fatherName,
      password,
      email,
      mobileNo,
      cnic,
      dob,
      gender,
      address,
      department,
      branch,
      city,
      empNo,
      role,
      imageUrl,
    });

    const savedEmployee = await newEmployee.save();
    return sendResponse(res, 201, savedEmployee, false, `Employee ${fullName} added successfully`);
  } catch (error) {
    console.error("Error saving employee:", error.message);
    return sendResponse(res, 500, null, true, "Error saving employee");
  }
});

// =========================Login=============================

const employeeLoginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(6).required(),
});

router.post("/emp-login", async (req, res) => {
  try {
    const { error, value } = employeeLoginSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    const employee = await Employee.findOne({ email: value.email }).lean();
    console.log("Current employee=>", employee);

    if (!employee) return sendResponse(res, 403, null, true, "Employee is not registered with this email.");

    const isPasswordValid = await bcrypt.compare(value.password, employee.password);
    if (!isPasswordValid) return sendResponse(res, 403, null, true, "Invalid Credentials");
    let loginTime = Date.now();

    let token = jwt.sign(employee, process.env.AUTH_SECRET);

    console.log("token=> ", token);
    sendResponse(res, 200, { employee, token }, false, "Employee login Successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// ================================================================================

router.get("/all-employees", async (req, res) => {
  const { skip, page, limit, cnic, empNo, email, mobileNo } = req.query;
  const pageNum = page ? parseInt(page) : 1;
  const limitNum = limit ? parseInt(limit) : 10;
  const skipNum = skip ? parseInt(skip) : (pageNum - 1) * limitNum;
  const query = {};

  if (cnic) query.cnic = { $eq: cnic };
  if (empNo) query.cnic = { $eq: empNo };
  const employees = await Employee.aggregate([{ $match: query }]);

  try {
    sendResponse(res, 200, { employees, totalEmployees: employees.length }, false, "Employees fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update employee route (specific to CNIC)
router.put("/single-emp", async (req, res) => {
  try {
    const { cnic } = req.body;  // Access CNIC from the request body
    if (!cnic) {
      return sendResponse(res, 400, null, true, "Correct CNIC number required");
    }

    console.log("Received CNIC: ", cnic);  // Log the received CNIC

    // Find employee by CNIC
    const findEmployee = await Employee.findOne({ cnic: cnic }); 

    if (!findEmployee) {
      return sendResponse(res, 404, null, true, "Employee not found");
    }

    // Hash the password if provided
    const { password } = req.body;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update only the password field in the employee record
      const updatedEmployee = await Employee.findOneAndUpdate(
        { cnic: cnic },  // Match by CNIC
        { password: hashedPassword },  // Update only the password
        { new: true }  // Return the updated document
      );

      sendResponse(res, 200, updatedEmployee, false, "Employee password updated successfully");
    } else {
      sendResponse(res, 400, null, true, "Password is required to update");
    }
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});




// Update employee route (specific to CNIC)
router.put("/single-emp", authorizationAdmin, async (req, res) => {
  try {
    const { cnic, password } = req.body;  // Access CNIC and password from the request body
    if (!cnic) {
      return sendResponse(res, 400, null, true, "Correct CNIC number required");
    }

    if (!password) {
      return sendResponse(res, 400, null, true, "Password is required");
    }

    console.log("Received CNIC: ", cnic);  // Log the received CNIC

    const findEmployee = await Employee.findOne({ cnic: cnic }); // Find employee by CNIC

    if (!findEmployee) {
      return sendResponse(res, 404, null, true, "Employee not found");
    }

    // If the password is provided, hash it before updating
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the employee with the hashed password
    const updatedEmployee = await Employee.findOneAndUpdate(
      { cnic: cnic }, // Match by CNIC
      { password: hashedPassword },  // Update only the password
      { new: true }
    );

    sendResponse(res, 200, updatedEmployee, false, "Employee updated successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});


// Delete single employee route
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await Employee.findById(id);

    if (!employee) return sendResponse(res, 404, null, true, "Employee not found");

    await Employee.findByIdAndDelete(id);

    sendResponse(res, 200, employee, false, "Employee deleted successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
