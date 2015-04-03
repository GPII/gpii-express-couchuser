// provide a front-end to /api/user/signup
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.signup");

    // Try to log in and display the results
    gpii.express.couchuser.frontend.signup.submit = function (that, event) {
        if (event) { event.preventDefault(); }
        var name     = that.locate("name").val();
        var email    = that.locate("email").val();
        var password = that.locate("password").val();
        var confirm  = that.locate("confirm").val();

        // Our user handling library doesn't offer password confirmation, so we have to do it ourselves for now
        if (password !== confirm) {
            that.displayError(null, null, "The passwords you have entered don't match.");
            return;
        }

        // This is not at all nice, but in order to make jQuery correctly send array data, we have to:
        //
        // a) set `traditional` to `true`, otherwise the roles variable comes through with brackets appended to it.
        // b) send at least a two-item array (a one-item array becomes a string variable)
        //
        // Thanks jQuery!
        var settings = {
            type:        "POST",
            url:         that.options.apiUrl + "/signup",
            success:     that.displayReceipt,
            error:       that.displayError,
            traditional: true,
            data:        { name: name, "password": password, "email": email, "roles": ["user", "user"] }
        };

        $.ajax(settings);
    };

    gpii.express.couchuser.frontend.signup.displayError = function (that, jqXHR, textStatus, errorThrown) {
        var message = errorThrown;
        try {
            var jsonData = JSON.parse(jqXHR.responseText);
            if (jsonData.message) { message = jsonData.message; }
        }
        catch (e) {
            console.log("jQuery.ajax call returned meaningless jqXHR.responseText payload. Using 'errorThrown' instead.");
        }

        that.templates.html(that.locate("message"),"common-error", { message: message });
    };

    gpii.express.couchuser.frontend.signup.displayReceipt = function(that, responseData) {
        var jsonData = JSON.parse(responseData);
        if (jsonData && jsonData.ok) {
            that.applier.change("user",jsonData.user);
            that.locate("form").hide();

            that.templates.html(that.locate("message"),"success", { message:"You have created an account. Check your email for details about verifying your new account." });
        }
        else {
            that.templates.html(that.locate("message"),"common-error", { message: jsonData.message });
        }
    };

    gpii.express.couchuser.frontend.signup.refresh = function(that) {
        that.templates.replaceWith(that.locate("form"),"signup-form", that.model);
        that.events.markupLoaded.fire();
    };

    // We have to do this because templates need to be loaded before we initialize our own code.
    gpii.express.couchuser.frontend.signup.init = function(that) {
        that.templates.loadTemplates();
        that.events.markupLoaded.fire();
    };

    fluid.defaults("gpii.express.couchuser.frontend.signup", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        apiUrl: "/api/user",
        components: {
            templates: {
                "type": "gpii.templates.hb.client"
            }
        },
        selectors: {
            "form":     ".signup-form",
            "viewport": ".signup-viewport",
            "message":  ".signup-message",
            "name":     "input[name='username']",
            "email":    "input[name='email']",
            "password": "input[name='password']",
            "confirm":  "input[name='confirm']"
        },
        events: {
            "submit":       "preventable",
            "refresh":      "preventable",
            "markupLoaded": "preventable"
        },
        invokers: {
            "submit": {
                funcName: "gpii.express.couchuser.frontend.signup.submit",
                args: [ "{that}", "{arguments}.0"]
            },
            "displayError": {
                funcName: "gpii.express.couchuser.frontend.signup.displayError",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            "displayReceipt": {
                funcName: "gpii.express.couchuser.frontend.signup.displayReceipt",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            "init": {
                funcName: "gpii.express.couchuser.frontend.signup.loadTemplates"
            }
        },
        listeners: {
            onCreate: [
                {
                    "funcName": "gpii.express.couchuser.frontend.signup.init",
                    "args":     "{that}"
                }
            ],
            "markupLoaded": [
                {
                    "this": "{that}.dom.form",
                    method: "submit",
                    args:   "{that}.submit"
                }
            ],
            "submit": {
                func: "gpii.express.couchuser.frontend.signup.submit",
                args: [ "{that}"]
            },
            "refresh": {
                func: "gpii.express.couchuser.frontend.signup.refresh",
                args: [ "{that}"]
            }
        }
    });
})(jQuery);