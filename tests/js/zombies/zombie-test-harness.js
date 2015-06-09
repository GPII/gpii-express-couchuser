// Configure a mail server, database server, and express instance for end-to-end tests
//
// Commonly, you will want to launch your tests from the callback of whichever of these you launch last.
"use strict";
var fluid      = fluid || require("infusion");
var path       = require("path");

require("gpii-express");
require("gpii-handlebars");

require("gpii-pouch");
require("gpii-mail-test");

require("../../../src/js/server");

fluid.registerNamespace("gpii.express.couchuser.tests.harness");

var bowerDir        = path.resolve(__dirname, "../../../bower_components");
var srcDir          = path.resolve(__dirname, "../../../src");
var mailTemplateDir = path.resolve(__dirname, "../../templates");
var modulesDir      = path.resolve(__dirname, "../../../node_modules");
var userDataFile    = path.resolve(__dirname, "../../data/users/users.json");
var viewDir         = path.resolve(__dirname, "../../views");


fluid.defaults("gpii.express.couchuser.tests.harness", {
    gradeNames: ["fluid.standardRelayComponent", "autoInit"],
    expressPort: 7633,
    baseUrl:     "http://localhost:7633",
    pouchPort:   7634,
    pouchUrl:    "http://localhost:7634/",
    usersUrl:    "http://localhost:7634/_users",
    smtpPort:    4081,
    members: {
        ready: false,
        onReady: false
    },
    events: {
        expressStarted:  null,
        pouchStarted:    null,
        smtpReady:       null,
        onReady: {
            events: {
                expressStarted: "expressStarted",
                //pouchStarted:   "{pouch}.events.onStarted",
                smtpReady:      "smtpReady"
            }
        }
    },
    components: {
        express: {
            type: "gpii.express",
            options: {
                listeners: {
                    onStarted: "{harness}.events.expressStarted.fire"
                },
                config: {
                    express: {
                        port :   "{harness}.options.expressPort",
                        baseUrl: "{harness}.options.baseUrl",
                        views:   viewDir,
                        session: {
                            secret: "Printer, printer take a hint-ter."
                        }
                    },
                    app: {
                        name: "GPII Express Couchuser Test Server",
                        url:  "{harness}.options.baseUrl"
                    },
                    users: "{harness}.options.usersUrl",
                    request_defaults: {
                        auth: {
                            user: "admin",
                            pass: "admin"
                        }
                    },
                    email:  {
                        from: "no-reply@ul.gpii.net",
                        service: "SMTP",
                        SMTP: {
                            host: "localhost",
                            port: "{harness}.options.smtpPort"
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
                            path:    "/",
                            content: srcDir
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
                    },
                    // For some reason, we need to load "user" relatively late so that all the middleware upstream (notably body parsing) is in place
                    user: {
                        type: "gpii.express.couchuser.server"
                    }
                }
            }
        },
        smtp: {
            type: "gpii.test.mail.smtp",
            options: {
                port: "{harness}.options.smtpPort",
                listeners: {
                    "ready": "{harness}.events.smtpReady.fire"
                }
            }
        },
        pouch: {
            type: "gpii.express",
            options: {
                listeners: {
                    "onStarted": "{harness}.events.pouchStarted.fire"
                },
                config: {
                    express: {
                        "port" : "{harness}.options.pouchPort",
                        baseUrl: "{harness}.options.pouchUrl"
                    },
                    app: {
                        name: "Pouch Test Server",
                        url:  "{harness}.options.pouchUrl"
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
        }
    }
});