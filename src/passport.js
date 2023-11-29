import passport from "passport";
import { usersManager } from "./dao/managerDB/usersManager.js";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { hashData, compareData } from "./utils.js";
// import { usersModel } from "./dao/models/users.model.js";

// local

passport.use(
  "signup",
  new LocalStrategy(
    { passReqToCallback: true, usernameField: "email" },
    async (req, email, password, done) => {
      const { first_name, last_name } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return done(null, false);
      }
      try {
        const hashedPassword = await hashData(password);
        const createdUser = await usersManager.createOne({
          ...req.body,
          password: hashedPassword,
        });
        done(null, createdUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {  passReqToCallback: true, usernameField: "email" },
    async (req, email, password, done) => {
      if (!email || !password) {
        done(null, false);
      }
      try {
        const user = await usersManager.findByEmail(email);
        if (!user) {
          done(null, false);
        }

        const isPasswordValid = await compareData(password, user.password);
        if (!isPasswordValid) {
          return done(null, false);
        }
        if (email === "adminCoder@coder.com") {
          req.session.user = { email, name: user.name, isAdmin: true };
        } else {
          req.session.user = {
            email: user.email,
            name: user.name,
            isAdmin: false,
          };
        }
        // const sessionInfo =
        //   email === "adminCoder@coder.com"
        //     ? { email, first_name: user.first_name, isAdmin: true }
        //     : { email, first_name: user.first_name, isAdmin: false };
        // req.session.user = sessionInfo;
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// github
passport.use(
  "github",
  new GithubStrategy(
    {
      clientID: "Iv1.d5fc681990c57a06",
      clientSecret: "00ebfa6550ab4ce48b7cf472b5509cc203dcd71a",
      callbackURL: "http://localhost:8080/api/sessions/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userService.getUserbyEmail(profile.emails[0].value);
        // login
        if (!user) {
          const newUser = await userService.addUser({
            firstName: profile.username,
            lastName: profile.username,
            email: profile.emails[0].value,
            password: profile.id,
            isGithub: true,
          });
          return done(null, newUser);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
export default passport;

//   // signup
//   const infoUser = {
//     first_name: profile._json.name.split(" ")[0], // ['farid','sesin']
//     last_name: profile._json.name.split(" ")[1],
//     email: profile._json.email,
//     password: " ",
//     isGithub: true,
//   };
//   const createdUser = await usersManager.createOne(infoUser);
//   done(null, createdUser);
// } catch (error) {
//   done(error);
//       }
//     }
//   )
// );

passport.serializeUser((user, done) => {
  // _id
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersManager.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
