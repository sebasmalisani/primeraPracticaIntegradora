import { Router } from "express";
import { userManager } from "../dao/managerDB/usersManager.js";
import passport from 'passport';


const router = Router();

router.get("/github", passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { });

router.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/github/error' }), async (req, res) => {
    const user = req.user;
    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age
    };
    req.session.admin = true;
    res.redirect('http://localhost:8080');
});

// router.post("/register", passport.authenticate('register', { failureRedirect: '/api/sessions/fail-register' }), async (req, res) => {
//   res.status(201).send({ status: "success", message: "Usuario creado con extito." })
// });

// router.post("/login", passport.authenticate('login', { failureRedirect: '/api/sessions/fail-register' }), async (req, res) => {
//   const user = req.user;
//   if (!user) return res.status(401).send({ status: "error", error: "credenciales incorrectas" });
//   req.session.user = {
//       name: `${user.first_name} ${user.last_name}`,
//       email: user.email,
//       age: user.age
//   }
//   res.send({ status: "success", payload: req.session.user, message: "logueo realizado" });
// });

// router.get("/logout", (req, res) => {
//   req.session.destroy(error => {
//       if (error){
//           res.status(400).json({error: "error logout", mensaje: "Error al cerrar la sesion"});
//       }
//       res.status(200).json({message: "Sesion cerrada correctamente."});
//   });
// });

// router.get("/current", (req, res) => {
//   if (req.session.user) {
//     res.status(200).json({ user: req.session.user });
//   } else {
//     res.status(401).json({ error: 'No hay sesión activa' });
//   }
// });

// router.get("/fail-register", (req, res) => {
//   res.status(401).send({ error: "Failed to process register!" });
// });

// router.get("/fail-login", (req, res) => {
//   res.status(401).send({ error: "Failed to process login!" });
// });

router.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const createdUser = await userManager.createOne(req.body);
    res.status(200).json({ message: "User Created", user: createdUser });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await userManager.findByEmail(email);
    if (!user) {
     return res.redirect("/signup");
    }
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is not valid" });
    }
    req.session.user = { email, first_name: user.first_name };
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/signout', (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/login')
    })
})

export default router;
