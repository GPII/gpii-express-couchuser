// provide a front-end to /api/user/signin
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.login");

    // Try to log in and display the results
    gpii.express.couchuser.frontend.login.submit = function(that, event) {
        // Clear out any previous feedback before submitting
        $(that.container).find(".alert-box").remove();

        if (event) { event.preventDefault(); }
        var name     = that.locate("name").val();
        var password = that.locate("password").val();
        var settings = {
            type:    "POST",
            url:     that.options.loginUrl,
            data:    { "name": name, "password": password },
            success: that.displayReceipt,
            error:   that.displayError
        };

        $.ajax(settings);
    };

    gpii.express.couchuser.frontend.login.displayError = function(that, jqXHR, textStatus, errorThrown) {
        var message = errorThrown;
        try {
            var jsonData = JSON.parse(jqXHR.responseText);
            if (jsonData.message) { message = jsonData.message; }
        }
        catch (e) {
            console.log("jQuery.ajax call returned meaningless jqXHR.responseText payload. Using 'errorThrown' instead.");
        }

        that.templates.html(that.locate("message"), that.model.templates.error, { "message": message });
    };

    gpii.express.couchuser.frontend.login.displayReceipt = function(that, responseData, textStatus, jqXHR) {
        var jsonData = JSON.parse(responseData);
        if (jsonData && jsonData.ok) {
            that.applier.change("user", jsonData.user);

            that.locate("form").hide();
            that.templates.html(that.locate("message"), that.model.templates.success, { message: "You are now logged in as " + that.model.user.name + "." });

            // Anything that should refresh on login should bind to this event.
            that.events.login.fire();
        }
        else {
            that.templates.html(that.locate("message"), that.model.templates.error, { message: jsonData.message });
        }
    };

    gpii.express.couchuser.frontend.login.refresh = function(that) {
        that.templates.replaceWith(that.locate("form"), that.model.templates.form, that.model.data);
        that.events.markupLoaded.fire();
    };

    // We have to do this because templates need to be loaded before we initialize our own code.
    gpii.express.couchuser.frontend.login.init = function(that) {
        that.templates.loadTemplates();
        that.events.markupLoaded.fire();
    };

    fluid.defaults("gpii.express.couchuser.frontend.login", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        components: {
            templates: {
                "type": "gpii.templates.hb.client"
            }
        },
        model: {
            "templates": {
                "error":   "common-error",
                "success": "common-success",
                "form":    "login-form"
            }
        },
        loginUrl: "/api/user/signin",
        selectors: {
            "form":     ".login-form",
            "viewport": ".login-viewport",
            "message":  ".login-message",
            "name":     "input[name='username']",
            "password": "input[name='password']"
        },
        events: {
            "submit":       "preventable",
            "refresh":      "preventable",
            "login":        "preventable",
            "markupLoaded": "preventable"
        },
        invokers: {
            "submit": {
                funcName: "gpii.express.couchuser.frontend.login.submit",
                args: [ "{that}", "{arguments}.0"]
            },
            "displayError": {
                funcName: "gpii.express.couchuser.frontend.login.displayError",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            "displayReceipt": {
                funcName: "gpii.express.couchuser.frontend.login.displayReceipt",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            "init": {
                funcName: "{templates}.loadTemplates"
            }
        },
        listeners: {
            onCreate: [
                {
                    "funcName": "gpii.express.couchuser.frontend.login.init",
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
                func: "gpii.express.couchuser.frontend.login.submit",
                args: [ "{that}"]
            },
            "refresh": {
                func: "gpii.express.couchuser.frontend.login.refresh",
                args: [ "{that}"]
            }
        }
    });
})(jQuery);