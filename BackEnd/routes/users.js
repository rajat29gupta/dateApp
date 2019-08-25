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
const bcrypt = require("bcrypt");

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
// Body Parser Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/getsinglesurveyfilename", (request, response) => {
  //console.log("getsinglesurveyfilename: " + request.body.filename);
  var filename = request.body.filename;
  // var questionId = request.body.questionId;
  //console.log(filename);
  if (filename === "undefined") {
    var src = request.app.locals.rootfolder;
    //console.log("src", src);
    var realpath = path.resolve(src, "assets", filename);
    //console.log("realpath=", realpath);
    var b = new BSONI();
    var data = fs.readFileSync(realpath);
    //console.log("data", JSON.stringify(JSON.parse(data)));
    var data2 = JSON.stringify(JSON.parse(data));
    response.send(data2);
  } else {
    // fetchQuestionJson(questionId, request, response);
    r.db("survey")
      .table("surveyquest")
      .filter({ id: filename })
      .run(request._rdb)
      .then(cursor => cursor.toArray())
      .then(result => {
        response.send(result);
      })
      .catch(error => response.send(error));
  }
});

function fetchQuestionJson(filename, request, response) {
  //console.log("works " + filename);
  // //console.log(questionId);
  r.db("survey")
    .table("surveyquest")
    .filter({ id: filename })
    .then(cursor => cursor.toArray())
    .run(request._rdb, (error, result) => {
      //console.log(error, result);
      if (result) {
        //console.log("result "+result);
        response.send(result);
      }
    })
    .catch(error => {
      //console.log("Error", error);
      return error;
    });
}

router.post("/dappBoxStatus", (request, response) => {
  r.db("survey")
    .table("rootuser")
    .update({ dappcreate: request.body.user })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      //console.log("status " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/surveylist", (request, response) => {
  //console.log("surveylist: ");

  r.db("survey")
    .table("surveyquest")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      //console.log("res "+result);
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/userinfo", (request, response) => {
  //console.log("userinfo: ");

  r.db("survey")
    .table("users")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/login", (request, response) => {
  console.log("login: " + JSON.stringify(request.body));
  // console.log(validator.validate(request.body.username));

  if (validator.validate(request.body.username)) {
    // email
    // console.log("email  rec " + request.body.username);
    r.db("survey")
      .table("users")
      .filter(r.row("username").eq(request.body.username))
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
  } else {
    // username
    // console.log("username rec");
    r.db("survey")
      .table("users")
      .filter(r.row("username").eq(request.body.username))
      .run(request._rdb)
      .then(cursor => cursor.toArray())
      .then(result => {
        bcrypt.compare(request.body.password, result[0].password, function(
          err,
          res
        ) {
          // console.log("hash: " + result[0].password);

          if (err) {
            // console.log("bcrypt " + err);
            response.send(null);
          }
          if (res) {
            // Passwords match
            // console.log("login json" + JSON.stringify(result[0]));
            response.send(result[0]);
          } else {
            // Passwords don't match
            // console.log("password not match " + res);
            response.send(null);
          }
        });
      })
      .catch(error => {
        //console.log("Error from catch:", error);
        response.send(null);
      });
  }
});

router.post("/loginadmin", (request, response) => {
  let adminReg = request.body.username;
  let adminPass = request.body.password;

  r.db("survey")
    .table("rootuser")
    .filter("username")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      if (adminReg === result[0].username && adminPass === result[0].password) {
        // Passwords match
        // console.log("Passowrd match");
        var obj = JSON.parse('{"result":"success"}');
        response.send(obj);
        // response.send(result[0]);
      } else {
        // Passwords don't match
        // console.log("Password not match");
        response.send(null);
      }
    })
    .catch(error => {
      //console.log("Error from catch:", error);
      response.send(null);
    });
});

router.post("/presurvey", (request, response) => {
  // JSON.stringify("rec "+request.body);
  let surveydetail = request.body.Surveydetail;
  let surevyid = request.body.surevyid;
  r.db("survey")
    .table("presurvey")
    .filter(r.row("surveyno").eq(surevyid))
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log("res "+JSON.stringify(result));
      if (result.length == 0) {
        r.db("survey")
          .table("presurvey")
          .insert({ surveyno: surevyid, surveydetail: surveydetail })
          .run(request._rdb, (error, result) => {
            response.json(result);
          })
          .catch(error => {
            //console.log("Error:", error);
            response.send(error);
          });
      } else {
        r.db("survey")
          .table("presurvey")
          .filter(r.row("surveyno").eq(surevyid))
          .update({ surveydetail: surveydetail })
          .run(request._rdb, (error, result) => {
            response.json(result);
          })
          .catch(error => {
            //console.log("Error:", error);
            response.send(error);
          });
      }
    })
    .catch(error => {
      response.send(null);
    });
});

router.post("/getpresurvey", (request, response) => {
  r.db("survey")
    .table("presurvey")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log(JSON.stringify(result));
      response.send(result);
    })
    .catch(error => {
      response.send(null);
    });
});

router.post("/findsurvey", (request, response) => {
  var survey = request.body.surevyid;
  r.db("survey")
    .table("presurvey")
    .filter({ surveyno: survey })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => {
      response.send(null);
    });
});

