import mongoose from "mongoose";

const URI =
  "mongodb+srv://sebasmalisani:ga0QEDK1El6F1Fta@cluster0.mou6n85.mongodb.net/db47315?retryWrites=true&w=majority";

mongoose
  .connect(URI)
  .then(() => console.log("Base de datos conectada"))
  .catch((error) => console.log(error));
