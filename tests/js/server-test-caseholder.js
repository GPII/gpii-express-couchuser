/* Tests for the "express" and "router" module */
"use strict";

// We use just the request-handling bits of the kettle stack in our tests, but we include the whole thing to pick up the base grades
require("../../node_modules/kettle");
require("../../node_modules/kettle/lib/test/KettleTestUtils");

var fluid        = fluid || require("infusion");
var gpii         = fluid.registerNamespace("gpii");
var jqUnit       = require("jqUnit");
var fs           = require("fs");

fluid.registerNamespace("gpii.express.couchuser.test.server.caseHolder");

fluid.setLogging(true);

// A common function to confirm that the response sent by the server meets our standards.
gpii.express.couchuser.test.server.caseHolder.isSaneResponse = function (response, body, statusCode) {
    statusCode = statusCode ? statusCode : 200;

    jqUnit.assertEquals("The response should have a reasonable status code", statusCode, response.statusCode);
    if (response.statusCode !== statusCode) {
        console.log(JSON.stringify(body, null, 2));
    }

    jqUnit.assertValue("There should be a body.", body);
};

// An expander to put together a base URL and relative path
gpii.express.couchuser.test.server.caseHolder.assembleUrl = function(baseUrl, path) {
    var fullPath;
    // We have to be careful of double slashes (or no slashes)
    if (baseUrl[baseUrl.length -1] === "/" && path[0] === "/") {
        fullPath = baseUrl + path.substring(1);
    }
    else if (baseUrl[baseUrl.length -1] !== "/" && path[0] !== "/") {
        fullPath = baseUrl + "/" + path;
    }
    else {
        fullPath = baseUrl + path;
    }
    return fullPath;
};

// An expander to generate a new username every time
gpii.express.couchuser.test.server.caseHolder.generateUser = function () {
    var timestamp = (new Date()).getTime();
    return {
        name:     "user-" + timestamp,
        password: "user-" + timestamp,
        email:    "user-" + timestamp + "@localhost",
        roles:    []
    };
};

// An expander to generate a new password so that we can confirm that the password reset function actually works more than once.
gpii.express.couchuser.test.server.caseHolder.generatePassword = function () {
    var timestamp = (new Date()).getTime();
    return "password-" + timestamp;
};

// Each test has a function that is called when its request is issued.
gpii.express.couchuser.test.server.caseHolder.verifyLoggedIn = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body);

    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
    jqUnit.assertNotNull("There should be a user returned.", data.user);
    if (data.user) {
        jqUnit.assertEquals("The current user should be returned.", "admin", data.user.name);
    }
};

gpii.express.couchuser.test.server.caseHolder.verifyCurrentUserLoggedIn = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body);

    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
    jqUnit.assertNotNull("There should be a user returned.", data.user);
    if (data.user) {
        jqUnit.assertEquals("The current user should be returned.", "admin", data.user.name);
    }
};

gpii.express.couchuser.test.server.caseHolder.verifyLoggedOut = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body);

    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
    jqUnit.assertNotNull("There should be a user returned.", data.user);
    if (data.user) {
        jqUnit.assertEquals("The current user should be returned.", "admin", data.user.name);
    }
};

gpii.express.couchuser.test.server.caseHolder.verifyCurrentUserLoggedOut = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 401);

    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
    jqUnit.assertUndefined("There should not be a user returned.", data.user);
};


gpii.express.couchuser.test.server.caseHolder.verifyFailedLogin = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 500);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
    jqUnit.assertUndefined("There should not be a user returned.", data.user);
};

gpii.express.couchuser.test.server.caseHolder.verifyUnverifiedLogin = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 401);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
    jqUnit.assertUndefined("There should not be a user returned.", data.user);
};

gpii.express.couchuser.test.server.caseHolder.verifyDuplicateEmailBlocked = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 400);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
};

gpii.express.couchuser.test.server.caseHolder.verifyIncompleteSignupBlocked = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 400);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
};

gpii.express.couchuser.test.server.caseHolder.verifyBogusVerificationCodeBlocked = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 400);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
};

gpii.express.couchuser.test.server.caseHolder.verifyBogusResetCodeBlocked = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 500);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
};

// Verify that the signup was successful
gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyInitialResponse = function(signupRequest, response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 200);
};

// Listen for the email with the verification code and launch the verification request
gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyEmail = function(signupRequest, verificationRequest, testEnvironment) {
    var content = fs.readFileSync(testEnvironment.smtp.mailServer.options.messageFile);

    var MailParser = require("mailparser").MailParser,
        mailparser = new MailParser();

    // If this gets any deeper, refactor to use a separate function
    mailparser.on("end", function(mailObject){
        var content = mailObject.text;
        var verificationCodeRegexp = new RegExp("content/verify[?]code=([a-z0-9-]+)", "i");
        var matches = content.toString().match(verificationCodeRegexp);

        jqUnit.assertNotNull("There should be a verification code in the email sent to the user.", matches);

        if (matches) {
            signupRequest.code = matches[1];
            var path = "/api/user/verify/" + signupRequest.code;

            // I can't fix this with the model, so I have to override it completely
            verificationRequest.options.path = path;
            verificationRequest.send();
        }
    });

    mailparser.write(content);
    mailparser.end();
};

