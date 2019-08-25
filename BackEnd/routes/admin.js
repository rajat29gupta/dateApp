"use strict";

const connect = require("../lib/connect");
var path = require("path");


const nodemailer = require("nodemailer");
var config = require("../config/secret");
var welcome = require("../config/welcome");

var senderAdd = welcome.from;
var email = config.email;
var pass = config.pass;

const r = require("rethinkdb");
const router = require("express").Router();
var path = require("path");
var shell = require("shelljs");


var formidable = require("formidable"),
  http = require("https"),
  util = require("util");

//     router.post('/upload2', function(req, res) {
//         upload(req,res,function(err){
// 			//console.log(req.file);
//             if(err){
//                  res.json({error_code:1,err_desc:err});
//                  return;
//             }
//              res.json({error_code:0,err_desc:null});
//         });
// });

router.post("/createsurveymaster", (request, response) => {
  //console.log('createsurveymaster: ' + request.body.objtosave );
  // var filename=request.body.filename;
  // var src=request.app.locals.rootfolder;
  // //console.log("src",src);
  // var realpath=path.resolve(src,'assets',filename);
  // //console.log("realpath=",realpath);
  // var b = new BSONI();
  // var data = fs.readFileSync(realpath);
  // //console.log("data", JSON.stringify(JSON.parse(data)));
  // var data2 = JSON.stringify(JSON.parse(data));
  // response.send(data2);
  let surveym = JSON.parse(request.body.objtosave);

  r.db("survey")
    .table("surveymaster")
    .insert(surveym)
    .run(request._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      response.send(result);
    })
    .catch(error => {
      response.send(error);
    });
});

router.post("/upload", (req, res) => {
  //console.log("Reached file upload");
  if (!req.files) return res.status(400).send("No files were uploaded.");

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  var src = req.app.locals.rootfolder;
  src = path.resolve(src, "assets");
  // src="F:\\ATULWORKS\\Truelancer\\Alpha\\rethinkdb_express-master\\rethinkdb_express-master\\assets\\";
  //console.log("File na eis "+sampleFile.name);
  //console.log(src);
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(src + "/" + sampleFile.name, function(err) {
    if (err) return res.status(500).send(err);

    res.send("File uploaded!");
  });
});

