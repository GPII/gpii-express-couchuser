// Launch the test harness as a standalone server.
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");


require("./zombie-test-harness.js");

fluid.setLogging(true);
gpii.express.couchuser.tests.harness({
    expressPort: 7523,
    baseUrl:     "http://localhost:7523/",
    pouchPort:   7524,
    pouchUrl:    "http://localhost:7524/",
    usersUrl:    "http://localhost:7524/_users",
    smtpPort:    4062
});