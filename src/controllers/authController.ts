import { Request, Response, NextFunction  } from "express";
import User, { UserDocument } from "../models/userModel";
import { sendOtpEmail } from "../utils/mailer";
import jwt, { JwtPayload } from "jsonwebtoken";



export const sendEmailOtp = async (req: Request<{}, {}, { email: string, name :string }>, res: Response, next: NextFunction) : Promise<any> =>  {
  const { email, name } = req.body;
  if (!email) 
     res.status(400).json({ message: "Email required" });

  let user: UserDocument | null = await User.findOne({ email }) || null
  const now = new Date();

  if (!user) {
    user = await User.create({ email, name });
  } else if (user.lastOtpSentAt && now.getTime() - user.lastOtpSentAt.getTime() < 60000) {
     return res.status(429).json({ message: "Wait before resending OTP" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await sendOtpEmail(email, otp);

  user.otp = otp;
  user.otpExpires = new Date(now.getTime() + 5 * 60000);
  user.lastOtpSentAt = now;
  user.otpAttempts = 0;
  await user.save();

  return res.json({ message: "OTP sent to email" });
};

export const verifyEmailOtp = async (req: Request, res: Response, next: NextFunction): Promise<any>  =>  {
  const { email, otp } = req.body;
  const user: UserDocument | null = await User.findOne({ email }) || null

  if (
    !user ||
    !user.otp ||
    !user.otpExpires ||
    user.otpExpires < new Date() ||
    user.otp !== otp
  ) {
    user?.otpAttempts && user.otpAttempts < 5 && (user.otpAttempts += 1, await user.save());
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  user.otp = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  await user.save();

 return  res.json({ token });
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const token = jwt.sign({ id: (req.user as any)._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
};

interface AuthRequestBody {
  token: string;
}

interface DecodedToken extends JwtPayload {
  id: string;
}

export const verifyToken = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: "Token is required" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    const user: UserDocument| null = await User.findById(decoded.id)
    // .select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};
