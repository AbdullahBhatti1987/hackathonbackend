import sendResponse from "../helpers/sendResponse.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/User.model.js";

export async function authorizationUser(req, res, next) {
  try {
    const bearerToken = req?.headers?.authorization;
    const token = bearerToken?.split(" ")[1];
    console.log("token=>", token);
    if (!token) return sendResponse(res, 403, null, true, "Token not provided");
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);   
    if (decoded) {
      const user = await User.findById(decoded._id).lean();    
      if (!user) {
        return sendResponse(res, 403, null, true, "User not found");
      }
      
      console.log("decoded:", decoded)

      req.user = decoded;
      next();
    } else {
      sendResponse(res, 500, null, true, "Decoded not available");
    }
  } catch (error) {
    sendResponse(res, 500, null, true, "Somthing went wrong");
  }
}

export async function authorizationStudent(req, res, next) {
  try {
    const bearerToken = req?.headers?.authorization;
    const token = bearerToken?.split(" ")[1];
    console.log("token=>", token);
    if (!token) return sendResponse(res, 403, null, true, "Token not provided");
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);   
    if (decoded) {
      const user = await User.findById(decoded._id);    
      if (!user) {
        return sendResponse(res, 403, null, true, "Student not found");
      }
      if(user.role == 'student') {
        req.student = decoded;
        next();
      } else {
        sendResponse(res, 401, null, true, "Unauthorized User");  
      }
    } else {
      sendResponse(res, 400, null, true, "Decoded not available");
    }
  } catch (error) {
    sendResponse(res, 500, null, true, error.message);
  }
}

export async function authorizationTrainer(req, res, next) {
  try {
    const bearerToken = req?.headers?.authorization;
    const token = bearerToken?.split(" ")[1];
    console.log("token=>", token);
    if (!token) return sendResponse(res, 403, null, true, "Token not provided");
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);   
    if (decoded) {
      const user = await User.findById(decoded._id);    
      if (!user) {
        return sendResponse(res, 403, null, true, "Trainer not found");
      }
      if(user.role == 'trainer') {
        req.trainer = decoded;
        next();
      } else {
        sendResponse(res, 401, null, true, "Unauthorized User");  
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
      const user = await User.findById(decoded._id);    
      if (!user) {
        return sendResponse(res, 403, null, true, "User not found");
      }
      if(user.role == 'admin') {
        req.admin = decoded;
        next();
      } else {
        sendResponse(res, 401, null, true, "Unauthorized User");  
      }
    } else {
      sendResponse(res, 400, null, true, "Decoded not available");
    }
  } catch (error) {
    sendResponse(res, 500, null, true, error.message);
  }
}


