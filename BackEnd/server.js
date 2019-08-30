"use strict";

const express = require("express");
const fileUpload = require("express-fileupload");

const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const multer = require("multer");
const app = express();
const router = express.Router();

const DIR = "./assets/userpics";
var username;


let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    cb(null, username + "." + "png");
  }
});
let upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const helmet = require( 'helmet' );
require("dotenv").config();

// var multer = require('multer');

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   // res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers","Origin, Content-Type, Authorization, Content-Length, X-Requested-With"
//   );
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static("../client"));
app.use("/assets", express.static("assets"));
app.use(bodyParser.json());

app.get("/api", function(req, res) {
  res.end("file catcher example");
});

app.post("/ping", function(req, res) {
  // res.send(req.body);
  var file = "DefaultFolders/" + username + "/folder_template.json";
  fse.outputFile(file, JSON.stringify(req.body), function(err) {
    if (err) throw err;
    console.log("ping complete");
  });
});

app.post("/dappInfo", function(req, res) {
  console.log(req.body.user_name);
  var userid = req.body.user_name;
  var file = "dappInfo/" + userid + "/user_credentials.json";
  fse.outputFile(file, JSON.stringify(req.body), function(err) {
    if (err) throw err;
    console.log("dappInfo complete");
  });
  var txt = '{"result":"success"}';
  var obj = JSON.parse(txt);
  res.send(obj);
});

app.post("/deleteFolder", function(req, res) {
  var folder = "DefaultFolders/" + username;
  fse.remove(folder, err => {
    if (err) return console.error(err);
    console.log("success!");
  });
  var txt = '{"result":"success"}';
  var obj = JSON.parse(txt);
  res.send(obj);
  // res.send(req.body);
});

app.post("/api/upload", upload.single("photo"), function(req, res) {
  if (!req.file) {
    console.log("No file received");
    return res.send({
      success: false
    });
  } else {
    console.log("file received");
    return res.send({
      success: true
    });
  }
});

app.post("/Uname", function(req, res) {
  console.log("user called");
  console.log("user called" + req.body.Username);
  username = req.body.Username;
  console.log("user name " + username);
  res.send(req.body);
});

app.post("/usernmeinfo", function(req, res) {
  console.log("user called");
  console.log("user called" + req.body.Username);
  username = req.body.Username;
  console.log("user name " + username);
  res.send(req.body);
});

app.use(logger("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(cors());
// app.use( helmet() );

const connect = require("./lib/connect");
const users = require("./routes/users");
const admin = require("./routes/admin");
const presurvey = require("./routes/presurvey");
app.locals.rootfolder = __dirname + "dist/index.html";



app.use(connect.connect);
app.use("/", users);

app.use("/admin", admin);
app.use("/presurvey", presurvey);
app.use(connect.close);

app.use((error, request, response, next) => {
  response.status(error.status || 500);
  console.log(request.url, " Error Occurred ");
  response.json({
    error: error.message
  });
});

app.use((request, response, next) => {
  let error = new Error("Not Found");
  console.log(request.url, "not Found");
  error.status = 404;
  response.json(error);
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("App is listening on http://%s:%s", "localhost", port);
});
