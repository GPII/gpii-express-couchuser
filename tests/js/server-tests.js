// Test the couchuser APIs to ensure that all of our modules that wrap the library are working correctly.
//
// Although there are some similarities in the server setup and mail testing, these tests do not touch the client modules, and access the APIs directly.
//
// For browser tests, check out zombie-tests.js

// Instantiate a new express instance with all the required middleware
"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");

var request    = require("request");
var jqUnit     = fluid.require("jqUnit");
var fs         = require("fs");

require("./test-harness.js");

function isSaneResponse(jqUnit, error, response, body, statusCode) {
    statusCode = statusCode ? statusCode : 200;

    jqUnit.assertNull("There should be no errors.", error);

    jqUnit.assertEquals("The status code should be appropriate", statusCode, response.statusCode);

    jqUnit.assertNotNull("There should be a body.", body);
}


// TODO:  This is very bad, we clean up between runs and destroy the global instance ourselves
// This should be managed by a sane test environment and/or test case holder.
var harness;

fluid.registerNamespace("gpii.express.couchuser.test.server");
gpii.express.couchuser.test.server.webAndMailTest= function(webCallback, mailCallback) {
    gpii.express.couchuser.tests.harness.webCallback = function(that){webCallback(that);};
    gpii.express.couchuser.tests.harness.mailCallback = function(that,connection){mailCallback(that,connection);};
    if (harness) { harness.destroy();}
    harness = gpii.express.couchuser.tests.harness({
        "listeners": {
            "{smtp}.events.messageReceived": {
                "funcName": "gpii.express.couchuser.tests.harness.mailCallback",
                "args": ["{that}", "{arguments}.0"]
            },
            "started": {
                "funcName": "gpii.express.couchuser.tests.harness.webCallback",
                "args": ["{that}"]
            }
        }
    });
};

gpii.express.couchuser.test.server.webTest= function(callback) {
    gpii.express.couchuser.tests.harness.callback = function(that){callback(that);};
    if (harness) { harness.destroy();}
    harness = gpii.express.couchuser.tests.harness({
        "listeners": {
            "started": {
                "funcName": "gpii.express.couchuser.tests.harness.callback",
                "args": ["{that}"]
            }
        }
    });
};


// TODO: When we redesign the whole test harness following our experience with gpii.express, these need to be variables local to the test

var timestamp = (new Date()).getTime();
// Apparently a username with only numbers causes problems with the data nano sends to couch.
var username = "username-" + timestamp;
var password = "password-" + timestamp;
var email = username + "@localhost";

var newPassword = "reset";



