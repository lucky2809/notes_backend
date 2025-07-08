import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db';
// import connectDB from './config/db';
// import userRoutes from './routes/userRoutes';
import notesRoutes from './routes/notesRoute'
import cors from 'cors'
import cookieParser from "cookie-parser";
import session from "express-session";
import authRoutes from "./routes/authRoute";
import passport from 'passport';
import { Request, Response } from "express"

import "./config/passport"; // important line 

dotenv.config();
connectDB();
const app = express();

app.use(cors())
app.use(express.json());

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);

app.use('/api', notesRoutes);

app.get("/check-health", async (req: Request, res: Response): Promise<any> => {
  return res.status(200).json({ message: "app is running" })
})

const PORT: any = process.env.PORT || 3000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => console.log(`Server running on port ${PORT}`));
