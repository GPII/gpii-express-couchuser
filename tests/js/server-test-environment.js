// Configure a testEnvironment with an express server, pouch instance (coming soon), and outgoing mail server.
"use strict";
var fluid      = fluid || require("infusion");
var path       = require("path");

require("gpii-express");
require("gpii-handlebars");

require("../../node_modules/gpii-pouch/src/js/pouch");
require("gpii-mail-test");

require("../../src/js/server");

// We use just the request-handling bits of the kettle stack in our tests, but we include the whole thing to pick up the base grades
require("../../node_modules/kettle");
require("../../node_modules/kettle/lib/test/KettleTestUtils");

fluid.registerNamespace("gpii.express.couchuser.tests.server.environment");

var bowerDir        = path.resolve(__dirname, "../../../bower_components");
var jsDir           = path.resolve(__dirname, "../../js");
var mailTemplateDir = path.resolve(__dirname, "../templates");
var modulesDir      = path.resolve(__dirname, "../../../node_modules");

var userDataFile    = path.resolve(__dirname, "../data/users/users.json");
var viewDir         = path.resolve(__dirname, "../views");

fluid.defaults("gpii.express.couchuser.tests.server.environment", {
    gradeNames: ["fluid.test.testEnvironment", "autoInit"],
    port:   7532,
    smtpPort: 4029,
    pouchPort: 7534,
    baseUrl: "http://localhost/",
    components: {
        express: {
            type: "gpii.express",
            createOnEvent: "constructServer",
            options: {
                listeners: {
                    onStarted: "{testEnvironment}.events.expressStarted.fire"
                },
                config: {
                    express: {
                        port :   "{testEnvironment}.options.port",
                        baseUrl: "{testEnvironment}.options.baseUrl",
                        views:   viewDir,
                        session: {
                            secret: "Printer, printer take a hint-ter."
                        }
                    },
                    app: {
                        name: "GPII Express Couchuser Test Server",
                        url:  "{testEnvironment}.options.baseUrl"
                    },
                    users: "http://localhost:7534/_users",
                    //users: "http://localhost:5984/_users", // Use Couchdb for now
                    //request_defaults: {
                    //    auth: {
                    //        user: "admin",
                    //        pass: "admin"
                    //    }
                    //},
                    email:  {
                        from: "no-reply@ul.gpii.net",
                        service: "SMTP",
                        SMTP: {
                            host: "localhost",
                            port: "{testEnvironment}.options.smtpPort"
                        },
                        templateDir: mailTemplateDir
                    },
                    verify: true,
                    safeUserFields: "name email displayName",
                    adminRoles: [ "admin"]
                },
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
                    },
                    user: {
                        type: "gpii.express.couchuser.server"
                    },
                    modules: {
                        type:  "gpii.express.router.static",
                        options: {
                            path:    "/modules",
                            content: modulesDir
                        }
                    },
                    js: {
                        type:  "gpii.express.router.static",
                        options: {
                            path:    "/js",
                            content: jsDir
                        }
                    },
                    bc: {
                        type:  "gpii.express.router.static",
                        options: {
                            path:    "/bc",
                            content: bowerDir
                        }
                    },
                    handlebars: {
                        type: "gpii.express.hb"
                    },
                    content: {
                        type: "gpii.express.hb.dispatcher",
                        options: {
                            path:    "/content/:template"
                        }
                    },
                    inline: {
                        type: "gpii.express.hb.inline",
                        options: {
                            path: "/hbs"
                        }
                    }
                }
            }
        },
        pouch: {
            type: "gpii.express",
            options: {
                listeners: {
                    "onStarted": "{testEnvironment}.events.pouchStarted.fire"
                },
                config: {
                    express: {
                        "port" :   7534,
                        baseUrl: "http://localhost:7534/"
                    },
                    app: {
                        name: "Pouch Test Server",
                        url: "http://localhost:7534/"
                    }
                },
                components: {
                    pouch: {
                        type: "gpii.pouch",
                        options: {
                            path: "/",
                            databases: {
                                _users: {
                                    data: userDataFile
                                }
                            }
                        }
                    }
                }
            }
        },
        smtp: {
            type: "gpii.test.mail.smtp",
            createOnEvent: "constructServer",
            options: {
                listeners: {
                    "ready": "{testEnvironment}.events.smtpReady.fire"
                },
                port: "{testEnvironment}.options.smtpPort"
            }
        },
        testCaseHolder: {
            type: "gpii.express.couchuser.test.server.caseHolder"
        }
    },
    events: {
        constructServer: null,
        messageReceived: null,
        expressStarted:  null,
        pouchStarted:    null,
        smtpReady:       null,
        onReady: {
            events: {
                expressStarted: "expressStarted",
                smtpReady:      "smtpReady"
            }
        }
    }
});
