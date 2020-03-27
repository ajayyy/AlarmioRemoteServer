var express = require("express");
var http = require("http");
var fs = require("fs");

let config = JSON.parse(fs.readFileSync("config.json"));

let allowedAlarms = {};

var app = express();
app.set('env', 'production');

http.createServer(app).listen(config.port);

app.get("/api/v1/allowAlarmDismiss/:authCode/", function (req, res) {
    let authCode = req.params.authCode;

    res.send(JSON.stringify(Date.now() < allowedAlarms[authCode]));
});

app.post("/api/v1/allowAlarmDismiss/:authCode/:time?", function (req, res) {
    let authCode = req.params.authCode;
    let time = req.params.time || 5;

    let newExpirationTime = Date.now() + time * 60 * 1000;

    if (!allowedAlarms[authCode] || allowedAlarms[authCode] < newExpirationTime) {
        allowedAlarms[authCode] = newExpirationTime;

        // Delete data when needed
        setTimeout(function() {
            if (allowedAlarms[authCode] !== undefined && 
                    allowedAlarms[authCode] === newExpirationTime) {

                delete allowedAlarms[authCode];
            }
        }, time * 60 * 1000);
    }

    res.sendStatus(200);
});

app.post("/api/v1/denyAlarmDismiss/:authCode/", function (req, res) {
    let authCode = req.params.authCode;

    if (allowedAlarms[authCode] !== undefined) {
        delete allowedAlarms[authCode];
    }

    res.sendStatus(200);
});