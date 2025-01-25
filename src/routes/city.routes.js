import express from "express";
import Joi from "joi";
import City from "../models/City.model.js"; // Import the City model
import sendResponse from "../helpers/sendResponse.js"; // Assuming sendResponse is a helper to structure the responses

const router = express.Router();

// Define Joi schema for city validation
const citySchema = Joi.object({
  city: Joi.string().trim().min(3).max(50).required(),
  country: Joi.string().trim().min(3).max(50).required(),
  createdBy: Joi.string().trim().optional(),
  updates: Joi.array().items(
    Joi.object({
      updatedAt: Joi.date().iso().required(),
      updatedBy: Joi.string().optional(),
      reason: Joi.string().optional(),
    })
  ).optional(),
});

// Get all cities
router.get("/all-cities", async (req, res) => {
  try {
    const cities = await City.find(); // Fetch all cities
    sendResponse(res, 200, cities, false, "Cities fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get a single city by ID
router.get("/single-city/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id); // Fetch a city by ID
    if (!city) return sendResponse(res, 404, null, true, "City not found");
    sendResponse(res, 200, city, false, "City fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Add a new city
router.post("/add-city", async (req, res) => {
  try {
    const { error } = citySchema.validate(req.body); // Validate input
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }
    const city = new City(req.body); // Create a new city
    console.log("city=>>>>", city)
    await city.save(); // Save the city
    sendResponse(res, 201, city, false, "City added successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update city details
router.put("/update-city/:id", async (req, res) => {
  try {
    const { updatedBy,  ...updatedCityDetails } = req.body; // Extract update details

    // Create update record first
    const updateRecord = { updatedAt: new Date(), updatedBy };
    console.log("updateRecord", updateRecord)
    const city = await City.findByIdAndUpdate(
      req.params.id,
      {
        $set: updatedCityDetails,
        $push: { updates: updateRecord }, // Push to updates array directly
      },
      { new: true }
    );

    if (!city) {
      return sendResponse(res, 404, null, true, "City not found");
    }

    sendResponse(res, 200, city, false, "City updated successfully");
  } catch (error) {
    console.error("Error updating city:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete a city by ID
router.delete("/delete-city/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndDelete(id); // Delete city by ID

    if (!city) {
      return sendResponse(res, 404, null, true, "City not found");
    }

    sendResponse(res, 200, city, false, "City deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get cities and countries
// Assuming you have a City model and API endpoint
router.get("/cities", async (req, res) => {
  try {
    const cities = await City.find();
    res.status(200).json({ data: cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