router.post("/delpre", (request, response) => {
  var ls = JSON.parse(request.body.Surveydetail);

  console.log(JSON.stringify(ls));
  console.log(ls.id);
  r.db("survey")
    .table("presurvey")
    .filter({ surveyno: ls.id })
    .delete({})
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // console.log("result is " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});
router.post("/recovery", (request, response) => {
  /// To update password
  //console.log("Recovery API called");
  bcrypt.hash(request.body.pasword, 10, function(err, hash) {
    if (err) {
      //console.log(err);
    }
    request.body.pasword = hash;
    r.db("survey")
      .table("users")
      .filter({ email: user.email })
      .update({ password: request.body.pasword })
      .run(request._rdb)
      .then(cursor => cursor.toArray())
      .then(result => {
        response.send(result);
      })
      .catch(error => response.send(error));
  });
  user.resetPasswordToken = null;
});

router.post("/update", (request, response) => {
  //console.log("Update API called");
  let userReg = JSON.parse(request.body.objtosave);
  //console.log("data received in Node " + JSON.stringify(userReg));
  //console.log("username " + userReg.dappNetwork);
  r.db("survey")
    .table("users")
    .filter({ username: userReg.Username })
    .update({
      firstname: userReg.firstname,
      secondname: userReg.secondname,
      profile: userReg.profile,
      dappUrl: userReg.dataUsg,
      email: userReg.email
      // dappNetwork: userReg.dappNetwork
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      //console.log("result is " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/deleteData", (request, response) => {
  //console.log("Update API called");
  let userReg = JSON.parse(request.body.objtosave);
  //console.log("data received in Node " + JSON.stringify(userReg));
  //console.log("username " + userReg.username);
  r.db("survey")
    .table("users")
    .filter({ username: userReg.username })
    .delete({})
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      //console.log("result is " + JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/Subsplan", (request, response) => {
  let userReg = JSON.parse(request.body.objtosave);
  r.db("survey")
    .table("rootuser")
    .update({
      dappsub: userReg.dappsub,
      Tadisto: userReg.Tadisto,
      foldercreate: userReg.foldercreate,
      survelpan: userReg.survelpan,
      authType: userReg.authType,
      dappcreate: userReg.dappcreate
    })
    .run(request._rdb)
    .then(result => {
      if (result.replaced === 1) {
        var obj = JSON.parse('{"result":"success"}');
        response.send(obj);
      }
      // response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/saveImage", (request, res) => {
  let userReg = JSON.parse(request.body.objtosave);

  // console.log("save Image "+JSON.stringify(userReg));
  r.db("survey")
    .table("users")
    .filter({ email: userReg.email })
    .update({ profilepic: "true" })
    .run(request._rdb)
    .then(result => {
      console.log("profile pic status success");
      res.send(result);
    })
    .catch(error => res.send(error));
});

router.post("/dappUrl", (request, response) => {
  //console.log("dappUrl API called");

  r.db("survey")
    .table("users")
    .filter(r.row("email").eq(request.body.email))
    .update({ dappUrl: request.body.dappUrl })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/chargeDapp", (request, response) => {
  // console.log("chargeDapp API called");

  // console.log("email " + request.body.email);
  // console.log("token " + request.body.token);
  let amount = request.body.price;
  let status = Boolean;
  stripe.customers
    .create({
      email: request.body.email,
      source: request.body.token
    })
    .then(customer =>
      stripe.charges.create({
        amount,
        description: request.body.description,
        currency: "usd",
        customer: customer.id
      })
    )
    .then(charge => {
      if (charge["status"] === "succeeded") {
        r.db("survey")
          .table("users")
          .filter({ email: request.body.email })
          .update({
            customer_id: charge.customer,
            transction_id: charge.id
          })
          .run(request._rdb)
          // .then(cursor => cursor.toArray())
          .then(result => {
            //console.log("result is " + JSON.stringify(result));
          })
          .catch(error => console.log(error));
        status = true;
      } else {
        status = false;
      }
      response.send(status);
    });
});

router.post("/deldetail", (request, response) => {
  // console.log("deldetail API called " + request.body.email);

  r.db("survey")
    .table("users")
    .filter(r.row("email").eq(request.body.email))
    .update({ dappboxdeleted: "true" })
    .run(request._rdb)
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/fexplorer", (request, response) => {
  // console.log("fexplorer API called");

  r.db("survey")
    .table("users")
    .filter(r.row("email").eq(request.body.email))
    .update({ fexplore: "true" })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

/// Update Password through profile section
router.post("/updatePass", (request, response) => {
  //console.log("Update password API called");

  r.db("survey")
    .table("users")
    .filter(r.row("email").eq(request.body.email))
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      bcrypt.compare(request.body.currentPass, result[0].password, function(
        err,
        res
      ) {
        //console.log("hash: " + result[0].password);

        if (err) {
          //console.log("bcrypt " + err);
          response.send(null);
        }
        if (res) {
          // Passwords match
          bcrypt.hash(request.body.newPass, 10, function(err, hash) {
            if (err) {
              //console.log(err);
            }
            request.body.newPass = hash;
            //console.log("hash is " + request.body.newPass);
            r.db("survey")
              .table("users")
              .filter(r.row("email").eq(request.body.email))
              .update({ password: request.body.newPass })
              .run(request._rdb)
              .then(cursor => cursor.toArray())
              .then(result => {
                response.send(result);
              })
              .catch(error => response.send(error));
          });
          //console.log("Updated password json" + JSON.stringify(result[0]));
          // response.send(result[0]);
        } else {
          // Passwords don't match
          //console.log("password not match " + res);
          response.send(null);
        }
      });
    })
    .catch(error => {
      //console.log("Error from catch:", error);
      response.send(null);
    });
});

router.post("/recoveryValidate", (request, response) => {
  /// To validate token
  let userReg = JSON.parse(request.body.token);

  //console.log("Recovery validate API called ");
  if (userReg.slug === user.resetPasswordToken) {
    //console.log("Success");
    var txt = '{"result":"sucess"}';
    var obj = JSON.parse(txt);
    response.send(obj);
  } else {
    response.send(JSON.parse(null));
  }
});

router.post("/emailverify", (request, response) => {
  /// To validate token
  let userReg = request.body.email;
  //console.log("emailverify API called " + userReg);
  r.db("survey")
    .table("users")
    .filter({ email: userReg })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      var status = result[0]["emailstatus"];
      //console.log("result " + status);
      if (status === "verified") {
        var txt = '{"result":"success"}';
        var obj = JSON.parse(txt);
        response.send(obj);
      } else {
        response.send(null);
      }
    })
    .catch(error => {
      //console.log("error here " + error);
    });
});

router.post("/getuserdetail", (request, response) => {
  /// To validate token
  let userReg = request.body.email;
  //console.log("emailverify API called " + userReg);
  r.db("survey")
    .table("users")
    .filter({ email: userReg })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // //console.log("result "+JSON.stringify(result));
      response.send(result);
    })
    .catch(error => {
      //console.log("error here " + error);
    });
});

router.post("/emailtoken", (request, response) => {
  /// validate emailtoken
  let userReg = JSON.parse(request.body.token);
  var val;
  //console.log("Emailtoken validate API called " + userReg.slug);

  r.db("survey")
    .table("users")
    .getField("emailstatus")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      result.forEach(function(element) {
        if (userReg.slug === element) {
          val = "true";
          //console.log("match found " + element);
        }
      });
      if (val === "true") {
        r.db("survey")
          .table("users")
          .filter({ emailstatus: userReg.slug })
          .update({ emailstatus: "verified" })
          .run(request._rdb)
          // .then(cursor => cursor.toArray())
          .then(result => {
            //console.log("result after update " + JSON.stringify(result));
          })
          .catch(error => {
            //console.log("error here " + error);
          });

        var txt = '{"result":"sucess"}';
        var obj = JSON.parse(txt);
        response.send(obj);
      } else {
        response.send(JSON.parse(null));
      }
    })
    .catch(error => {
      //console.log("error here " + error);
      response.send(error);
    });
});

