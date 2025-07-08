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
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser); // Login
        }

        // Register new user
        const user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          username: profile.emails?.[0]?.value.split("@")[0] + "_" + Date.now(), // random username
        });

        return done(null, user);
      } catch (error) {
        return done(error as any, false); // Handle DB or other errors
      }
    }
  )
);
