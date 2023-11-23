import { Router } from "express";
import { usersManager  } from "../dao/managerDB/usersManager.js";
import passport from 'passport';
import { hashData, compareData } from "../utils.js";


const router = Router();

// router.post("/signup", async (req, res) => {
//   const { first_name, last_name, email, password } = req.body;
//   if (!first_name || !last_name || !email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
//   try {
//     const createdUser = await usersManager .createOne(req.body);
//     res.status(200).json({ message: "User created", user: createdUser });
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// });

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
//   try {
//     const user = await usersManager .findByEmail(email);
//     if (!user) {
//       return res.redirect("/signup");
//     }
//     const isPasswordValid = password === user.password;
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Password is not valid" });
//     }
//     const sessionInfo =
//       email === "adminCoder@coder.com" && password === "adminCod3r123"
//         ? { email, first_name: user.first_name, isAdmin: true }
//         : { email, first_name: user.first_name, isAdmin: false };
//     req.session.user = sessionInfo;
//     res.redirect("/");
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// });

// router.get('/signout', (req,res)=>{
//     req.session.destroy(()=>{
//         res.redirect('/login')
//     })
// })

router.post(
  "/signup",
  passport.authenticate("signup", {
    successRedirect: "/profile",
    failureRedirect: "/error",
  })
);

router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/profile",
    failureRedirect: "/error",
  })
);

// SIGNUP - LOGIN - PASSPORT GITHUB

router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get("/callback", passport.authenticate("github"), (req, res) => {
  res.send("Probando");
});

router.get("/signout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

router.post("/restaurar", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await usersManager.findByEmail(email);
    if (!user) {
      return res.redirect("/");
    }
    const hashedPassword = await hashData(password);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ error });
  }
});


export default router;