router.post("/resetEmail", (request, response) => {
  /// To send a mail
  //////////Mail Msg Start//////////////
  // create reusable transporter object using the default SMTP transport

  // //console.log("email " + request.body.username);
  r.db("survey")
    .table("users")
    .filter(r.row("email").eq(request.body.username))
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      if (result[0] == JSON.parse(null)) {
        response.send(JSON.parse(null));
      } else {
        crypto.randomBytes(20, function(err, buf) {
          token = buf.toString("hex");
          //console.log("token created ");
          user.email = request.body.username;
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          ///////Nodemailer Start ///
          let transporter = nodemailer.createTransport({
            host: "smtp.ionos.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: email, // generated ethereal user
              pass: pass // generated ethereal password
            },

            tls: {
              rejectUnauthorized: false
            }
          });
          // setup email data with unicode symbols

          const output =
            `
 

          <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta http-equiv="x-ua-compatible" content="ie=edge" />
            <title>Password Reset</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style type="text/css">
              /**
           * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
           */
              @media screen {
                @font-face {
                  font-family: "Source Sans Pro";
                  font-style: normal;
                  font-weight: 400;
                  src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"),
                    url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff)
                      format("woff");
                }
        
                @font-face {
                  font-family: "Source Sans Pro";
                  font-style: normal;
                  font-weight: 700;
                  src: local("Source Sans Pro Bold"), local("SourceSansPro-Bold"),
                    url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff)
                      format("woff");
                }
              }
        
              /**
           * Avoid browser level font resizing.
           * 1. Windows Mobile
           * 2. iOS / OSX
           */
              body,
              table,
              td,
              a {
                -ms-text-size-adjust: 100%; /* 1 */
                -webkit-text-size-adjust: 100%; /* 2 */
              }
        
              /**
           * Remove extra space added to tables and cells in Outlook.
           */
              table,
              td {
                mso-table-rspace: 0pt;
                mso-table-lspace: 0pt;
              }
        
              /**
           * Better fluid images in Internet Explorer.
           */
              img {
                -ms-interpolation-mode: bicubic;
              }
        
              /**
           * Remove blue links for iOS devices.
           */
              a[x-apple-data-detectors] {
                font-family: inherit !important;
                font-size: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
                color: inherit !important;
                text-decoration: none !important;
              }
        
              /**
           * Fix centering issues in Android 4.4.
           */
              div[style*="margin: 16px 0;"] {
                margin: 0 !important;
              }
        
              body {
                width: 100% !important;
                height: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
              }
        
              /**
           * Collapse table borders to avoid space between cells.
           */
              table {
                border-collapse: collapse !important;
              }
        
              a {
                color: #1a82e2;
              }
        
              img {
                height: auto;
                line-height: 100%;
                text-decoration: none;
                border: 0;
                outline: none;
              }
            </style>
          </head>
          <body style="background-color: #e9ecef;">
            <!-- start preheader -->
            <div
              class="preheader"
              style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;"
            >
            DISTRIBUTED LIQUID REALITIES
            </div>
            <br><br><br><br><br><br>
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              
            >
              <tr>
                <td align="center" bgcolor="#e9ecef"></td>
              </tr>
        
              <tr>
                <td align="center" bgcolor="#e9ecef">
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="max-width: 600px;"
                  >
                    <tr>
                      <td
                        align="left"
                        bgcolor="#ffffff"
                        style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;"
                      >
                        <h1
                          style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;"
                        >
                          Reset Your Password
                        </h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
        
              <tr>
                <td align="center" bgcolor="#e9ecef">
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="max-width: 600px;"
                  >
                    <!-- start copy -->
                    <tr>
                      <td
                        align="left"
                        bgcolor="#ffffff"
                        style=" padding-top:24px;padding-left: 24px;
                        padding-right: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"
                      >
                        <p style="margin: 0;">Attention ` +
            result[0].firstname +
            `,</p><br>
                        <p>
                          You are receiving this because you (or someone else) have
                          requested the reset of the password for your account
                        </p>
                      </td>
                    </tr>
                    <!-- end copy -->
                    <!-- start copy -->
                    <tr>
                      <td
                        align="left"
                        bgcolor="#ffffff"
                        style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"
                      >
                        <p style="margin: 0;">
                          Tap the button below to reset your customer account password.
                          If you didn't request a new password, you can safely delete
                          this email.
                        </p>
                      </td>
                    </tr>
                    <!-- end copy -->
        
                    <!-- start button -->
                    <tr>
                      <td align="left" bgcolor="#ffffff">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                              <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td
                                    align="center"
                                    bgcolor="#1a82e2"
                                    style="border-radius: 6px;"
                                  >
                                    <a
                                      href="https://register.ixxo.io/password-recovery/` +
            token +
            `"
                                      target="_blank"
                                      style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;"
                                      >Recover Password</a
                                    >
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- end button -->
        
                    <!-- start copy -->
                    <tr>
                      <td
                        align="left"
                        bgcolor="#ffffff"
                        style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"
                      >
                        <p style="margin: 0;">
                          If that doesn't work, copy and paste the following link in
                          your browser:
                        </p>
                        <p style="margin: 0;">
                          " https://register.ixxo.io/password-recovery/` +
            token +
            ` " 
                        </p>
                      </td>
                    </tr>
                    <!-- end copy -->
        
                    <!-- start copy -->
                    <tr>
                      <td
                        align="left"
                        bgcolor="#ffffff"
                        style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf"
                      >
                        <p style="margin: 0;">
                          Regards,<br />
                          iXXo Administrator
                        </p>
                      </td>
                    </tr>
                    <!-- end copy -->
                  </table>
                </td>
              </tr>
              <!-- end copy block -->
        
              <!-- start footer -->
              <tr>
                <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="max-width: 600px;"
                  >
                    <!-- start permission -->
                    <tr>
                      <td
                        align="center"
                        bgcolor="#e9ecef"
                        style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
                      >
                        <p style="margin: 0;">
                          This message is auto-generated from E-mail dappbox server, and
                          replies sent to this email can not be delivered.
                        </p>
                      </td>
                    </tr>
                    <!-- end permission -->
        
                    <!-- start unsubscribe -->
                    <tr>
                      <td
                        align="center"
                        bgcolor="#e9ecef"
                        style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
                      >
                        <p style="margin: 0;">
                          This email is meant for ` +
            request.body.username +
            ` (email)
                        </p>
                      </td>
                    </tr>
                    <!-- end unsubscribe -->
                  </table>
                </td>
              </tr>
              <!-- end footer -->
            </table>
            <!-- end body -->
          </body>
        </html>
        
          `;

          let mailOptions = {
            from: senderAdd, // sender address
            to: request.body.username, // list of receivers
            subject: "iXXo - Password recovery", // Subject line
            // text:
            //   "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            //   "Please click on the following link, or paste this into your browser to complete the process:\n\n" +

            //   "\n\n" +
            //   "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            html: output
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              response.send(error);
              return; //console.log("mail not send " + error);
            }
            response.send(info.messageId);
            //console.log("MESSSAGE", info.messageId);
            //console.log("Message sent: %s", info.messageId);
            //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            res.render("contact", { msg: "Email has been sent" });
          });
          ///////Nodemailer Ends ///
          response.send(result[0]);
        });
      }
    })
    .catch(error => response.send(error));
});

