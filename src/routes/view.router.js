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
    return res.redirect('/')
  }
  res.render('signup')
})

router.get('/profile', (req,res)=>{
  if(!req.session.user){
    return res.redirect('/')
  }
  res.render('profile', {user: req.session.user})
})

router.get("/realtimeproducts", (req, res) => {
  res.render("realtimeproducts");
});

router.get("/chat", (req, res) => {
  res.render("chat");
});

export default router;
