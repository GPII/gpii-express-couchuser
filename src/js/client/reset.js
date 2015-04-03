// Provide a front-end to /api/user/reset
// The second part of the password reset process, can only be used with a code generated using the "forgot password" form.
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.reset");

    // Try to log in and display the results
    gpii.express.couchuser.frontend.reset.submit = function (that, event) {
        if (event) { event.preventDefault(); }
        var code     = that.locate("code").val();
        var password = that.locate("password").val();
        var confirm  = that.locate("confirm").val();

        // We can trust the upstream server to bust us if we have an invalid or missing code, but it doesn't support password confirmation, so we have to check that ourselves
        if (password === confirm) {
            var settings = {
                type:    "POST",
                url:     that.options.apiUrl + "/reset",
                success: that.displayReceipt,
                error:   that.displayError,
                json:    true,
                data: { "code": code, "password": password }
            };

            $.ajax(settings);
        }
        // TODO:  Add support for password validation, using a module common to this and the signup form.
        else {
            that.templates.html(that.locate("message"), that.options.templates.error, { message: "The passwords you entered do not match." });
        }
    };

    // TODO: move this to a general module type that everyone inherits from
    gpii.express.couchuser.frontend.reset.displayError = function (that, jqXHR, textStatus, errorThrown) {
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

    gpii.express.couchuser.frontend.reset.displayReceipt = function (that, responseData) {
        var jsonData = JSON.parse(responseData);
        if (jsonData && jsonData.ok) {
            that.applier.change("user", jsonData.user);
            that.locate("form").hide();

            that.templates.html(that.locate("message"), that.options.templates.success, { message: "You have successfully reset your password." });
        }
        else {
            that.templates.html(that.locate("message"), that.options.templates.error, { message: jsonData.message });
        }
    };

    gpii.express.couchuser.frontend.reset.refresh = function (that) {
        that.templates.replaceWith(that.locate("form"), that.options.templates.form, that.model);
        that.events.markupLoaded.fire();
    };

    // We have to do this because templates need to be loaded before we initialize our own code.
    gpii.express.couchuser.frontend.reset.init = function (that) {
        that.templates.loadTemplates();
        that.events.markupLoaded.fire();
    };

    fluid.defaults("gpii.express.couchuser.frontend.reset", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        components: {
            templates: {
                type: "gpii.templates.hb.client"
            }
        },
        templates: {
            success: "success",
            error:   "common-error",
            form:    "reset-form"
        },
        apiUrl: "/api/user",
        selectors: {
            form:     ".reset-form",
            message:  ".reset-message",
            viewport: ".reset-viewport",
            code:     "input[name='code']",
            confirm:  "input[name='confirm']",
            password: "input[name='password']"
        },
        events: {
            submit:       "preventable",
            refresh:      "preventable",
            markupLoaded: "preventable"
        },
        invokers: {
            submit: {
                funcName: "gpii.express.couchuser.frontend.reset.submit",
                args: [ "{that}", "{arguments}.0"]
            },
            displayError: {
                funcName: "gpii.express.couchuser.frontend.reset.displayError",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            displayReceipt: {
                funcName: "gpii.express.couchuser.frontend.reset.displayReceipt",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            init: {
                funcName: "{templates}.loadTemplates"
            }
        },
        listeners: {
            onCreate: [
                {
                    funcName: "gpii.express.couchuser.frontend.reset.init",
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
                func: "gpii.express.couchuser.frontend.reset.submit",
                args: [ "{that}"]
            },
            refresh: {
                func: "gpii.express.couchuser.frontend.reset.refresh",
                args: [ "{that}"]
            }
        }
    });
})(jQuery);