function sendMail(emailRec, subject, response, status) {
  console.log("Sending Email to ", emailRec[0].email);

  var tadistoEnable =
    `<p>
  You dAppbox has been created on URL:<br />
  <a href="https://` +
    emailRec[0].shortUrl +
    `.ixxo.io">https://` +
    emailRec[0].shortUrl +
    `.ixxo.io</a><br /><br />You can
  also access it using:<br />
  <a href="` +
    emailRec[0].dappUrl +
    `">` +
    emailRec[0].dappUrl +
    `</a><br /><br />
  Please download the tadisto client here:<br />
  <a href="https://tadistoinstall.dappbox.io/v2/TadistoRC.exe"
    >https://tadistoinstall.dappbox.io/v2/TadistoRC.exe</a
  >
  <br />
  <br />
</p>
`;
  var tadistoDisable =
    ` <p>
You dAppbox has been created on URL:<br />
<a href="https://` +
    emailRec[0].shortUrl +
    `.ixxo.io">https://` +
    emailRec[0].shortUrl +
    `.ixxo.io</a
><br /><br />
You can also access it using:<br />   <a href="
` +
    emailRec[0].dappUrl +
    ` ">` +
    emailRec[0].dappUrl +
    `</a
    ><br /><br />
</p>`;
  var dataload = status === "Yes" ? tadistoEnable : tadistoDisable;

  let transporter = nodemailer.createTransport({
    host: "smtp.ionos.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: email, // generated ethereal user
      pass: pass // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let mailOptions = {
    from: senderAdd, // sender address
    to: emailRec[0].email, // list of receivers
    subject: subject, // Subject line
    // text: msgHeader + userReg.firstname + "," + msgContent // plain text body
    html:
      `

      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="x-ua-compatible" content="ie=edge" />
          <title>Welcome to iXXo</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style type="text/css">
            /**
                                   * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
                                   */
            @media screen {
              @font-face {
                font-family: "Source Sans Pro";
                font-style: normal;
                font-weight: 400;
                src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"),
                  url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff)
                    format("woff");
              }
      
              @font-face {
                font-family: "Source Sans Pro";
                font-style: normal;
                font-weight: 700;
                src: local("Source Sans Pro Bold"), local("SourceSansPro-Bold"),
                  url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff)
                    format("woff");
              }
            }
      
            /**
                                   * Avoid browser level font resizing.
                                   * 1. Windows Mobile
                                   * 2. iOS / OSX
                                   */
            body,
            table,
            td,
            a {
              -ms-text-size-adjust: 100%; /* 1 */
              -webkit-text-size-adjust: 100%; /* 2 */
            }
      
            /**
                                   * Remove extra space added to tables and cells in Outlook.
                                   */
            table,
            td {
              mso-table-rspace: 0pt;
              mso-table-lspace: 0pt;
            }
      
            /**
                                   * Better fluid images in Internet Explorer.
                                   */
            img {
              -ms-interpolation-mode: bicubic;
            }
      
            /**
                                   * Remove blue links for iOS devices.
                                   */
            a[x-apple-data-detectors] {
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              color: inherit !important;
              text-decoration: none !important;
            }
      
            /**
                                   * Fix centering issues in Android 4.4.
                                   */
            div[style*="margin: 16px 0;"] {
              margin: 0 !important;
            }
      
            body {
              width: 100% !important;
              height: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
      
            /**
                                   * Collapse table borders to avoid space between cells.
                                   */
            table {
              border-collapse: collapse !important;
            }
      
            a {
              color: #1a82e2;
            }
      
            img {
              height: auto;
              line-height: 100%;
              text-decoration: none;
              border: 0;
              outline: none;
            }
          </style>
         
        </head>
        <body style="background-color: #e9ecef;">
          <!-- start preheader -->
          <div
            class="preheader"
            style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;"
          >
            DISTRIBUTED LIQUID REALITIES
          </div>
          <br /><br /><br /><br /><br /><br />
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" bgcolor="#e9ecef"></td>
            </tr>
      
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                  style="max-width: 600px;"
                >
                  <tr>
                    <td
                      align="left"
                      bgcolor="#ffffff"
                      style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;"
                    >
                      <h1
                        style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;"
                      >
                        Hello ` +
      emailRec[0].firstname +
      `
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
      
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                  style="max-width: 600px;"
                >
                  <!-- start copy -->
                  <tr>
                    <td
                      align="left"
                      bgcolor="#ffffff"
                      style="padding-left: 24px;
                                                padding-right: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"
                    >
                      <!-- <p style="margin: 0;">Hello ,</p> -->
                      <br />
                      ` +
      dataload +
      `
                    </td>
                  </tr>
                  <!-- end copy -->
      
                  <!-- start copy -->
                  <tr>
                    <td
                      align="left"
                      bgcolor="#ffffff"
                      style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf"
                    >
                      <p style="margin: 0;">
                        Regards,<br />
                        iXXo Administrator
                      </p>
                    </td>
                  </tr>
                  <!-- end copy -->
                </table>
              </td>
            </tr>
            <!-- end copy block -->
      
            <!-- start footer -->
            <tr>
              <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                  style="max-width: 600px;"
                >
                  <!-- start permission -->
                  <tr>
                    <td
                      align="center"
                      bgcolor="#e9ecef"
                      style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
                    >
                      <p style="margin: 0;">
                        This message is auto-generated from Email dappbox server
                      </p>
                    </td>
                  </tr>
                  <!-- end permission -->
      
                  <!-- start unsubscribe -->
                  <tr>
                    <td
                      align="center"
                      bgcolor="#e9ecef"
                      style=" font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
                    >
                      <p style="margin: 0;">
                        This email is meant for ` +
      emailRec[0].username +
      `
                      </p>
                    </td>
                  </tr>
                  <!-- end unsubscribe -->
                </table>
              </td>
            </tr>
            <!-- end footer -->
          </table>
      
          <!-- end body -->
        </body>
       
      </html>
      

  `
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return; //console.log(error);
    }
    //console.log("Message sent: %s", info.messageId);
    //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    //  res.render('contact', { msg: 'Email has been sent' });
  });
  response.send("Mail sent");
}

