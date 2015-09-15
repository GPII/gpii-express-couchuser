// Test all user management functions using only a browser (and something to receive emails).
//
// There is some overlap between these and the server-tests.js, a test that fails in both is likely broken on the server side, a test that only fails here is likely broken in the client-facing code.

"use strict";
var fluid = fluid || require("infusion");

// TODO:  When these are run together, there are errors which do not occur when they are run separately. Investigate.
var scripts = [
    "./zombies/zombie-login.js",
    "./zombies/zombie-signup.js",
    "./zombies/zombie-forgot.js"
];

var tasks = [];
scripts.forEach(function (script) {
    tasks.push(function () {
        require(script);
    });
});

fluid.promise.sequence(tasks);
