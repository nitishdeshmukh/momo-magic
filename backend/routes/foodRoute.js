import express from "express";
import { listFood, addFood, removeFood } from "../controllers/foodController.js";
import authMiddleware from "../middleware/auth.js";
import { isAdminOrDeveloper } from "../middleware/role.js";

const foodRouter = express.Router();

// No multer, no file upload. Pure JSON bodies.
foodRouter.get("/list", listFood);
foodRouter.post("/add", authMiddleware, isAdminOrDeveloper, addFood);
foodRouter.post("/remove", authMiddleware, isAdminOrDeveloper, removeFood);

export default foodRouter;