router.get("/sendMail", (request, response) => {
  const username = request.query.username; //receiving dapp URL
  const email = request.query.email;
  r.db("survey")
    .table("rootuser")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      tadistoStatus = result[0]["Tadisto"];
    })
    .catch(error => {
      console.log("Error from catch:", error);
      // response.send(error);
    });
  if (email) {
    r.db("survey")
      .table("users")
      .filter({ email: email })
      .run(request._rdb)
      .then(cursor => cursor.toArray())
      .then(result => {
        if (result.length == 1) {
          sendMail(result, "DAppBox Created", response, tadistoStatus);
        } else {
          //console.log("No user found for username ", username)
          response.send("No Mail sent");
        }
      })
      .catch(error => {
        //console.log("Error from catch:", error);
        response.send(error);
      });
  } else {
    //console.log("Fetching for shortUrl ", username)
    r.db("survey")
      .table("users")
      .filter({ shortUrl: username })
      .run(request._rdb)
      .then(cursor => cursor.toArray())
      .then(result => {
        if (result.length == 1) {
          sendMail(result, "DAppBox Created", response, tadistoStatus);
        } else {
          //console.log("No user found for username ", username)
          response.send("No Mail sent");
        }
      })
      .catch(error => {
        //console.log("Error from catch:", error);
        response.send(error);
      });
  }
});

router.post("/register", (request, response) => {
  console.log(request.body.objtosave);

  let userReg = JSON.parse(request.body.objtosave);
  r.db("survey")
    .table("users")
    .filter(r.row("username").eq(userReg.username))
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      // //console.log("new data 2 "+ JSON.stringify(userReg));
      if (result.length == 0) {
        ///Hashing password
        bcrypt.hash(userReg.password, 10, function(err, hash) {
          if (err) {
            //console.log(err);
          }
          userReg.password = hash;
          userReg.cpassword = "";
          //   // //console.log("Register API
          r.db("survey")
            .table("users")
            .insert(userReg, { returnChanges: true })
            .run(request._rdb, (error, result) => {
              if (error) {
                throw error;
              } else if (result.inserted !== 1) {
                //Validate duplicate email and username
                response.json(result);
                // //console.log("result from register " + JSON.stringify(result));
              } else {
                response.send(result.changes[0].new_val);
                //////////Mail Msg End//////////////
              }
            })
            .catch(error => {
              //console.log("Error:", error);
              response.send(error);
            });
        });
      } else {
        const err = { first_error: "Email already exists", errors: "1" };
        response.send(err);
      }
    });
});

///Hashing password
// bcrypt.hash(userReg.password, 10, function(err, hash) {
//   if (err) {
//     //console.log(err);
//   }
//   userReg.password = hash;
//   userReg.cpassword = "";
//   // //console.log("Register API called" + userReg.email);

//   crypto.randomBytes(20, function(err, buf) {
//     tokenVerify = buf.toString("hex");
//     //console.log("token generate " + tokenVerify);
//     userReg.emailstatus = tokenVerify;
//     r.db("survey")
//       .table("users")
//       .filter(r.row("email").eq(userReg.email))
//       .run(request._rdb)
//       .then(cursor => cursor.toArray())
//       .then(result => {
//         // //console.log("new data 2 "+ JSON.stringify(userReg));
//         if (result.length == 0) {
//           r.db("survey")
//             .table("users")
//             .insert(userReg, { returnChanges: true })
//             .run(request._rdb, (error, result) => {
//               if (error) {
//                 throw error;
//               } else if (result.inserted !== 1) {
//                 //Validate duplicate email and username
//                 response.json(result);
//                 // //console.log("result from register " + JSON.stringify(result));
//               } else {
//                 //////////Mail Msg Start//////////////
//                 // create reusable transporter object using the default SMTP transport

//                 let transporter = nodemailer.createTransport({
//                   host: "smtp.ionos.com",
//                   port: 587,
//                   secure: false, // true for 465, false for other ports
//                   auth: {
//                     user: email, // generated ethereal user
//                     pass: pass // generated ethereal password
//                   },

//                   tls: {
//                     rejectUnauthorized: false
//                   }
//                 });
//                 // setup email data with unicode symbols

//                 let mailOptions = {
//                   from: senderAdd, // sender address
//                   to: userReg.email, // list of receivers
//                   subject: EmailSub, // Subject line
//                   html:
//                     `
//                   <!DOCTYPE html>
//                   <html>
//                     <head>
//                       <meta charset="utf-8" />
//                       <meta http-equiv="x-ua-compatible" content="ie=edge" />
//                       <title>Welcome to iXXo</title>
//                       <meta name="viewport" content="width=device-width, initial-scale=1" />
//                       <style type="text/css">
//                         /**
//                              * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
//                              */
//                         @media screen {
//                           @font-face {
//                             font-family: "Source Sans Pro";
//                             font-style: normal;
//                             font-weight: 400;
//                             src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"),
//                               url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff)
//                                 format("woff");
//                           }

