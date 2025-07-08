import { Router } from "express";
import passport from "passport";
import {
  sendEmailOtp,
  verifyEmailOtp,
  handleGoogleCallback,
  verifyToken,
} from "../controllers/authController";

const router = Router();

router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/verify-token", verifyToken)

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  handleGoogleCallback
);

export default router;