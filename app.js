import express from "express";
import cors from "cors";
import { router } from "./backend/routes/UserRouter.js";
import pdfRouter from "./backend/routes/pdfRouter.js";

const app = express();

// Middleware
app.use(cors());

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running successfully");
});

// API routes
app.use("/api", router);
app.use("/api/pdf", pdfRouter);

// Railway port
const port = process.env.PORT || 3000;

// Start server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on ${port}`);
});

