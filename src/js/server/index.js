// Encapsulate the express-user-couchdb calls in their own module for cleaner testing and possible replacement with another solution
//
// NOTE: Because the library is hard-coded to use /api/user relative to the including context, this module should be included from the root of the express instance
//
// NOTE 2: This module must be treated like middleware because it has not been updated to play nicely with express 4.x (and its routers).

"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.couchuser.server");

gpii.express.couchuser.server.getMiddlewareFunction = function(that) {
    if (!that.expressCouchUserRouter) {
        that.expressCouchUserRouter = require("express-user-couchdb")(that.options.config);
    }

    return that.expressCouchUserRouter;
};

fluid.defaults("gpii.express.couchuser.server", {
    gradeNames: ["gpii.express.middleware", "autoInit"],
    path:    "/",
    "invokers": {
        "getMiddlewareFunction": {
            "funcName": "gpii.express.couchuser.server.getMiddlewareFunction",
            "args": ["{that}"]
        }
    }
});