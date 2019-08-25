"use strict";

const r = require("rethinkdb");
const router = require("express").Router();
const connect = require("../lib/connect");
var fs = require("fs");
var path = require("path");
var BSONI = require("bson");

const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");
var config = require("../config/secret");
var user = require("../config/userinfo");
var welcome = require("../config/welcome");

var senderAdd = welcome.from;
var EmailSub = welcome.subject;
var msgHeader = welcome.textHeader;
var emailContent = welcome.email;
var msgContent = welcome.textContent;
var email = config.email;
var pass = config.pass;
var crypto = require("crypto");
var token;
var resettoken;
var tokenVerify;
var tadistoStatus;
var validator = require("email-validator");
const keySecret = "sk_test_fN5m0SElHDfTWAdFobl8b7Ul";
const stripe = require("stripe")(keySecret);
const bcrypt = require("bcrypt");
// Body Parser Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/surveyusr/data", function(request, response) {
  let userdetails = JSON.parse(request.body.email);
  let status = "inactive";
  bcrypt.hash(userdetails.password, 10, function(err, hash) {
    if (err) {
      //console.log(err);
    }
    r.db("survey")
      .table("presuserdata")
      .insert({
        email: userdetails.email,
        password: hash,
        name: request.body.name,
        passwordStatus: status
      })
      .run(request._rdb)
      .then(result => {
        response.send(result);
      })
      .catch(error => response.send(error));
  });
});

router.post("/surveyusr/anon", function(request, response) {
  console.log("anon is called ")
  let email = JSON.parse(request.body.email);
  let status = "inactive";
  let password = "sample";
  let name = "undefined";
  r.db("survey")
    .table("presuserdata")
    .filter({
      email: email
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      console.log("anon res is " + JSON.stringify(result));
      if (result.length == 0) {
        console.log("new user");
        bcrypt.hash(password, 10, function(err, hash) {
          if (err) {
            //console.log(err);
          }
          r.db("survey")
            .table("presuserdata")
            .insert({
              email: email,
              password: hash,
              name: name,
              passwordStatus: status
            })
            .run(request._rdb)
            .then(result => {
              console.log("new user res is " + JSON.stringify(result));
              response.send(result);
            })
            .catch(error => response.send(error));
        });
      } else {
        console.log("anon existing user");
        r.db("survey")
          .table("presuserdata")
          .filter({
            email: email
          })
          .run(request._rdb)
          .then(cursor => cursor.toArray())
          .then(result => {
            console.log("anon existing user res is " + JSON.stringify(result));
            response.send(result);
          })
          .catch(error => response.send(error));
      }
      // response.send(result);
    })
    .catch(error => response.send(error));
  // console.log("userdetails "+userdetails);
});


router.post("/surveyusr/getsurveyresult", function(request, response) {
 let formname=request.body.form;

 r.db("survey")
    .table("presurveyresp")
    .filter(r.row("surveyresp")("survey")("surveyName").eq(formname))
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});


