require("dotenv").config();
require("./mqtt");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.use("/api/water", require("./routes/waterRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
