import express from "express";
import viewRouter from "./routes/view.router.js";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import { __dirname } from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import "./dao/configDB.js";
import cookieParser from "cookie-parser";
import cookieRouter from "./routes/cookie.router.js";
import session from "express-session";
import sessionsRouter from "./routes/sessions.router.js";
import fileStore from "session-file-store";
import MongoStore from "connect-mongo";

const FileStore = fileStore(session);
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser("CoderS3cR3tC0D3"));

// session
// app.use(
//   session({
//     store: new FileStore({
//       path: __dirname + "/sessions",
//     }),
//     secret: "secretSession",
//     cookie: { maxAge: 60000 },
//   })
// );

const URI =
  "mongodb+srv://sebasmalisani:ga0QEDK1El6F1Fta@cluster0.mou6n85.mongodb.net/db47315?retryWrites=true&w=majority";

app.use(
  session({
    store: new MongoStore({
      mongoUrl: URI,
    }),
    secret: "secretSession",
    cookie: { maxAge: 60000 },
  })
);

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/", viewRouter);
app.use("/api/cookie", cookieRouter);
app.use("/api/sessions", sessionsRouter);

// app.get("/crear", (req, res) => {
//   res
//     .cookie("cookie1", "primeraCookie", { maxAge: 60000 })
//     .send("Probando Cookies")

// });

// app.get("/crear-firmada", (req, res) => {
//   res.cookie("cookie2", "cookieFirmada", { maxAge: 60000, signed: true }).send("creando firmada");
// });

// app.get("/leer", (req, res) => {
//   const { cookie1 } = req.cookies;
//   const { cookie2 } = req.signedCookies;
//   res.json({cookies:cookie1, signedCookies: cookie2})
// });

// app.get('/eliminar', (req,res )=>{
//   res.clearCookie("cookie1").send("eliminando cookie")
// })

const httpServer = app.listen(PORT, () => {
  console.log("server is working");
});

const socketServer = new Server(httpServer);

import ProductManager from "./dao/managerDB/productManagerMongo.js";
const pmanagersocket = new ProductManager();

import MessagesManager from "./dao/managerDB/messageManagerMongo.js";
const messagesManager = new MessagesManager();

socketServer.on("connection", async (socket) => {
  console.log("client connected con ID:", socket.id);
  const listadeproductos = await pmanagersocket.getProducts();
  socketServer.emit("enviodeproducts", listadeproductos);

  socket.on("addProduct", async (obj) => {
    await pmanagersocket.addProduct(obj);
    const listadeproductos = await pmanagersocket.getProducts();
    socketServer.emit("enviodeproducts", listadeproductos);
  });

  socket.on("deleteProduct", async (id) => {
    console.log(id);
    await pmanagersocket.deleteProduct(id);
    const listadeproductos = await pmanagersocket.getProducts({});
    socketServer.emit("enviodeproducts", listadeproductos);
  });

  socket.on("nuevousuario", (usuario) => {
    console.log("usuario", usuario);
    socket.broadcast.emit("broadcast", usuario);
  });
  socket.on("disconnect", () => {
    console.log(`Usuario con ID : ${socket.id} esta desconectado `);
  });

  socket.on("mensaje", async (info) => {
    console.log(info);
    await messagesManager.createMessage(info);

    socketServer.emit("chat", await messagesManager.getMessages());
  });
});