function sendMail(emailRec) {
  console.log("Sending Email to ", emailRec);

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
    to: emailRec, // list of receivers
    subject: "dAppbox creation failed", // Subject line
    // text: msgHeader + userReg.firstname + "," + msgContent // plain text body
    html:
      `

      <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Alert</title>
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
                  Failed to create dappbox
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
                <p style="margin: 0;">Attention,</p>
                <br />
                <p>
                  Our current cloud quota has been reached by too many users.
                  You will be alerted when the upgrade will be ready, we are
                  sorry for the inconvenience caused.
                </p>

                <br />
                Please contact us at 
                <a href="mailto:support@ixxo.io?Subject=dappbox%20creation%20failed" target="_top">ixxo support</a>
                  </td>
            </tr>
            <!-- start copy -->
            <tr>
              <td
                align="left"
                bgcolor="#ffffff"
                style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 16px; border-bottom: 3px solid #d4dadf"
              >
                <p style="margin: 0;">
                  Regards,<br />
                  iXXo Administrator
                </p>
              </td>
            </tr>
            <!-- end copy -->
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
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

     res.render('contact', { msg: 'Email has been sent' });
  });
  // response.send("Mail sent");
}


router.post("/dAppBox/create", function(req, res) {
  
  const user = JSON.parse(req.body.user);
  var recEmail=req.body.email;
  var flag= true;
  
  // console.log("email "+recEmail);
  console.log("Creating the dAppBox for user ", user);
  var command = `cd /root/ixxo_helm/terraform; ./run.sh ` + user + ``;
  //   var command = `cd /root/ixxo_helm/Ansible; ansible-playbook -i hosts --extra-vars='ansible_become_pass=1XXApass1' --extra-vars='date=`+user+`' plays/etherium.yml`
  //var command = `cd /root/Rockchain_Platform/terraform-aks-23oct2018;sudo az account get-access-token;sudo az acr helm repo add -n dappRegister;terraform workspace new `+user+`; terraform apply -input=false -auto-approve;`
  console.log(command);
  const child = shell.exec(command, { silent: true, async: true });
  child.stdout.on("data", function(data) {
    console.log("Program output:", data);
  });
  child.stderr.on("data", function(data) {
   if(flag){
    sendMail(recEmail);
    flag=false;
   } 
    console.log("Program Error:", data);
  });
  return res.status(200).send({ message: "dAppBox Creation in Progress" });
});

router.post("/dAppBox/delete", function(req, res) {

  const user = JSON.parse(req.body.user);
  console.log("Deleting the dAppBox for user ", JSON.stringify(user));

  var command = `cd /root/ixxo_helm/terraform; ./destroy.sh ` + user + ``;
  console.log(command);
  const child = shell.exec(command, { silent: true, async: true });
  child.stdout.on("data", function(data) {
    console.log("Program output:", data);

    let dataRec = data.match(/Destroy complete!/gi);
    console.log("match found " + dataRec);
    if (dataRec == "Destroy complete!") {
      var obj = JSON.parse('{"result":"success"}');
      res.send(obj);
    }
  });
  child.stderr.on("data", function(data) {
    console.log("Program Error:", data);
  });

  // return res.status(200).send({ message: "dAppBox Deletion in Progress" });
});

router.post("/fileupload/multiplefiles2", function(req, res) {
  //console.log("file=",req.body.name);
  var form = new formidable.IncomingForm();
  //console.log("formbytes: " , form);
  if (!req.body) {
    return res.status(400).send("No files were uploaded.");
  }

  req.body.mv("assets/" + req.body.name, function(err) {
    if (err) {
      //console.log(err);
    } else {
      //console.log("file uploadedreq.files[key].name");
    }
  });

  let filestosave = req.files.files;
  for (var key in req.body) {
    var thisfile = req.body[key];
    // //console.log("==========upload===");
    // //console.log("UPLOAD == "+JSON.stringify(thisfile));
    if (Array.isArray(thisfile)) {
      for (i = 0; i < thisfile.length; i++) {
        thisfile[i].mv("temp/" + thisfile[i].name, function(err) {
          if (err) {
            //console.log(err);
          } else {
            // //console.log("file uploaded"+thisfile[i].name);
          }
        });
      }
    } else {
      thisfile.mv("temp/" + req.files[key].name, function(err) {
        if (err) {
          //console.log(err);
        } else {
          //console.log("file uploaded"+req.files[key].name);
        }
      });
    }
  }
  return res.status(200).send("Send Successfully");
});

router.post("/fileupload/multiplefiles", function(req, res) {
  //console.log("File upload here body",req.body.objtosave);
  //console.log("File upload here body",JSON.stringify(req.body.files));

  if (!req.body) {
    return res.status(400).send("No files were uploaded.");
  }
  // //console.log(req.body.objtosave);
  //console.log("fileuplaod :-",req.body);
  let filestosave = req.body.files;
  var src = req.app.locals.rootfolder;
  var pathtoassets = path.resolve(src, "assets");

  for (var key in req.files) {
    var thisfile = req.files[key];

    // //console.log("==========upload===");
    // //console.log("UPLOAD == "+JSON.stringify(thisfile));
    if (Array.isArray(thisfile)) {
      for (i = 0; i < thisfile.length; i++) {
        thisfile[i].mv(pathtoassets + thisfile[i].name, function(err) {
          if (err) {
            //console.log(err);
          } else {
            // //console.log("file uploaded"+thisfile[i].name);
          }
        });
      }
    } else {
      thisfile.mv(pathtoassets + req.files[key].name, function(err) {
        if (err) {
          //console.log(err);
        } else {
          //console.log("file uploaded"+req.files[key].name);
        }
      });
    }
  }
  return res.status(200).send("Send Successfully");
});

module.exports = router;
