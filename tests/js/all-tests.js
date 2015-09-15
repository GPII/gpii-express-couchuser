"use strict";
var fluid = fluid || require("infusion");

var testFiles = [
    "./server-tests.js",
    "./zombie-tests.js"
];

var tasks = [];
testFiles.forEach(function (file) {
    tasks.push(function () {
            require(file);
        }
    );
});

fluid.promise.sequence(tasks).then(function () { console.log("Finished with all Zombie tests..."); });
