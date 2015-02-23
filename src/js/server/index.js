// Encapsulate the express-user-couchdb calls in their own module for cleaner testing and possible replacement with another solution
//
// NOTE: Because the library is hard-coded to use /api/user relative to the including context, this module should be included from the root of the express instance
"use strict";
var fluid = fluid || require("infusion");
var gpii  = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.couchuser.server");

gpii.express.couchuser.server.addRoutesPrivate = function(that) {
    if (!that.options.config) {
        console.error("Can't continue without a working configuration object.");
        return;
    }

    if (!that.options.router) {
        console.error("Can't continue without a working router.");
        return;
    }

    if (!that.options.config.email) {
        console.error("You have not configured any mail settings, express-couchuser will probably not work as you expect.")
    }

    var expressUserCouchdb = require("express-user-couchdb")(that.options.config);
    that.options.express.use("/", expressUserCouchdb);

    // TODO:  When express user couchdb works better with routers, switch to this instead of using express directly.
    //that.model.router.use("/", expressUserCouchdb);
};

// A local wrapper to give us more control over the conversation before and after passing to express-couchuser.
// Notably, we can add warnings if required middleware is not found.
gpii.express.couchuser.server.localWrapperPrivate = function(that, req, res, next) {
    if (!that.expressCouchUserRouter) {
        that.expressCouchUserRouter = require("express-user-couchdb")(that.options.config);
    }

    if (!req.body) {
        console.error("Body parsing is not enabled, user management will likely not function as expected.");
    }

    if (!req.cookies) {
        console.error("Cookie parsing is not enabled, user management will likely not function as expected.");
    }

    if (!req.session) {
        console.error("Sessions are not enabled, user management will likely not function as expected.");
    }

    // We have to manually call the "next" function ourselves after express-couchuser finishes its work.
    that.expressCouchUserRouter(req, res, next);
};

fluid.defaults("gpii.express.couchuser.server", {
    gradeNames: ["fluid.modelRelayComponent", "gpii.express.router", "autoInit"],
    path:    "/",
    express: "{gpii.express}.options.express",
    router:  null,
    events: {
        addRoutes: null
    },
    invokers: {
        "localWrapper": {
            "funcName": "gpii.express.couchuser.server.localWrapperPrivate",
            "args": [ "{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
        }
    },
    listeners: {
        "addRoutes": {
            funcName: "gpii.express.couchuser.server.addRoutesPrivate",
            args: ["{that}"]
        }
    }
});