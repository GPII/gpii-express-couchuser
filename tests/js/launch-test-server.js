// A convenience script to allow you to launch a test server without running tests.  Useful in troubleshooting client-side javascript in-browser.
"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");

require("./zombies/zombie-test-harness.js");
gpii.express.couchuser.tests.harness({});