// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import User from "../models/userModel";
// import dotenv from "dotenv";

// dotenv.config();

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL!,
//     },
//     async (_accessToken, _refreshToken, profile, done) => {
//       const existingUser = await User.findOne({ googleId: profile.id });
//       if (existingUser) return done(null, existingUser);

//       const user = await User.create({
//         googleId: profile.id,
//         email: profile.emails?.[0].value,
//         name: profile.displayName,
//       });

//       return done(null, user);
//     }
//   )
// );

import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Email not provided by Google"), false);
        }

        // 1. Try to find user by googleId
        let user = await User.findOne({ googleId: profile.id });

        // 2. If not found, try to find by email
        if (!user) {
          user = await User.findOne({ email });

          // 3. If user with email exists, attach googleId
          if (user) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        // 4. If still no user, create new one
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName,
            username: email.split("@")[0] + "_" + Date.now(),
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, false);
      }
    }
  )
);