//                           @font-face {
//                             font-family: "Source Sans Pro";
//                             font-style: normal;
//                             font-weight: 700;
//                             src: local("Source Sans Pro Bold"), local("SourceSansPro-Bold"),
//                               url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff)
//                                 format("woff");
//                           }
//                         }

//                         /**
//                              * Avoid browser level font resizing.
//                              * 1. Windows Mobile
//                              * 2. iOS / OSX
//                              */
//                         body,
//                         table,
//                         td,
//                         a {
//                           -ms-text-size-adjust: 100%; /* 1 */
//                           -webkit-text-size-adjust: 100%; /* 2 */
//                         }

//                         /**
//                              * Remove extra space added to tables and cells in Outlook.
//                              */
//                         table,
//                         td {
//                           mso-table-rspace: 0pt;
//                           mso-table-lspace: 0pt;
//                         }

//                         /**
//                              * Better fluid images in Internet Explorer.
//                              */
//                         img {
//                           -ms-interpolation-mode: bicubic;
//                         }

//                         /**
//                              * Remove blue links for iOS devices.
//                              */
//                         a[x-apple-data-detectors] {
//                           font-family: inherit !important;
//                           font-size: inherit !important;
//                           font-weight: inherit !important;
//                           line-height: inherit !important;
//                           color: inherit !important;
//                           text-decoration: none !important;
//                         }

//                         /**
//                              * Fix centering issues in Android 4.4.
//                              */
//                         div[style*="margin: 16px 0;"] {
//                           margin: 0 !important;
//                         }

//                         body {
//                           width: 100% !important;
//                           height: 100% !important;
//                           padding: 0 !important;
//                           margin: 0 !important;
//                         }

//                         /**
//                              * Collapse table borders to avoid space between cells.
//                              */
//                         table {
//                           border-collapse: collapse !important;
//                         }

//                         a {
//                           color: #1a82e2;
//                         }

//                         img {
//                           height: auto;
//                           line-height: 100%;
//                           text-decoration: none;
//                           border: 0;
//                           outline: none;
//                         }
//                       </style>
//                     </head>
//                     <body style="background-color: #e9ecef;">
//                       <!-- start preheader -->
//                       <div
//                         class="preheader"
//                         style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;"
//                       >
//                       DISTRIBUTED LIQUID REALITIES
//                       </div>
//                       <br /><br /><br /><br /><br /><br />
//                       <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                         <tr>
//                           <td align="center" bgcolor="#e9ecef"></td>
//                         </tr>

//                         <tr>
//                           <td align="center" bgcolor="#e9ecef">
//                             <table
//                               border="0"
//                               cellpadding="0"
//                               cellspacing="0"
//                               width="100%"
//                               style="max-width: 600px;"
//                             >
//                               <tr>
//                                 <td
//                                   align="left"
//                                   bgcolor="#ffffff"
//                                   style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;"
//                                 >
//                                   <h1
//                                     style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;"
//                                   >
//                                     Welcome to iXXo
//                                   </h1>
//                                 </td>
//                               </tr>
//                             </table>
//                           </td>
//                         </tr>

//                         <tr>
//                           <td align="center" bgcolor="#e9ecef">
//                             <table
//                               border="0"
//                               cellpadding="0"
//                               cellspacing="0"
//                               width="100%"
//                               style="max-width: 600px;"
//                             >
//                               <!-- start copy -->
//                               <tr>
//                                 <td
//                                   align="left"
//                                   bgcolor="#ffffff"
//                                   style=" padding-top:24px;padding-left: 24px;
//                                           padding-right: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"
//                                 >
//                                   <p style="margin: 0;">Hello ` +
//                     userReg.firstname +
//                     `,</p>
//                                   <br />
//                                   <p>Thank you for joining iXXo network! <br/> Your Username : ` +
//                     userReg.username +
//                     ` <br/> We just need you to verify your email address to complete setting up your account.</p>
//                                 </td>
//                               </tr>
//                               <!-- end copy -->

//                   <!-- start button -->
//                   <tr>
//                     <td align="left" bgcolor="#ffffff">
//                       <table border="0" cellpadding="0" cellspacing="0" width="100%">
//                         <tr>
//                           <td align="center" bgcolor="#ffffff" style="padding: 12px;">
//                             <table border="0" cellpadding="0" cellspacing="0">
//                               <tr>
//                                 <td
//                                   align="center"
//                                   bgcolor="#1a82e2"
//                                   style="border-radius: 25px;"
//                                 >
//                                   <a
//                                     href="https://register.ixxo.io/emailvalidate/` +
//                     tokenVerify +
//                     `"
//                                     target="_blank"
//                                     style="display: inline-block; padding: 16px 60px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;"
//                                     >Verify My Email</a
//                                   >
//                                 </td>
//                               </tr>
//                             </table>
//                           </td>
//                         </tr>
//                       </table>
//                     </td>
//                   </tr>
//                   <!-- end button -->

//                               <!-- start copy -->
//                               <tr>
//                                 <td
//                                   align="left"
//                                   bgcolor="#ffffff"
//                                   style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf"
//                                 >
//                                   <p style="margin: 0;">
//                                     Regards,<br />
//                                     iXXo Administrator
//                                   </p>
//                                 </td>
//                               </tr>
//                               <!-- end copy -->
//                             </table>
//                           </td>
//                         </tr>
//                         <!-- end copy block -->

//                         <!-- start footer -->
//                         <tr>
//                           <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
//                             <table
//                               border="0"
//                               cellpadding="0"
//                               cellspacing="0"
//                               width="100%"
//                               style="max-width: 600px;"
//                             >
//                               <!-- start permission -->
//                               <tr>
//                                 <td
//                                   align="center"
//                                   bgcolor="#e9ecef"
//                                   style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
//                                 >
//                                   <p style="margin: 0;">
//                                     This message is auto-generated from E-mail dappbox server
//                                   </p>
//                                 </td>
//                               </tr>
//                               <!-- end permission -->