var tests = {
    "Testing full login/logout cycle...": {
        "type": "webTest",
        "webCallback": function(that){
            var jar = request.jar();
            var username = "admin";
            var password = "admin";
            var loginOptions = {
                "url":     that.express.options.config.express.baseUrl + "api/user/signin",
                "json":    { "name": username, "password": password },
                "jar":     jar
            };

            request.post(loginOptions, function(error, response, body){
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body);

                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertTrue("The response should be 'ok'.", data.ok);
                jqUnit.assertNotNull("There should be a user returned.", data.user);
                if (data.user) {
                    jqUnit.assertEquals("The current user should be returned.", username, data.user.name);
                }

                jqUnit.stop();
                var checkCurrentOptions = {
                    "url":  that.express.options.config.express.baseUrl + "api/user/current",
                    "jar":  jar
                };
                request.get(checkCurrentOptions, function(error, response, body){
                    jqUnit.start();

                    isSaneResponse(jqUnit, error, response, body);

                    var data = typeof body === "string" ? JSON.parse(body) : body;
                    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
                    jqUnit.assertNotNull("There should be a user returned.", data.user);
                    if (data.user) {
                        jqUnit.assertEquals("The current user should be returned.", username, data.user.name);
                    }

                    jqUnit.stop();
                    var logoutOptions = {
                        "url":  that.express.options.config.express.baseUrl + "api/user/signout",
                        "jar":  jar
                    };
                    request.post(logoutOptions, function(error, response,body){
                        jqUnit.start();

                        isSaneResponse(jqUnit, error, response, body);

                        var data = typeof body === "string" ? JSON.parse(body) : body;
                        jqUnit.assertTrue("The response should be 'ok'.", data.ok);
                        jqUnit.assertNotNull("There should not be a user returned.", data.user);

                        jqUnit.stop();

                        // We should no longer be able to view the current user
                        request.get(checkCurrentOptions, function(error,response,body){
                            jqUnit.start();

                            isSaneResponse(jqUnit, error, response, body, 401);

                            var data = typeof body === "string" ? JSON.parse(body) : body;
                            jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
                            jqUnit.assertUndefined("There should not be a user returned.", data.user);
                        });
                    });
                });

            });
        }
    },
    "Testing logging in with a bogus username/password..." : {
        "type": "webTest",
        "webCallback": function(that){
            var jar = request.jar();
            var loginOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/signin",
                "json": {"name": "bogus", "password": "bogus"},
                "jar": jar
            };

            request.post(loginOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 500);

                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
                jqUnit.assertUndefined("There should not be a user returned.", data.user);
            });
        }
    },
    "Testing logging in with an unverified username..." : {
        "type": "webTest",
        "webCallback": function(that){
            var jar = request.jar();
            var loginOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/signin",
                "json": {"name": "unverified", "password": "unverified"},
                "jar": jar
            };

            request.post(loginOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 401);

                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
                jqUnit.assertUndefined("There should not be a user returned.", data.user);
            });
        }
    },
    "Testing creating and verifying a user with the same email address as an existing user..." : {
        "type": "webTest",
        "webCallback": function(that){
            var jar = request.jar();
            var signupOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/signup",
                "json": {
                    "name": "new",
                    "password": "new",
                    "email": "duhrer@localhost",
                    "roles": []
                },
                "jar": jar
            };

            request.post(signupOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 400);

                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
            });
        }
    },
    "Testing creating and verifying a user end-to-end..." : {
        "type": "webAndMailTest",
        "webCallback": function(that){
            // Start the signup process now that we have a working mail server...
            var signupRequest = require("request");
            var signupOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/signup",
                "json": {
                    "name": username,
                    "password": password,
                    "email": email,
                    "roles": []
                }
            };

            signupRequest.post(signupOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 200);

                // Stop and resume when the mail server receives its message.
                jqUnit.stop();
            });
        },
        "mailCallback": function(that) {

            var content = fs.readFileSync(that.smtp.mailServer.options.messageFile);

            // Get the verification code and continue the verification process
            var verificationCodeRegexp = new RegExp("content/verify/([a-z0-9-]+)", "i");
            var matches = content.toString().match(verificationCodeRegexp);

            jqUnit.assertNotNull("There should be a verification code in the email sent to the user.", matches);
            if (matches) {
                var code = matches[1];

                var verifyRequest = request.defaults({timeout: 500});
                var verifyOptions = {
                    "url": that.express.options.config.express.baseUrl + "api/user/verify/" + code
                };

                verifyRequest.get(verifyOptions, function (error, response, body) {
                    jqUnit.start();
                    isSaneResponse(jqUnit, error, response, body, 200);

                    var data = typeof body === "string" ? JSON.parse(body) : body;
                    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
                    jqUnit.stop();

                    var loginRequest = request.defaults({timeout: 500});
                    var loginOptions = {
                        "url": that.express.options.config.express.baseUrl + "api/user/signin",
                        "json": {"name": username, "password": password}
                    };

                    loginRequest.post(loginOptions, function (error, response, body) {
                        jqUnit.start();
                        isSaneResponse(jqUnit, error, response, body, 200);

                        var data = typeof body === "string" ? JSON.parse(body) : body;
                        jqUnit.assertTrue("The response should be 'ok'.", data.ok);
                        jqUnit.assertNotUndefined("There should be a user returned.", data.user);
                    });
                });
            }
        }
    },
    "Testing creating a user without providing the required information..." : {
        "type": "webTest",
        "webCallback": function(that){
            var jar = request.jar();
            var signupOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/signup",
                "json": {},
                "jar": jar
            };

            request.post(signupOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 400);

                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
            });
        }
    },
    "Testing using a bogus verification code..." : {
        "type": "webTest",
        "webCallback": function(that){
            var jar = request.jar();
            var signupOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/verify/xxxxxxxxxx",
                "json": {},
                "jar": jar
            };

            request.get(signupOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 400);

                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
            });
        }
    },
    "Testing resetting a user's password end-to-end..." : {
        "type": "webAndMailTest",
        "webCallback": function(that){

            var username = "reset";
            var email = username + "@localhost";


            var forgotRequest = require("request");
            var forgotOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/forgot",
                "json": {
                    "email": email
                }
            };

            forgotRequest.post(forgotOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 200);

                // Stop and resume when the mail server receives its message.
                jqUnit.stop();
            });
        },
        "mailCallback": function (that) {
            var content = fs.readFileSync(that.smtp.mailServer.options.messageFile);

            // Get the reset code and continue the reset process
            var resetCodeRegexp = new RegExp("reset/([a-z0-9-]+)", "i");
            var matches = content.toString().match(resetCodeRegexp);

            jqUnit.assertNotNull("There should be a reset code in the email sent to the user.", matches);
            if (matches) {
                var code = matches[1];

                var resetRequest = request.defaults({timeout: 500});
                var resetOptions = {
                    "url": that.express.options.config.express.baseUrl + "api/user/reset/",
                    "json": {
                        "code":     code,
                        "password": newPassword
                    }
                };

                resetRequest.post(resetOptions, function (error, response, body) {
                    jqUnit.start();
                    isSaneResponse(jqUnit, error, response, body, 200);

                    var data = typeof body === "string" ? JSON.parse(body) : body;
                    jqUnit.assertTrue("The response should be 'ok'.", data.ok);
                    jqUnit.stop();

                    var loginRequest = request.defaults({timeout: 500});
                    var loginOptions = {
                        "url": that.express.options.config.express.baseUrl + "api/user/signin",
                        "json": {"name": "reset", "password": newPassword}
                    };

                    loginRequest.post(loginOptions, function (error, response, body) {
                        jqUnit.start();
                        isSaneResponse(jqUnit, error, response, body, 200);

                        var data = typeof body === "string" ? JSON.parse(body) : body;
                        jqUnit.assertTrue("The response should be 'ok'.", data.ok);
                        jqUnit.assertNotUndefined("There should be a user returned.", data.user);
                    });
                });
            }
        }
    },
    "Testing using a bogus reset code..." : {
        "type": "webTest",
        "webCallback": function(that){
            var resetRequest = request.defaults({timeout: 5000});
            var resetOptions = {
                "url": that.express.options.config.express.baseUrl + "api/user/reset/",
                "json": {
                    "code": "utter-nonsense-which-should-never-work",
                    "password": newPassword
                }
            };

            resetRequest.post(resetOptions, function (error, response, body) {
                jqUnit.start();
                isSaneResponse(jqUnit, error, response, body, 500);

                var data = typeof body === "string" ? JSON.parse(body) : body;
                jqUnit.assertFalse("The response should not be 'ok'.", data.ok);
            });
        }
    }
    // Example test objects...
    //
    //"webTest" : {
    //    "type": "webTest",
    //    "webCallback": function(that){}
    //},
    //"mailTest" : {
    //    "type": "webAndMailTest",
    //    "webCallback": function(that){},
    //    "mailCallback": function(that, connection){}
    //}
};

jqUnit.module("Testing /api/user directly (no client side code)...");

// TODO:  When we get a real harness working, each instance should be destroyed before the next is started to avoid port conflicts
Object.keys(tests).forEach(function(key){
    var test = tests[key];
    jqUnit.asyncTest(key, function(){
        if (test.type === "webTest") {
            gpii.express.couchuser.test.server.webTest(test.webCallback);
        }
        else if (test.type === "webAndMailTest") {
            gpii.express.couchuser.test.server.webAndMailTest(test.webCallback, test.mailCallback);
        }
    });
});