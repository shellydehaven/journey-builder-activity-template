"use strict";
var util = require("util");
var nforce = require("nforce");
var data = require("./data");

// Deps
const Path = require("path");
const JWT = require(Path.join(__dirname, "..", "lib", "jwtDecoder.js"));
var util = require("util");
var http = require("https");

exports.logExecuteData = [];

function logData(req) {
  exports.logExecuteData.push({
    body: req.body,
    headers: req.headers,
    trailers: req.trailers,
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    route: req.route,
    cookies: req.cookies,
    ip: req.ip,
    path: req.path,
    host: req.host,
    fresh: req.fresh,
    stale: req.stale,
    protocol: req.protocol,
    secure: req.secure,
    originalUrl: req.originalUrl
  });
  console.log("body: " + util.inspect(req.body));
  console.log("headers: " + req.headers);
  console.log("trailers: " + req.trailers);
  console.log("method: " + req.method);
  console.log("url: " + req.url);
  console.log("params: " + util.inspect(req.params));
  console.log("query: " + util.inspect(req.query));
  console.log("route: " + req.route);
  console.log("cookies: " + req.cookies);
  console.log("ip: " + req.ip);
  console.log("path: " + req.path);
  console.log("host: " + req.host);
  console.log("fresh: " + req.fresh);
  console.log("stale: " + req.stale);
  console.log("protocol: " + req.protocol);
  console.log("secure: " + req.secure);
  console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Edit");
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Save");
};

//let SF_USER_NAME = "rguptarakapil@us.imshealth.com";
//let SF_USER_PASSWORD = "Titan1@5";
let SF_USER_NAME = "oceadmin@ocemarketing2.com";
let SF_USER_PASSWORD = "OceSales12#";
let SF_TERRITORY_NAME = ";TM - SPC - Union City 20B06T14;"; // Rashi territory

const formatMessage = (message, ...rest) => {
  return rest.reduce((m, r, i) => {
    const regexp = new RegExp(`\\{\\{${i}\\}\\}`, "g");
    return m.replace(regexp, r);
  }, message);
};

const createNotification = (org, args) => {
  const contact = data[args.key];
  //const fullName = args.firstName + " " + args.lastName;
  const fullName = contact.firstName + " " + contact.lastName;

  var notification = nforce.createSObject("OCE__Notification__c");
  notification.set("Name", "Hackathon Notification");
  notification.set("OCE__ContextType__c", "Tab");
  notification.set("OCE__EntityType__c", "Home");
  notification.set("OCE__Territories__c", SF_TERRITORY_NAME);
  if (args.hasOwnProperty("ocenotifyTitle"))
    notification.set("OCE__Title__c", args.ocenotifyTitle);
  notification.set(
    "OCE__Message__c",
    formatMessage(args["ocenotifyMessage"], fullName)
  );
  notification.set("OCE__StartDate__c", "2019-10-30");

  org.insert({ sobject: notification }, err => {
    if (err) {
      console.error(err);
    } else {
      console.log("Notification Added!");
    }
  });
};

const sendNotification = args => {
  let org = nforce.createConnection({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    environment: "production",
    redirectUri: "http://localhost:3000/oauth/_callback",
    mode: "single",
    autoRefresh: true
  });

  org.authenticate(
    { username: SF_USER_NAME, password: SF_USER_PASSWORD },
    err => {
      if (err) {
        console.error("Salesforce authentication error");
        console.error(err);
      } else {
        console.log("Salesforce authentication successful");
        createNotification(org, args);
      }
    }
  );
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function(req, res) {
  // example on how to decode JWT
  JWT(req.body, process.env.jwtSecret, (err, decoded) => {
    // verification error -> unauthorized request
    if (err) {
      console.error(err);
      return res.status(401).end();
    }

    if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
      // decoded in arguments
      var decodedArgs = decoded.inArguments[0];

      sendNotification(decodedArgs);

      logData(req);
      res.send(200, "Execute");
    } else {
      console.error("inArguments invalid.");
      return res.status(400).end();
    }
  });
};

/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Publish");
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function(req, res) {
  // Data from the req and put it in an array accessible to the main app.
  //console.log( req.body );
  logData(req);
  res.send(200, "Validate");
};
