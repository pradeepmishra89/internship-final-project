import express from "express";
import { generatePDF } from "../controller/pdfController.js";

const router = express.Router();

router.post("/generate", generatePDF);

export default router;