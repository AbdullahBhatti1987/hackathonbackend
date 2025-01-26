import express from "express";
import Joi from "joi";
import Branch from "../models/Branch.model.js";
import sendResponse from "../helpers/sendResponse.js";
import City from "../models/City.model.js";

const router = express.Router();

const branchSchema = Joi.object({
  title: Joi.string().trim().min(5).max(50).required(),
  address: Joi.string().trim().min(10).max(200).required(),
  city: Joi.string().trim().required(),
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

router.get("/all-branches", async (req, res) => {
  try {
    const branches = await Branch.find().populate("city"); // Populating the city reference
    sendResponse(res, 200, branches, false, "Branches fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.get("/single-branch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);
    if (!branch) return sendResponse(res, 404, null, true, "Branch not found");
    sendResponse(res, 200, branch, false, "Branch fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.post("/add-branch", async (req, res) => {
  try {
    const { error } = branchSchema.validate(req.body);
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }

    const branch = new Branch(req.body);
    await branch.save();

    sendResponse(res, 201, branch, false, "Branch added successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.put("/update-branch/:id", async (req, res) => {
  try {
    const { updatedBy, ...updatedBranchDetails } = req.body;

    const branch = await Branch.findByIdAndUpdate(req.params.id, { $set: updatedBranchDetails }, { new: true });
    if (!branch) {
      return sendResponse(res, 404, null, true, "Branch not found");
    }

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      { $push: { updates: { updatedAt: new Date(), updatedBy } } },
      { new: true }
    );
    sendResponse(res, 200, updatedBranch, false, "Branch updated successfully");
  } catch (error) {
    console.error("Error updating branch:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.delete("/delete-branch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndDelete(id);

    if (!branch) {
      return sendResponse(res, 404, null, true, "Branch not found");
    }

    sendResponse(res, 200, branch, false, "Branch deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.get("/branch-count", async (req, res) => {
  try {
    const branchCount = await Branch.countDocuments(); // Get the total number of branches
    sendResponse(res, 200, { branchCount }, false, "Branch count fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
