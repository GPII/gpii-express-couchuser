// provide a front-end to /api/user/signup
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.defaults("gpii.express.couchuser.frontend.signup", {
        gradeNames: ["gpii.express.couchuser.frontend.passwordCheckingForm", "autoInit"],
        ajaxOptions: {
            type:   "POST",
            url:    "/api/user/signup",
            json:   true
        },
        rules: {
            submission: {
                name:     "username",
                password: "password",
                email:    "email",
                // Needed to ensure that our account can be created.
                roles: {
                    literalValue: ["user"]
                }
            },
            success: {
                ok: "ok",
                message: {
                    literalValue: "You have successfully created an account.  Check your email for further instructions."
                }
            }
        },
        templates: {
            initial: "signup-viewport",
            success: "common-success",
            error:   "common-error"
        },
        selectors: {
            success:  ".signup-success",
            error:    ".signup-error",
            submit:   ".signup-submit",
            username: "input[name='username']",
            email:    "input[name='email']",
            password: "input[name='password']",
            confirm:  "input[name='confirm']"
        },
        bindings: [
            // We have to duplicate the bindings from `passwordCheckingForm` for now.
            // TODO:  Review with Antranig
            {
                selector: "confirm",
                path:     "confirm"
            },
            {
                selector: "password",
                path:     "password"
            },
            {
                selector:    "username",
                path:        "username"
            },
            {
                selector:    "email",
                path:        "email"
            }
        ]
    });
})(jQuery);