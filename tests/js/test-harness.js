// Configure a mail server, database server, and express instance for end-to-end tests
//
// You will need to instatiate this module from your tests and launch the servers that are created here using commands like:
//
// instance.express.listen(optionalCallback);
//
// instance.pouch.listen(optionalCallback);
//
// instance.smtp.listen(optionalCallback);
//
// Commonly, you will want to launch your tests from the callback of whichever of these you launch last.
"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");
var path       = require("path");

require("../../node_modules/gpii-express/src/js/express");
require("../../node_modules/gpii-express/src/js/router");
require("../../node_modules/gpii-express/src/js/static");
require("../../node_modules/gpii-express/src/js/middleware");
require("../../node_modules/gpii-express/src/js/json");
require("../../node_modules/gpii-express/src/js/urlencoded");
require("../../node_modules/gpii-express/src/js/cookieparser");
require("../../node_modules/gpii-express/src/js/session");
require("../../node_modules/gpii-handlebars/src/js/common/helper");
require("../../node_modules/gpii-handlebars/src/js/common/md-common");
require("../../node_modules/gpii-handlebars/src/js/common/jsonify");
require("../../node_modules/gpii-handlebars/src/js/server/dispatcher");
require("../../node_modules/gpii-handlebars/src/js/server/md-server");
require("../../node_modules/gpii-handlebars/src/js/server/handlebars");
require("../../node_modules/gpii-handlebars/src/js/server/inline");
require("../../node_modules/gpii-pouch/src/js/pouch");
require("../../node_modules/gpii-mail-test/src/js/mailserver");
require("../../node_modules/gpii-mail-test/src/js/simpleSmtpServer");

require("../../src/js/server");

fluid.registerNamespace("gpii.express.couchuser.tests.harness");

var bowerDir        = path.resolve(__dirname, "../../../bower_components");
var jsDir           = path.resolve(__dirname, "../../js");
var mailTemplateDir = path.resolve(__dirname, "../templates");
var modulesDir      = path.resolve(__dirname, "../../../node_modules");
var userDataFile    = path.resolve(__dirname, "../data/users/users.json");
var viewDir         = path.resolve(__dirname, "../views");


// TODO:  Figure out why our pouch instance doesn't work with express-couchuser, and change options.config.users in the express component below
// For now, we use our local couch instance directly.
fluid.defaults("gpii.express.couchuser.tests.harness", {
    gradeNames: ["fluid.standardRelayComponent", "autoInit"],
    members: {
        ready: false,
        started: false
    },
    events: {
        started: null
    },
    listeners: {
        "{express}.events.started": "{harness}.events.started.fire"
    },
    components: {
        "express": {
            "type": "gpii.express",
            "options": {
                "config": {
                    "express": {
                        "port" :   7533,
                        "baseUrl": "http://localhost:7533/",
                        "views":   viewDir,
                        "session": {
                            "secret": "Printer, printer take a hint-ter."
                        }
                    },
                    "app": {
                        "name": "GPII Express Couchuser Test Server",
                        "url": "http://localhost:7533/"
                    },
                    "users": "http://localhost:5984/_users",
                    request_defaults: {
                        auth: {
                            user: 'admin',
                            pass: 'admin'
                        }
                    },
                    "email":  {
                        "from": "no-reply@ul.gpii.net",
                        "service": "SMTP",
                        "SMTP": {
                            "host": "localhost",
                            "port": 4025
                        },
                        "templateDir": mailTemplateDir
                    },
                    "verify": true,
                    "safeUserFields": "name email displayName",
                    "adminRoles": [ "admin"]
                },
                components: {
                    "json": {
                        "type": "gpii.express.middleware.bodyparser.json"
                    },
                    "urlencoded": {
                        "type": "gpii.express.middleware.bodyparser.urlencoded"
                    },
                    "cookieparser": {
                        "type": "gpii.express.middleware.cookieparser"
                    },
                    "session": {
                        "type": "gpii.express.middleware.session"
                    },
                    "user": {
                        "type": "gpii.express.couchuser.server"
                    },
                    "modules": {
                        "type":  "gpii.express.router.static",
                        "options": {
                            path:    "/modules",
                            content: modulesDir
                        }
                    },
                    "js": {
                        "type":  "gpii.express.router.static",
                        "options": {
                            path:    "/js",
                            content: jsDir
                        }
                    },
                    "bc": {
                        "type":  "gpii.express.router.static",
                        "options": {
                            path:    "/bc",
                            content: bowerDir
                        }
                    },
                    handlebars: {
                        type: "gpii.express.hb"
                    },
                    content: {
                        type: "gpii.express.hb.dispatcher",
                        "options": {
                            path:    "/content"
                        }
                    },
                    inline: {
                        type: "gpii.express.hb.inline",
                        "options": {
                            "path": "/hbs"
                        }
                    }
                }
            }
        },
        // TODO:  Reenable once we get pouch working with express-couchuser
        //"pouch": {
        //    "type": "gpii.express",
        //    "options": {
        //        "config": {
        //            "express": {
        //                "port" :   7534,
        //                "baseUrl": "http://localhost:7534/"
        //            },
        //            "app": {
        //                "name": "Pouch Test Server",
        //                "url": "http://localhost:7534/"
        //            }
        //        },
        //        components: {
        //            "pouch": {
        //                "type": "gpii.pouch",
        //                "options": {
        //                    "path": "/",
        //                    "model": {
        //                        "databases": {
        //                            "_users": {
        //                                "data": userDataFile
        //                            }
        //                        }
        //                    }
        //                }
        //            }
        //        }
        //    }
        //},
        "smtp": {
            "type": "gpii.test.mail.smtp",
            "options": {
                "config": {
                    "port": 4025
                }
            }
        }
    }
});