// Listen for the results of hitting the verification link
gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyVerificationLink = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 200);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
};

// Listen for the results of logging in with our verified acount
gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyLogin = function(signupRequest, response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 200);

    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
    jqUnit.assertNotUndefined("There should be a user returned.", data.user);
};

// Verify that a password reset request is successful
gpii.express.couchuser.test.server.caseHolder.fullResetVerifyInitialResponse = function(resetRequest, response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 200);
};

// Listen for the email with the verification code and launch the verification request
gpii.express.couchuser.test.server.caseHolder.fullResetVerifyEmail = function(forgotRequest, resetRequest, testEnvironment) {
    var content = fs.readFileSync(testEnvironment.smtp.mailServer.options.messageFile);

    var MailParser = require("mailparser").MailParser,
        mailparser = new MailParser();

    // If this gets any deeper, refactor to use a separate function
    mailparser.on("end", function(mailObject){
        var content = mailObject.text;
        var resetCodeRegexp = new RegExp("content/reset[?]code=([a-z0-9-]+)", "i");
        var matches = content.toString().match(resetCodeRegexp);

        jqUnit.assertNotNull("There should be a reset code in the email sent to the user.", matches);

        if (matches) {
            forgotRequest.code = matches[1];
            resetRequest.send({code: forgotRequest.code, password: forgotRequest.options.user.password });
        }
    });

    mailparser.write(content);
    mailparser.end();
};

// Listen for the results of hitting the reset link
gpii.express.couchuser.test.server.caseHolder.fullResetVerifyResetLink = function(response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 200);
    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
};

// Listen for the results of logging in with our verified acount
gpii.express.couchuser.test.server.caseHolder.fullResetVerifyLogin = function(forgotRequest, response, body) {
    gpii.express.couchuser.test.server.caseHolder.isSaneResponse(response, body, 200);

    var data = typeof body === "string" ? JSON.parse(body) : body;
    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
    jqUnit.assertNotUndefined("There should be a user returned.", data.user);
};

