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
    that.options.router = require("express-user-couchdb")(that.options);

    if (that.options.views) {
        // Fix the monkey business that couchuser performs on the view directory location in express.
        that.options.router.set("views", that.options.views);
    }
};

// We have to act very oddly to avoid problems cause by the express 3.x ness of this module
// We are middleware, but expose a router object
gpii.express.couchuser.server.middleware = function (that, req, res, next) {
    that.options.router(req, res, next);
};

fluid.defaults("gpii.express.couchuser.server", {
    gradeNames: ["gpii.express.middleware"],
    "verify":         true,
    "safeUserFields": "name email displayName",
    "adminRoles":     [ "admin"],
    "views":          "{expressConfigHolder}.options.config.express.views",
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
        "middleware": {
            "funcName": "gpii.express.couchuser.server.middleware",
            "args":    ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    },
    listeners: {
        onCreate: {
            "funcName": "gpii.express.couchuser.server.init",
            "args": ["{that}"]
        }
    }
});