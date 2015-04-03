// A front-end component to provide meaningful feedback when users verify their accounts using /api/user/verify/:code
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.verify");

    // Try to log in and display the results
    gpii.express.couchuser.frontend.verify.submit = function (that, event) {
        if (event) { event.preventDefault(); }

        if (!that.model || !that.model.code) {
            that.displayError(null, null, "<p>Cannot continue without a verification code.  Please check your email for a verification link or contact a system administrator for assistance.</p>");
            return;
        }
        else {
            var settings = {
                type:    "GET",
                url:     that.options.apiUrl + "/verify/" + that.model.code,
                success: that.displayReceipt,
                error:   that.displayError
            };

            $.ajax(settings);
        }
    };

    // TODO: move this to a general module type that everyone inherits from
    gpii.express.couchuser.frontend.verify.displayError = function (that, jqXHR, textStatus, errorThrown) {
        var message = errorThrown;
        try {
            var jsonData = JSON.parse(jqXHR.responseText);
            if (jsonData.message) { message = jsonData.message; }
        }
        catch (e) {
            console.log("jQuery.ajax call returned meaningless jqXHR.responseText payload. Using 'errorThrown' instead.");
        }

        that.templates.html(that.locate("message"),"common-error", { message: message } );
    };

    gpii.express.couchuser.frontend.verify.displayReceipt = function (that, responseData) {
        var jsonData = JSON.parse(responseData);
        if (jsonData && jsonData.ok) {
            that.applier.change("user", jsonData.user);

            that.templates.html(that.locate("message"), "common-success", { message: "You have successfully verified your account." });
        }
        else {
            that.templates.html(that.locate("message"), "common-error", { message: jsonData.message });
        }
    };

    // We have to do this because templates need to be loaded before we initialize our own code.
    gpii.express.couchuser.frontend.verify.init = function (that) {
        that.templates.loadTemplates();
    };

    fluid.defaults("gpii.express.couchuser.frontend.verify", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        model: {
            code: null
        },
        components: {
            templates: {
                "type": "gpii.templates.hb.client"
            }
        },
        apiUrl: "/api/user",
        selectors: {
            "viewport": ".verify-viewport",
            "message":  ".verify-message"
        },
        events: {
            "submit":       "preventable",
            "markupLoaded": "preventable"
        },
        invokers: {
            "submit": {
                funcName: "gpii.express.couchuser.frontend.verify.submit",
                args: [ "{that}", "{arguments}.0"]
            },
            "displayError": {
                funcName: "gpii.express.couchuser.frontend.verify.displayError",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            "displayReceipt": {
                funcName: "gpii.express.couchuser.frontend.verify.displayReceipt",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            "init": {
                funcName: "{templates}.loadTemplates"
            }
        },
        listeners: {
            onCreate: {
                "funcName": "gpii.express.couchuser.frontend.verify.init",
                "args":     "{that}"
            },
            "{templates}.events.templatesLoaded": {
                "funcName": "gpii.express.couchuser.frontend.verify.submit",
                "args":     "{that}"
            }
        }
    });
})(jQuery);