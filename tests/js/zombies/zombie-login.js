// Test all user management functions using only a browser (and something to receive emails).
//
// There is some overlap between this and the server-tests.js, a test that fails in both is likely broken on the server side, a test that only fails here is likely broken in the client-facing code.

"use strict";
var fluid      = fluid || require("infusion");
var gpii       = fluid.registerNamespace("gpii");

var jqUnit     = fluid.require("jqUnit");
var Browser    = require("zombie");

var isBrowserSane = require("./browser-sanity.js");

require("./zombie-test-harness.js");
var harness = gpii.express.couchuser.tests.harness({});

function runTests() {
    var browser;

    jqUnit.module("End-to-end functional login tests...", { "setup": function() { browser = Browser.create({ continueOnError: true }); }});

    jqUnit.asyncTest("Login with a valid username and password...", function() {
        browser.visit( harness.express.options.config.express.baseUrl + "content/login").then(function () {
            jqUnit.start();
            isBrowserSane(jqUnit, browser);
            jqUnit.stop();

            browser.fill("username", "admin")
                .fill("password", "admin")
                .pressButton("Log In", function() {
                    jqUnit.start();
                    isBrowserSane(jqUnit, browser);

                    // The login form should no longer be visible
                    var loginForm = browser.window.$(".login-form");
                    jqUnit.assertNotUndefined("There should be a login form...", loginForm.html());
                    jqUnit.assertEquals("The login form should not be hidden...", "none", loginForm.css("display"));

                    // A "success" message should be visible
                    var feedback = browser.window.$(".success");
                    jqUnit.assertNotUndefined("There should be a positive feedback message...", feedback.html());

                    // There should be no alerts
                    var alert = browser.window.$(".alert");
                    jqUnit.assertUndefined("There should not be any alerts...", alert.html());
                });
        });
    });

    jqUnit.asyncTest("Login with an invalid username and password...", function() {
        browser.visit( harness.express.options.config.express.baseUrl + "content/login").then(function () {
            jqUnit.start();
            isBrowserSane(jqUnit, browser);
            jqUnit.stop();

            browser.fill("username", "bogus")
                .fill("password", "bogus")
                .pressButton("Log In", function() {
                    jqUnit.start();
                    // In this case, there should be an error in the AJAX call, so we can't use the standard browser test
                    //testBrowserSanity(jqUnit, browser);

                    // The login form should be visible
                    var loginForm = browser.window.$(".login-form");
                    jqUnit.assertNotUndefined("There should be a login form...", loginForm.html());
                    jqUnit.assertEquals("The login form should not be hidden...", "", loginForm.css("display"));

                    // A "success" message should be visible
                    var feedback = browser.window.$(".success");
                    jqUnit.assertUndefined("There should not be a positive feedback message...", feedback.html());

                    // There should be no alerts
                    var alert = browser.window.$(".alert");
                    jqUnit.assertNotUndefined("There should be an alert...", alert.html());
                    if (alert.html()) {
                        jqUnit.assertTrue("The alert should have content.", alert.html().trim().length > 0);
                    }
                });
        });
    });

}

runTests();