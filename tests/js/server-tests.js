// Test the couchuser APIs to ensure that all of our modules that wrap the library are working correctly.
//
// Although there are some similarities in the server setup and mail testing, these tests do not touch the client modules, and access the APIs directly.
//
// For browser tests, check out zombie-tests.js

"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");

require("./server-test-caseholder.js");
require("./server-test-environment.js");

gpii.express.couchuser.tests.server.environment({});


