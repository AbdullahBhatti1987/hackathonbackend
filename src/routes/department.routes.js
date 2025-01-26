import express from "express";
import Joi from "joi";
import Department from "../models/Department.model.js";
import sendResponse from "../helpers/sendResponse.js";

const router = express.Router();

// Validation schema for Department
const departmentValidationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  city: Joi.string().required(),
  branch: Joi.string().required(),
  contact: Joi.string()
    .trim()
    .min(11)
    .regex(/^\d{11}$/)
    .required(),
  email: Joi.string().trim().email().required(),
  createdBy: Joi.string().optional(),
  updates: Joi.array()
    .items(
      Joi.object({
        updatedAt: Joi.date().iso().required(),
        updatedBy: Joi.string().optional(),
      })
    )
    .optional(),
});

// Get all departments
router.get("/all-departments", async (req, res) => {
  try {
    const departments = await Department.find().populate("city branch");
    sendResponse(res, 200, departments, false, "Departments fetched successfully");
  } catch (error) {
    console.error("Error fetching departments:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get a single department by ID
router.get("/single-department/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate("city branch");

    if (!department) {
      return sendResponse(res, 404, null, true, "Department not found");
    }
    sendResponse(res, 200, department, false, "Department fetched successfully");
  } catch (error) {
    console.error("Error fetching department:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Add a new department
router.post("/add-department", async (req, res) => {
  try {
    const { error } = departmentValidationSchema.validate(req.body);
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }
    const departmentData = new Department(req.body);
    await departmentData.save();

    sendResponse(res, 201, departmentData, false, "Department added successfully");
  } catch (error) {
    console.error("Error adding department:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update an existing department
router.put("/update-department/:id", async (req, res) => {
  try {
    const { updatedBy, ...updatedDepartmentDetails } = req.body;

    if (!updatedDepartmentDetails.city || !updatedDepartmentDetails.branch) {
      return sendResponse(res, 400, null, true, "City and Branch are required");
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: updatedDepartmentDetails },
      { new: true }
    );

    if (!department) {
      return sendResponse(res, 404, null, true, "Department not found");
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { $push: { updates: { updatedAt: new Date(), updatedBy } } },
      { new: true }
    );

    sendResponse(res, 200, updatedDepartment, false, "Department updated successfully");
  } catch (error) {
    console.error("Error updating department:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete a department
router.delete("/delete-department/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return sendResponse(res, 404, null, true, "Department not found");
    }

    sendResponse(res, 200, department, false, "Department deleted successfully");
  } catch (error) {
    console.error("Error deleting department:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get department count
router.get("/department-count", async (req, res) => {
  try {
    const departmentCount = await Department.countDocuments();
    sendResponse(res, 200, { departmentCount }, false, "Department count fetched successfully");
  } catch (error) {
    console.error("Error fetching department count:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