//                               <!-- start unsubscribe -->
//                               <tr>
//                                 <td
//                                   align="center"
//                                   bgcolor="#e9ecef"
//                                   style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
//                                 >
//                                   <p style="margin: 0;">
//                                     This email is meant for ` +
//                     userReg.email +
//                     `
//                                   </p>
//                                 </td>
//                               </tr>
//                               <!-- end unsubscribe -->
//                             </table>
//                           </td>
//                         </tr>
//                         <!-- end footer -->
//                       </table>

//                       <!-- end body -->
//                     </body>
//                   </html>

// `
//                 };

//                 // send mail with defined transport object
//                 transporter.sendMail(mailOptions, (error, info) => {
//                   if (error) {
//                     return; //console.log(error);
//                   }
//                   //console.log("Message sent: %s", info.messageId);
//                   console.log(
//                     "Preview URL: %s",
//                     nodemailer.getTestMessageUrl(info)
//                   );

//                   //  res.render('contact', { msg: 'Email has been sent' });
//                 });

//                 response.send(result.changes[0].new_val);
//                 //////////Mail Msg End//////////////
//               }
//             })
//             .catch(error => {
//               //console.log("Error:", error);
//               response.send(error);
//             });
//         } else {
//           const err = { first_error: "Email already exists", errors: "1" };
//           response.send(err);
//         }
//       });
//   });
//   //end here
// });
// });

router.post("/resendVerEmail", (request, response) => {
  let userReg = JSON.parse(request.body.objtosave);

  r.db("survey")
    .table("users")
    .filter({ email: userReg.email })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      resettoken = result[0]["emailstatus"];
      if (resettoken === "verified") {
        var txt = '{"result":"alreadyVerfied"}';
        var obj = JSON.parse(txt);
        response.send(obj);
      } else {
        let transporter = nodemailer.createTransport({
          host: "smtp.ionos.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: email, // generated ethereal user
            pass: pass // generated ethereal password
          },

          tls: {
            rejectUnauthorized: false
          }
        });
        // setup email data with unicode symbols

        let mailOptions = {
          from: senderAdd, // sender address
          to: userReg.email, // list of receivers
          subject: EmailSub, // Subject line
          html:
            `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <title>Welcome to iXXo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
          /**
               * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
               */
          @media screen {
            @font-face {
              font-family: "Source Sans Pro";
              font-style: normal;
              font-weight: 400;
              src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"),
                url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff)
                  format("woff");
            }
    
            @font-face {
              font-family: "Source Sans Pro";
              font-style: normal;
              font-weight: 700;
              src: local("Source Sans Pro Bold"), local("SourceSansPro-Bold"),
                url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff)
                  format("woff");
            }
          }
    
          /**
               * Avoid browser level font resizing.
               * 1. Windows Mobile
               * 2. iOS / OSX
               */
          body,
          table,
          td,
          a {
            -ms-text-size-adjust: 100%; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
          }
    
          /**
               * Remove extra space added to tables and cells in Outlook.
               */
          table,
          td {
            mso-table-rspace: 0pt;
            mso-table-lspace: 0pt;
          }
    
          /**
               * Better fluid images in Internet Explorer.
               */
          img {
            -ms-interpolation-mode: bicubic;
          }
    
          /**
               * Remove blue links for iOS devices.
               */
          a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
    
          /**
               * Fix centering issues in Android 4.4.
               */
          div[style*="margin: 16px 0;"] {
            margin: 0 !important;
          }
    
          body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
    
          /**
               * Collapse table borders to avoid space between cells.
               */
          table {
            border-collapse: collapse !important;
          }
    
          a {
            color: #1a82e2;
          }
    
          img {
            height: auto;
            line-height: 100%;
            text-decoration: none;
            border: 0;
            outline: none;
          }
        </style>
      </head>
      <body style="background-color: #e9ecef;">
        <!-- start preheader -->
        <div
          class="preheader"
          style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;"
        >
        DISTRIBUTED LIQUID REALITIES
        </div>
        <br /><br /><br /><br /><br /><br />
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" bgcolor="#e9ecef"></td>
          </tr>
    
          <tr>
            <td align="center" bgcolor="#e9ecef">
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px;"
              >
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;"
                  >
                    <h1
                      style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;"
                    >
                      Welcome to iXXo
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
    
          <tr>
            <td align="center" bgcolor="#e9ecef">
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px;"
              >
                <!-- start copy -->
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style=" padding-top:24px;padding-left: 24px;
                            padding-right: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"
                  >
                    <p style="margin: 0;">Hello ` +
            userReg.firstname +
            `,</p>
                    <br />
                    <p>Thank you for joining iXXo network! <br/> Your Username : ` +
            userReg.username +
            ` <br/> We just need you to verify your email address to complete setting up your account.</p>
                  </td>
                </tr>
                <!-- end copy -->
               
    <!-- start button -->
    <tr>
      <td align="left" bgcolor="#ffffff">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" bgcolor="#ffffff" style="padding: 12px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td
                    align="center"
                    bgcolor="#1a82e2"
                    style="border-radius: 25px;"
                  >
                    <a
                      href="https://register.ixxo.io/emailvalidate/` +
            resettoken +
            `"
                      target="_blank"
                      style="display: inline-block; padding: 16px 60px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;"
                      >Verify My Email</a
                    >
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- end button -->
    
            
    
                <!-- start copy -->
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf"
                  >
                    <p style="margin: 0;">
                      Regards,<br />
                      iXXo Administrator
                    </p>
                  </td>
                </tr>
                <!-- end copy -->
              </table>
            </td>
          </tr>
          <!-- end copy block -->
    
          <!-- start footer -->
          <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px;"
              >
                <!-- start permission -->
                <tr>
                  <td
                    align="center"
                    bgcolor="#e9ecef"
                    style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
                  >
                    <p style="margin: 0;">
                      This message is auto-generated from E-mail dappbox server
                    </p>
                  </td>
                </tr>
                <!-- end permission -->
    
                <!-- start unsubscribe -->
                <tr>
                  <td
                    align="center"
                    bgcolor="#e9ecef"
                    style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"
                  >
                    <p style="margin: 0;">
                      This email is meant for ` +
            userReg.email +
            `
                    </p>
                  </td>
                </tr>
                <!-- end unsubscribe -->
              </table>
            </td>
          </tr>
          <!-- end footer -->
        </table>
    
        <!-- end body -->
      </body>
    </html>
  
  `
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return; //console.log(error);
          }
          //console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

          //  res.render('contact', { msg: 'Email has been sent' });
        });
        var txt = '{"result":"success"}';
        var obj = JSON.parse(txt);
        response.send(obj);
        //////////Mail Msg End//////////////
      }
    })
    .catch(error => {
      console.log("error " + error);
    });
});

