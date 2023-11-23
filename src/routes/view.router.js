import { Router } from "express";
import { __dirname } from "../utils.js";
import ProductManager from "../dao/managerDB/productManagerMongo.js";
const pmanager = new ProductManager();

const router = Router();

router.get("/", async (req, res) => {
  const listadeproductos = await pmanager.getProducts();
  console.log(listadeproductos);
  res.render("home", { listadeproductos, user: req.session.user } );
});

router.get('/login', (req,res)=>{
  if(req.session.user){
    return res.redirect('/profile')
  }
  res.render('login')
})

router.get('/signup', (req,res)=>{
  if(req.session.user){
    return res.redirect('/login')
  }
  res.render('signup')
})

router.get("/profile", (req, res) => {
  if (!req.session.passport) {
    return res.redirect("/login");
  }
  const { first_name, email } = req.user;
  console.log(first_name, email);
  res.render("profile", { user: { first_name, email } });
});

router.get("/restaurar", (req, res) => {
  res.render("restaurar");
});

router.get("/error", (req, res) => {
  res.render("error");
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realtimeproducts");
});

router.get("/chat", (req, res) => {
  res.render("chat");
});

export default router;
