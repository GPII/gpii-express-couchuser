// Encapsulate the express-user-couchdb calls in their own module for cleaner testing and possible replacement with another solution
//
// NOTE: Because the library is hard-coded to use /api/user relative to the including context, this module should be included from the root of the express instance
//
// NOTE 2: This module must be treated like middleware because it has not been updated to play nicely with express 4.x (and its routers).
// 1. If you use the path it needs ("/"), it will clobber all other routers.
// 2. If you use the path is should use ("/api/user"), it will not show up in the right place.

"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.couchuser.server");

gpii.express.couchuser.server.init = function (that) {
    that.options.router = require("express-user-couchdb")(that.options.config);
};

// We have to act very oddly to avoid problems cause by the express 3.x ness of this module
// We are middleware, but expose a router object
gpii.express.couchuser.server.getMiddlewareFunction = function(that) {
    return that.options.router;
};

fluid.defaults("gpii.express.couchuser.server", {
    gradeNames: ["gpii.express.middleware", "autoInit"],
    components: {
        json: {
            type: "gpii.express.middleware.bodyparser.json"
        },
        urlencoded: {
            type: "gpii.express.middleware.bodyparser.urlencoded"
        },
        cookieparser: {
            type: "gpii.express.middleware.cookieparser"
        },
        session: {
            type: "gpii.express.middleware.session"
        }
    },
    path:    "/api/user",
    "invokers": {
        "getMiddlewareFunction": {
            "funcName": "gpii.express.couchuser.server.getMiddlewareFunction",
            "args": ["{that}"]
        }
    },
    listeners: {
        onCreate: {
            "funcName": "gpii.express.couchuser.server.init",
            "args": ["{that}"]
        }
    }
});