// A test script to assist in figuring out why express-couchuser doesn't work with pouch
// TODO:  Figure out how to debug this properly from within WebStorm

// Configure a testEnvironment with an express server, pouch instance, and outgoing mail server.
"use strict";
var fluid = fluid || require("infusion");
var path = require("path");

require("gpii-express");
require("gpii-handlebars");

require("gpii-pouch");
require("gpii-mail-test");

require("../../src/js/server");

// We use just the request-handling bits of the kettle stack in our tests, but we include the whole thing to pick up the base grades
//require("../../node_modules/kettle");
//require("../../node_modules/kettle/lib/test/KettleTestUtils");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.express.couchuser.tests.pouch.testEnvironment");

var bowerDir = path.resolve(__dirname, "../../bower_components");
var jsDir = path.resolve(__dirname, "../../src/js");
var mailTemplateDir = path.resolve(__dirname, "../templates");
var modulesDir = path.resolve(__dirname, "../../node_modules");

var userDataFile = path.resolve(__dirname, "../data/users/users.json");
var viewDir = path.resolve(__dirname, "../views");

fluid.defaults("gpii.express.couchuser.tests.pouch.testEnvironment", {
    //gradeNames: ["fluid.test.testEnvironment", "autoInit"],
    gradeNames: ["fluid.standardRelayComponent", "autoInit"],
    port: 7532,
    baseUrl: "http://localhost/",
    components: {
        express: {
            type: "gpii.express",
            //createOnEvent: "constructServer",
            options: {
                listeners: {
                    onReady: "{testEnvironment}.events.expressStarted.fire"
                },
                config: {
                    express: {
                        port: "{testEnvironment}.options.port",
                        baseUrl: "{testEnvironment}.options.baseUrl",
                        views: viewDir,
                        session: {
                            secret: "Printer, printer take a hint-ter."
                        }
                    },
                    app: {
                        name: "GPII Express Couchuser Test Server",
                        url: "{testEnvironment}.options.baseUrl"
                    },
                    users: "http://localhost:7534/_users",
                    request_defaults: {
                        auth: {
                            user: "admin",
                            pass: "admin"
                        }
                    },
                    email: {
                        from: "no-reply@ul.gpii.net",
                        service: "SMTP",
                        SMTP: {
                            host: "localhost",
                            port: 4029
                        },
                        templateDir: mailTemplateDir
                    },
                    verify: true,
                    safeUserFields: "name email displayName",
                    adminRoles: ["admin"]
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
                        type: "gpii.express.router.static",
                        options: {
                            path: "/modules",
                            content: modulesDir
                        }
                    },
                    js: {
                        type: "gpii.express.router.static",
                        options: {
                            path: "/js",
                            content: jsDir
                        }
                    },
                    bc: {
                        type: "gpii.express.router.static",
                        options: {
                            path: "/bc",
                            content: bowerDir
                        }
                    },
                    handlebars: {
                        type: "gpii.express.hb"
                    },
                    content: {
                        type: "gpii.express.hb.dispatcher",
                        options: {
                            path: "/content/:template"
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
                    onReady: "{testEnvironment}.events.pouchStarted.fire"
                },
                config: {
                    express: {
                        port: 7534,
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
                            model: {
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
        },
        smtp: {
            type: "gpii.test.mail.smtp",
            //createOnEvent: "constructServer",
            options: {
                listeners: {
                    ready: "{testEnvironment}.events.smtpStarted.fire"
                },
                config: {
                    port: 4029
                }
            }
        }
        //,
        //testCaseHolder: {
        //    type: "gpii.express.couchuser.test.server.caseHolder"
        //}
    },
    events: {
        constructServer: null,
        messageReceived: null,
        expressStarted: null,
        pouchStarted: null,
        smtpStarted: null,
        onReady: {
            events: {
                expressStarted: "expressStarted",
                pouchStarted: "{pouch}.events.onStarted",
                smtpStarted: "smtpStarted"
            }
        }
    }
});

gpii.express.couchuser.tests.pouch.testEnvironment({});
