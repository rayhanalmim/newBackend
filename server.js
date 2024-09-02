const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.use(cors());

    app.use(bodyParser.json({ limit: "500mb" }));
    app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

    app.use(bodyParser.json({ limit: "500mb" }));
    app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
    //listening contract event
    //listeningEvent()

    app.get("/", (req, res) => {
      res.send("welcome to lottaverse");
    });

    require("./routes/basic.js")(app);

    const PORT = process.env.PORT || 8080;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
      //console.log(server)
    });
  })
  .catch((e) => {
    console.log(e);
    process.exit(0);
  });
