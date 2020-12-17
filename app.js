const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");

// Create Redis Client
let client = redis.createClient();

client.on("connect", function () {
  console.log("Connected to Redis...");
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// methodOverride
app.use(methodOverride("_method"));

// Search Page
app.get("/", function (req, res, next) {
  res.render("searchdonuts");
});

// Search processing
app.post("/donut/search", function (req, res, next) {
  let id = req.body.id;

  client.hgetall(id, function (err, obj) {
    if (!obj) {
      res.render("searchdonuts", {
        error: "Donut does not exist",
      });
    } else {
      obj.id = id;
      res.render("details", {
        donut: obj,
      });
    }
  });
});

// Add Donut Page
app.get("/donut/add", function (req, res, next) {
  res.render("adddonut");
});

// Process Add Donut Page
app.post("/donut/add", function (req, res, next) {
  let id = req.body.id;
  let name = req.body.name;
  let price = req.body.price;

  client.hmset(id, ["Donut_Name", name, "Price", price], function (err, reply) {
    if (err) {
      console.log(err);
    }
    console.log(reply);
    res.redirect("/");
  });
});

// Delete Donut
app.delete("/donut/delete/:id", function (req, res, next) {
  client.del(req.params.id);
  res.redirect("/");
});

app.listen(port, function () {
  console.log("Server started on port " + port);
});