router.post("/getdapp", (request, response) => {
  r.db("survey")
    .table("users")
    .filter({ profile: "dApp_creator" })
    .getField("username")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/validatecheck", (request, response) => {
  r.db("survey")
    .table("rootuser")
    .getField("dappcreate")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      //console.log("dappcreate status is:", JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/rootinfo", (request, response) => {
  r.db("survey")
    .table("rootuser")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      //console.log("dappcreate status is:", JSON.stringify(result));
      response.send(result);
    })
    .catch(error => response.send(error));
});
function makeid(choice) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < choice; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

router.post("/getshort", (request, response) => {
  //user choice receive let  a
  var choice = request.body.user;
  var email = request.body.email;
  var url = makeid(choice);
  //console.log("URL " + url);

  r.db("survey")
    .table("users")
    .getField("shortUrl")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      result.forEach(function(element) {
        if (url == element) {
          url = makeid(choice);
        }
      });
      r.db("survey")
        .table("users")
        .filter({ email: email })
        .update({ shortUrl: url })
        .run(request._rdb)
        .then(cursor => cursor.toArray())
        .then(result => {
          //console.log("save " + result);
          // response.send(JSON.stringify(url));
        })
        .catch(error => {
          //console.log("err " + error)
        });
    })
    .catch(error => {
      //console.log("err " + error)
    });
  response.send(JSON.stringify(url));
});

router.post("/deleteUser", (request, response) => {
  let userRefusal = JSON.parse(request.body.objtodelete);
  // //console.log("UserName to delete:", userRefusal.username);
  r.db("survey")
    .table("users")
    .get(userRefusal.username)
    .delete({ returnChanges: true })
    .run(request._rdb)
    .then(result => {
      // //console.log("Delete Result:", JSON.stringify(result));
      if (result.deleted > 0) {
        response.send(result.changes[0].old_val);
      } else {
        //console.log("Sending No rows deleted");
        response.send({ first_error: "No rows deleted" });
      }
    })
    .catch(error => response.send(error));
});

router.post("/savesurvey", (request, response) => {
  let userReg = JSON.parse(request.body.objtosave);
  userReg[0].firstname = request.body.firstname;
  userReg[0].email = request.body.email;
  r.db("survey")
    .table("savedsurveys")
    .insert(userReg)
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/deletesavedsurvey", (request, response) => {
  let user_id = request.body.userid;
  let survey_id = request.body.surveyid;
  //console.log(user_id, survey_id, "deletesavedsurvey");

  r.db("survey")
    .table("savedsurveys")
    .filter(
      r
        .row("userid")
        .eq(user_id)
        .and(r.row("surveyid").eq(survey_id))
    )
    .delete()
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

// Network dAppBox and Edges Details Start

router.post("/dAppBoxDetails", (request, response) => {
  let details = JSON.parse(request.body.objtosave);

  r.db("survey")
    .table("dappnetwork")
    .filter({ dAppArchitect: details.dAppArchitect })
    .update({
      "Network Graph": details.networkGraph,
      entryNodeId: details.entryNodeId,
      entryValue: details.entryValue,
      entryProcessId: details.entryProcessId
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/dappDetails", (request, response) => {
  // console.log("dappDetails Users");
  let details = JSON.parse(request.body.objtosave);
  // console.log(details);

  r.db("survey")
    .table("dappnetwork")
    .insert({
      dAppArchitect: details.dAppArchitect
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/UpdatedappDetails", (request, response) => {
  // console.log("UpdatedappDetails Users");
  let details = JSON.parse(request.body.objtosave);
  var key = details.dappName;
  // console.log(details);

  r.db("survey")
    .table("dappnetwork")
    .filter({ dAppArchitect: details.dAppArchitect })
    .update({
      [key]: {
        dappName: details.dappName,
        id: details.id,
        Username: details.Username,
        Password: details.Password,
        roles: details.roles,
        memoryUsage: details.memoryUsage
        // default_folders : details.default_folders
      }
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/getdappDetails", (request, response) => {
  r.db("survey")
    .table("dappnetwork")
    .filter({ dAppArchitect: request.body.id })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
      // console.log(result);
    })
    .catch(error => response.send(error));
});

router.post("/edgeDetails", (request, response) => {
  // console.log("edgeDetails Users");
  let details = JSON.parse(request.body.objtosave);
  // console.log(details);

  r.db("survey")
    .table("dappnetwork")
    .insert({
      source: details.source,
      target: details.target,
      id: details.id,
      rights: "null",
      Folders: "null"
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/UpdateEdgeDetails", (request, response) => {
  // console.log("UpdateEdgeDetails Users");
  let details = JSON.parse(request.body.objtosave);
  let key = details.id;
  // console.log(details);

  r.db("survey")
    .table("dappnetwork")
    .filter({ dAppArchitect: details.dAppArchitect })
    .update({
      [key]: {
        rights: details.rights,
        Folders: details.Folders,
        source: details.source,
        target: details.target,
        id: details.id
      }
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/getEdgeDetails", (request, response) => {
  r.db("survey")
    .table("dappnetwork")
    .filter({ id: request.body.id })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
      // console.log(result);
    })
    .catch(error => response.send(error));
});

// Network dAppBox and Edges Details End

router.post("/users", (request, response) => {
  let user = Object.assign(
    {},
    {
      email: request.body.username,
      name: request.body.password
    }
  );

  r.db("survey")
    .table("users")
    .insert(user)
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.get("/users", (request, response) => {
  r.db("survey")
    .table("users")
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.put("/user/:user_id", (request, response) => {
  let user_id = request.params.user_id;

  r.db("survey")
    .table("users")
    .get(user_id)
    .update({
      email: request.body.email,
      name: request.body.name
    })
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.delete("/users/:user_id", (request, response) => {
  let user_id = request.params.user_id;

  r.db("survey")
    .table("users")
    .get(user_id)
    .delete()
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => response.send(error));
});

router.post("/send", (request, response) => {});
module.exports = router;