// Each test has a request instance of `kettle.test.request.http` or `kettle.test.request.httpCookie`, and a test module that wires the request to the listener that handles its results.
fluid.defaults("gpii.express.couchuser.test.server.caseHolder", {
    gradeNames: ["autoInit", "fluid.test.testCaseHolder"],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        loginRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signin"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        currentUserLoggedInRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/current"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "GET"
            }
        },
        logoutRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signout"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        currentUserLoggedOutRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/current"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "GET"
            }
        },
        bogusLoginRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signin"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        unverifiedLoginRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signin"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        duplicateUserCreateRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signup"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        incompleteUserCreateRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signup"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        bogusVerificationRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args: ["{testEnvironment}.options.baseUrl", "api/user/verify/xxxxxxxxxx"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "GET"
            }
        },
        bogusResetRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args: ["{testEnvironment}.options.baseUrl", "api/user/reset"]
                    }
                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        fullSignupInitialRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signup"]
                    }

                },
                user: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.generateUser"
                    }
                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        fullSignupVerifyVerificationRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                port: "{testEnvironment}.options.port",
                method: "GET"
            }
        },
        fullSignupLoginRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signin"]
                    }

                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        fullResetForgotRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/forgot"]
                    }

                },
                user: {
                    name:     "reset",
                    password: {
                        expander: {
                            funcName: "gpii.express.couchuser.test.server.caseHolder.generatePassword"
                        }
                    },
                    email:    "reset@localhost"
                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        fullResetVerifyResetRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/reset"]
                    }
                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        },
        fullResetLoginRequest: {
            type: "kettle.test.request.httpCookie",
            options: {
                path: {
                    expander: {
                        funcName: "gpii.express.couchuser.test.server.caseHolder.assembleUrl",
                        args:     ["{testEnvironment}.options.baseUrl", "api/user/signin"]
                    }
                },
                port: "{testEnvironment}.options.port",
                method: "POST"
            }
        }
    },
    modules: [
        {
            tests: [
                {
                    name: "Testing full login/logout cycle...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{loginRequest}.send",
                            args: [{ name: "admin", password: "admin" }]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyLoggedIn",
                            event: "{loginRequest}.events.onComplete",
                            args: ["{loginRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            func: "{currentUserLoggedInRequest}.send",
                            args: [{ name: "admin", password: "admin" }]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyCurrentUserLoggedIn",
                            event: "{currentUserLoggedInRequest}.events.onComplete",
                            args: ["{currentUserLoggedInRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            func: "{logoutRequest}.send"
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyLoggedOut",
                            event: "{logoutRequest}.events.onComplete",
                            args: ["{logoutRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            func: "{currentUserLoggedOutRequest}.send"
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyCurrentUserLoggedOut",
                            event: "{currentUserLoggedOutRequest}.events.onComplete",
                            args: ["{currentUserLoggedOutRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing logging in with a bogus username/password...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{bogusLoginRequest}.send",
                            args: [{ name: "bogus", password: "bogus" }]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyFailedLogin",
                            event: "{bogusLoginRequest}.events.onComplete",
                            args: ["{bogusLoginRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing logging in with an unverified account...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{unverifiedLoginRequest}.send",
                            args: [{ name: "unverified", password: "unverified" }]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyUnverifiedLogin",
                            event: "{unverifiedLoginRequest}.events.onComplete",
                            args: ["{unverifiedLoginRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing creating an account with the same email address as an existing account...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{duplicateUserCreateRequest}.send",
                            args: [{ name: "new", password: "new", email: "duhrer@localhost", roles: [] }]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyDuplicateEmailBlocked",
                            event: "{duplicateUserCreateRequest}.events.onComplete",
                            args: ["{duplicateUserCreateRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing creating an account without providing the required information...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{incompleteUserCreateRequest}.send",
                            args: [{}]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyIncompleteSignupBlocked",
                            event: "{incompleteUserCreateRequest}.events.onComplete",
                            args: ["{incompleteUserCreateRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing verifying a user with a bogus verification code...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{bogusVerificationRequest}.send",
                            args: [{}]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyBogusVerificationCodeBlocked",
                            event: "{bogusVerificationRequest}.events.onComplete",
                            args: ["{bogusVerificationRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing resetting a user's password with a bogus reset code...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{bogusResetRequest}.send",
                            args: [{ code: "utter-nonsense-which-should-never-work", password: "something" }]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.verifyBogusResetCodeBlocked",
                            event: "{bogusResetRequest}.events.onComplete",
                            args: ["{bogusResetRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing creating a user, end-to-end...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{fullSignupInitialRequest}.send",
                            args: [ "{fullSignupInitialRequest}.options.user" ]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyInitialResponse",
                            event: "{fullSignupInitialRequest}.events.onComplete",
                            args: ["{fullSignupInitialRequest}", "{fullSignupInitialRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyEmail",
                            event: "{testEnvironment}.smtp.events.messageReceived",
                            args: ["{fullSignupInitialRequest}", "{fullSignupVerifyVerificationRequest}", "{testEnvironment}"]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyVerificationLink",
                            event: "{fullSignupVerifyVerificationRequest}.events.onComplete",
                            args: ["{fullSignupVerifyVerificationRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            func: "{fullSignupLoginRequest}.send",
                            args: [{ name: "{fullSignupInitialRequest}.options.user.name", password: "{fullSignupInitialRequest}.options.user.password" }]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.fullSignupVerifyLogin",
                            event: "{fullSignupLoginRequest}.events.onComplete",
                            args: ["{fullSignupInitialRequest}", "{fullSignupLoginRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing resetting a user's password, end-to-end...",
                    type: "test",
                    sequence: [
                        { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
                            func: "{testEnvironment}.events.constructServer.fire"
                        },
                        {
                            listener: "fluid.identity",
                            event: "{testEnvironment}.events.started"
                        },
                        {
                            func: "{fullResetForgotRequest}.send",
                            args: [ { email: "{fullResetForgotRequest}.options.user.email" } ]
                        },
                        //{
                        //    listener: "gpii.express.couchuser.test.server.caseHolder.fullResetVerifyInitialResponse",
                        //    event: "{fullResetForgotRequest}.events.onComplete",
                        //    args: ["{fullResetForgotRequest}", "{fullResetForgotRequest}.nativeResponse", "{arguments}.0"]
                        //},
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.fullResetVerifyEmail",
                            event: "{testEnvironment}.smtp.events.messageReceived",
                            args: ["{fullResetForgotRequest}", "{fullResetVerifyResetRequest}", "{testEnvironment}"]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.fullResetVerifyResetLink",
                            event: "{fullResetVerifyResetRequest}.events.onComplete",
                            args: ["{fullResetVerifyResetRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            func: "{fullResetLoginRequest}.send",
                            args: [{ name: "{fullResetForgotRequest}.options.user.name", password: "{fullResetForgotRequest}.options.user.password"}]
                        },
                        {
                            listener: "gpii.express.couchuser.test.server.caseHolder.fullResetVerifyLogin",
                            event: "{fullResetLoginRequest}.events.onComplete",
                            args: ["{fullResetLoginRequest}", "{fullResetLoginRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                }
            ]
        }
    ]
});
