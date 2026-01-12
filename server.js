import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import pasteRoutes from "./routes/pastes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/pastes", pasteRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API live on port ${PORT}`));