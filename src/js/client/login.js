// provide a front-end to /api/user/login
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.defaults("gpii.express.couchuser.frontend.login", {
        gradeNames: ["gpii.express.couchuser.frontend.canHandleStrings", "gpii.templates.templateFormControl", "autoInit"],
        templates: {
            initial: "login-viewport",
            error:   "common-error",
            success: "common-success"
        },
        model: {
            user: null
        },
        ajaxOptions: {
            url:      "/api/user/signin",
            method:   "POST",
            json:     true,
            dataType: "json"
        },
        modelListeners: {
            "user.refresh": {
                func:          "{that}.renderInitialMarkup",
                excludeSource: "init"
            }
        },
        rules: {
            modelToRequestPayload: {
                "":       "notfound", // Required to clear out the default rules from `templateFormControl`
                name:     "username",
                password: "password"
            },
            successResponseToModel: {
                user: "responseJSON.user",
                password: {
                    literalValue: ""
                },
                successMessage: {
                    literalValue: "You are now logged in."
                }
            }
        },
        bindings: {
            username: "username",
            password: "password"
        },
        selectors: {
            initial:  ".login-viewport",
            form:     ".login-form",
            success:  ".login-success",
            error:    ".login-error",
            username: "input[name='username']",
            password: "input[name='password']"
        }
    });
})(jQuery);