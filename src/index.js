const express = require("express");
const multer = require("multer");

const route = require("./routes/route.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// didnt write the line 12
app.use(multer().any());

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://user-open-to-all-trainees:AutogenerateSecurePassword@training-cluster.xohin.mongodb.net/mukulJayMayankDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useFindAndModify: false }
  )
  .then(() => console.log("mongodb running on 27017"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
