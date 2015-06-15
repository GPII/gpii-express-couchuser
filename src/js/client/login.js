// provide a front-end to /api/user/login
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.defaults("gpii.express.couchuser.frontend.login", {
        gradeNames: ["gpii.templates.hb.client.templateFormControl", "autoInit"],
        "templates": {
            "initial": "login-viewport",
            "error":   "common-error",
            "success": "common-success"
        },
        model: {
            user: null
        },
        ajaxOptions: {
            url:    "/api/user/signin",
            method: "POST",
            json:   true
        },
        modelListeners: {
            "user.refresh": {
                func:          "{that}.renderInitialMarkup",
                excludeSource: "init"
            }
        },
        rules: {
            submission: {
                "":       "notfound", // Required to clear out the default rules from `templateFormControl`
                name:     "username",
                password: "password"
            },
            model: {
                model: {
                    user: "user",
                    password: {
                        literalValue: ""
                    }
                }
            },
            success: {
                ok: "ok",
                message: {
                    literalValue: "You are now logged in."
                }
            }
        },
        bindings: {
            username: "username",
            password: "password"
        },
        selectors: {
            "form":     ".login-form",
            "success":  ".login-success",
            "error":    ".login-error",
            "username": "input[name='username']",
            "password": "input[name='password']"
        }
    });
})(jQuery);