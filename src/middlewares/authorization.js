import sendResponse from "../helpers/sendResponse.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Employee from "../models/Employee.model.js";

export async function authorizationReceptionist(req, res, next) {
  try {
    const bearerToken = req?.headers?.authorization;
    const token = bearerToken?.split(" ")[1];
    console.log("token=>", token);
    if (!token) return sendResponse(res, 403, null, true, "Token not provided");
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);   
    if (decoded) {
      const employee = await Employee.findById(decoded._id);    
      if (!employee) {
        return sendResponse(res, 403, null, true, "Student not found");
      }
      if(employee.role == 'student') {
        req.student = decoded;
        next();
      } else {
        sendResponse(res, 401, null, true, "Unauthorized employee");  
      }
    } else {
      sendResponse(res, 400, null, true, "Decoded not available");
    }
  } catch (error) {
    sendResponse(res, 500, null, true, error.message);
  }
}

export async function authorizationStaff(req, res, next) {
  try {
    const bearerToken = req?.headers?.authorization;
    const token = bearerToken?.split(" ")[1];
    console.log("token=>", token);
    if (!token) return sendResponse(res, 403, null, true, "Token not provided");
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);   
    if (decoded) {
      const employee = await Employee.findById(decoded._id);    
      if (!employee) {
        return sendResponse(res, 403, null, true, "Trainer not found");
      }
      if(employee.role == 'staff') {
        req.trainer = decoded;
        next();
      } else {
        sendResponse(res, 401, null, true, "Unauthorized employee");  
      }
    } else {
      sendResponse(res, 400, null, true, "Decoded not available");
    }
  } catch (error) {
    sendResponse(res, 500, null, true, error.message);
  }
}

export async function authorizationAdmin(req, res, next) {
  try {
    const bearerToken = req?.headers?.authorization;
    const token = bearerToken?.split(" ")[1];
    console.log("token=>", token);
    if (!token) return sendResponse(res, 403, null, true, "Token not provided");
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);   
    if (decoded) {
      const employee = await Employee.findById(decoded._id);    
      if (!employee) {
        return sendResponse(res, 403, null, true, "employee not found");
      }
      if(employee.role == 'admin') {
        req.admin = decoded;
        next();
      } else {
        sendResponse(res, 401, null, true, "Unauthorized employee");  
      }
    } else {
      sendResponse(res, 400, null, true, "Decoded not available");
    }
  } catch (error) {
    sendResponse(res, 500, null, true, error.message);
  }
}