router.post("/surveyusr/finduserdata", function(request, response) {
  // console.log(request.body.email);
  r.db("survey")
    .table("presuserdata")
    .filter({ email: request.body.email })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log("result " + JSON.stringify(result));
      if (result.length == 0) {
        response.send(null);
      } else {
        response.send(result);
      }
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/updatepass", function(request, response) {
  // console.log(request.body.email);
  r.db("survey")
    .table("presuserdata")
    .filter({ email: request.body.email })
    .update({
      passwordStatus: "active"
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log("result " + JSON.stringify(result));
      if (result.length == 0) {
        response.send(null);
      } else {
        response.send(result);
      }
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/preSurveyResp", function(request, response) {
  console.log("preSurveyResp called ");
  let surveyresp = JSON.parse(request.body.result);
  let userId = surveyresp.userID;
  console.log("userID " + userId);
  let surveyname = surveyresp["survey"]["surveyName"];
  // console.log("userid "+surveyresp.userID);
  console.log("suveyname "+surveyresp['survey']['surveyName']);
  r.db("survey")
    .table("presurveyresp")
    .filter(
      r
        .row("surveyresp")("userID")
        .eq(userId)
        .and(
          r
            .row("surveyresp")("survey")("surveyName")
            .eq(surveyname)
        )
    )
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      console.log("result is " + JSON.stringify(result));

      if (result.length == 0) {
        surveyresp.version=1.0;
        console.log("new user");
        r.db("survey")
          .table("presurveyresp")
          .insert({ surveyresp })
          .run(request._rdb)
          .then(result => {
            // console.log("res " + JSON.stringify(result));
            response.send(result);
          })
          .catch(error => response.send(error));
      } else {
        console.log("update user");
        
        r.db("survey")
          .table("presurveyresp")
          .filter(
            r
              .row("surveyresp")("userID")
              .eq(userId)
              .and(
                r
                  .row("surveyresp")("survey")("surveyName")
                  .eq(surveyname)
              )
          )
          .update({ surveyresp })
          .run(request._rdb)
          .then(result => {
            // console.log("res " + JSON.stringify(result));
            response.send(result);
          })
          .catch(error => response.send(error));
      }

      // response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/findSurveyResp", function(request, response) {
  console.log("UserID " + request.body.userID);
  console.log("formID " + request.body.formID);
  let userrec = request.body.userID;
  let formrec = "Form " + request.body.formID;
  r.db("survey")
    .table("presurveyresp")
    .filter(
      r
        .row("surveyresp")("userID")
        .eq(userrec)
        .and(
          r
            .row("surveyresp")("survey")("surveyName")
            .eq(formrec)
        )
    )
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      console.log("findSurveyResp result is " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/delworkflow", (request, response) => {
  var ls = JSON.parse(request.body.Workflowdetail);

  // console.log(JSON.stringify(ls));
  // console.log(ls.id);
  r.db("survey")
    .table("presurworkflow")
    .filter({ workflowno: ls.id })
    .delete({})
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log("result is " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/login", (request, response) => {
  r.db("survey")
    .table("presuserdata")
    .filter(r.row("email").eq(request.body.username))
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      bcrypt.compare(request.body.password, result[0].password, function(
        err,
        res
      ) {
        // //console.log("hash: " + result[0].password);

        if (err) {
          //console.log("bcrypt " + err);
          response.send(null);
        }
        if (res) {
          // Passwords match
          // //console.log("login json" + JSON.stringify(result[0]));
          response.send(result[0]);
        } else {
          // Passwords don't match
          // //console.log("password not match " + res);
          response.send(null);
        }
      });
    })
    .catch(error => {
      //console.log("Error from catch:", error);
      response.send(null);
    });
});

router.post("/surveyusr/surveyworkflow", function(request, response) {
  //  console.log("res "+JSON.stringify(request.body.result));
  let workflowdetail = request.body.Workflowdetail;
  let workflowid = request.body.workflowid;
  let collectUserData = request.body.collectUserData;
  let customHeader = request.body.header;
  let entrydata = request.body.entrydata;
  console.log("entrydata " + JSON.parse(entrydata));
  r.db("survey")
    .table("presurworkflow")
    .filter({ workflowno: workflowid })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      if (result.length == 0) {
        // console.log("length 0 ");
        r.db("survey")
          .table("presurworkflow")
          .insert({
            workflowno: workflowid,
            workflowdetail: workflowdetail,
            collectUserData: collectUserData,
            customHeader: customHeader,
            entrydata: entrydata
          })
          .run(request._rdb, (error, result) => {
            // console.log("res " + JSON.stringify(result));
            response.json(result);
          })
          .catch(error => {
            //console.log("Error:", error);
            response.send(error);
          });
      } else {
        // console.log("length 1 ");
        r.db("survey")
          .table("presurworkflow")
          .filter({ workflowno: workflowid })
          .update({
            workflowdetail: workflowdetail,
            collectUserData: collectUserData,
            customHeader: customHeader,
            entrydata: entrydata
          })
          .run(request._rdb, (error, result) => {
            // console.log("res " + JSON.stringify(result));
            response.json(result);
          })
          .catch(error => {
            //console.log("Error:", error);
            response.send(error);
          });
      }
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/headerworkflow", function(request, response) {
  //  console.log("res "+JSON.stringify(request.body.result));
  let workflowid = request.body.workflowid;
  let customHeader = request.body.header;

  // console.log("customHeader " + customHeader);
  r.db("survey")
    .table("presurworkflow")
    .filter({ workflowno: workflowid })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      if (result.length == 0) {
        // console.log("length 0 ");
        r.db("survey")
          .table("presurworkflow")
          .insert({
            workflowno: workflowid,
            customHeader: customHeader
          })
          .run(request._rdb, (error, result) => {
            // console.log("res " + JSON.stringify(result));
            response.json(result);
          })
          .catch(error => {
            //console.log("Error:", error);
            response.send(error);
          });
      } else {
        // console.log("length 1 ");
        r.db("survey")
          .table("presurworkflow")
          .filter({ workflowno: workflowid })
          .update({
            customHeader: customHeader
          })
          .run(request._rdb, (error, result) => {
            // console.log("res " + JSON.stringify(result));
            response.json(result);
          })
          .catch(error => {
            //console.log("Error:", error);
            response.send(error);
          });
      }
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/surveyrule", function(request, response) {
  //  console.log("res "+JSON.stringify(request.body.result));
  let userAuth = request.body.userAuth;
  let passFirstTime = request.body.passFirstTime;
  let PassEveryTime = request.body.PassEveryTime;
  // console.log("id " + workflowid);
  // console.log("workflowstatus " + workflowstatus);
  r.db("survey")
    .table("Surveyrules")
    .update({
      userAuth: userAuth,
      passFirstTime: passFirstTime,
      PassEveryTime: PassEveryTime
    })

    .run(request._rdb)
    .then(results => {
      console.log("result status  " + JSON.stringify(results));
      response.json(results);
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/getsurveyrule", function(request, response) {
  //  console.log("iamActive");
  r.db("survey")
    .table("Surveyrules")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(results => {
      // console.log("result status  " + JSON.stringify(results));
      response.json(results);
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/workflowstatus", function(request, response) {
  // console.log("status workflow " + JSON.stringify(request.body));
  let workflowstatus = request.body.workflowstatus;
  let workflowid = request.body.workflowid;

  // console.log("id " + workflowid);
  // console.log("workflowstatus " + workflowstatus);
  r.db("survey")
    .table("presurworkflow")
    .filter({ workflowno: workflowid })
    .update({ status: workflowstatus })
    .run(request._rdb)
    .then(results => {
      // console.log("result status  " + JSON.stringify(results));
      response.json(results);
    })
    .catch(error => response.send(error));
});

router.post("/surveyusr/intialworkflow", function(request, response) {
  let workflow = JSON.parse(request.body.Workflowdetail);
  delete workflow["id"];
  r.db("survey")
    .table("presurworkflow")
    .insert(workflow)
    .run(request._rdb, (error, result) => {
      // console.log("er " + JSON.stringify(error));
      // console.log("res 2 " + JSON.stringify(result));
      response.json(result);
    })
    .catch(error => {
      //console.log("Error:", error);
      response.send(error);
    });
});

router.post("/surveyusr/getuserdata", function(request, response) {
  // console.log("works");
  r.db("survey")
    .table("presuserdata")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log("res " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});


router.post("/surveyusr/getworkflow", function(request, response) {
  // console.log("works");
  r.db("survey")
    .table("presurworkflow")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log("res " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});


router.post("/surveyusr/collectUserData", function(request, response) {
  let userData = JSON.parse(request.body.result);
  // console.log(typeof surveyworkflow);
  r.db("survey")
    .table("presurworkflow")
    .filter("CollectUserData")
    .update({ CollectUserData: userData })
    .run(request._rdb)
    .then(result => {
      // console.log("res "+JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});
router.post("/send", (request, response) => {});
module.exports = router;
