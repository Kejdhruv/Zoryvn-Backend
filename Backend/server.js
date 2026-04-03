import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import Authentication from "./Routes/User/Auth.js"



const app = express();
const PORT = 8990;

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use("/", Authentication);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 

