// Provide a front-end to /api/user/forgot
// Allows users to request that their password be reset...
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.forgot");

    // Try to log in and display the results
    gpii.express.couchuser.frontend.forgot.submit = function (that, event) {
        if (event) { event.preventDefault(); }
        var email    = that.locate("email").val();
        var settings = {
            type:    "POST",
            url:     that.options.apiUrl + "/forgot",
            success: that.displayReceipt,
            error:   that.displayError,
            contentType: "application/json",
            processData: false,
            data: JSON.stringify({ "email": email })
        };

        $.ajax(settings);
    };

    gpii.express.couchuser.frontend.forgot.displayError = function (that, jqXHR, textStatus, errorThrown) {
        var message = errorThrown;
        try {
            var jsonData = JSON.parse(jqXHR.responseText);
            if (jsonData.message) { message = jsonData.message; }
        }
        catch (e) {
            console.log("jQuery.ajax call returned meaningless jqXHR.responseText payload. Using 'errorThrown' instead.");
        }

        that.templates.html(that.locate("message"), that.options.templates.error, { message: message });
    };

    gpii.express.couchuser.frontend.forgot.displayReceipt = function (that, responseData) {
        var jsonData = JSON.parse(responseData);
        if (jsonData && jsonData.ok) {
            that.applier.change("user", jsonData.user);

            that.locate("form").hide();

            that.templates.html(that.locate("message"), that.options.templates.success, { message: "Check your email for instructions about resetting your password." });
        }
        else {
            that.templates.html(that.locate("message"), that.options.templates.error, { message: jsonData.message });
        }
    };

    gpii.express.couchuser.frontend.forgot.refresh = function (that) {
        that.templates.replaceWith(that.locate("form"), that.options.templates.form, that.model);
        that.events.markupLoaded.fire();
    };

    // We have to do this because templates need to be loaded before we initialize our own code.
    gpii.express.couchuser.frontend.forgot.init = function (that) {
        that.templates.loadTemplates();
        that.events.markupLoaded.fire();
    };

    fluid.defaults("gpii.express.couchuser.frontend.forgot", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        templates: {
            "error":   "common-error",
            "success": "success",
            "forgot":  "forgot-form"
        },
        components: {
            templates: {
                type: "gpii.templates.hb.client"
            }
        },
        apiUrl: "/api/user",
        selectors: {
            form:     ".forgot-form",
            message:  ".forgot-message",
            viewport: ".forgot-viewport",
            email:    "input[name='email']"
        },
        events: {
            submit:       null,
            refresh:      null,
            markupLoaded: null
        },
        invokers: {
            submit: {
                funcName: "gpii.express.couchuser.frontend.forgot.submit",
                args: [ "{that}", "{arguments}.0"]
            },
            displayError: {
                funcName: "gpii.express.couchuser.frontend.forgot.displayError",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            displayReceipt: {
                funcName: "gpii.express.couchuser.frontend.forgot.displayReceipt",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            init: {
                funcName: "{templates}.loadTemplates"
            }
        },
        listeners: {
            onCreate: [
                {
                    funcName: "gpii.express.couchuser.frontend.forgot.init",
                    args:     "{that}"
                }
            ],
            markupLoaded: [
                {
                    "this": "{that}.dom.form",
                    method: "submit",
                    args:   "{that}.submit"
                }
            ],
            submit: {
                func: "gpii.express.couchuser.frontend.forgot.submit",
                args: [ "{that}"]
            },
            refresh: {
                func: "gpii.express.couchuser.frontend.forgot.refresh",
                args: [ "{that}"]
            }
        }
    });
})(jQuery);