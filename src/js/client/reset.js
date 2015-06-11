// Provide a front-end to /api/user/reset
// The second part of the password reset process, can only be used with a code generated using the "forgot password" form.
/* global fluid, jQuery */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.reset");

    gpii.express.couchuser.frontend.reset.checkPasswords = function (that) {
        that.passwordsMatch = (that.model.password === that.model.confirm);

        if (that.error) {
            if (that.passwordsMatch) {
                that.error.applier.change("message", null);
            }
            else {
                that.error.applier.change("message", that.options.messages.passwordsDontMatch);
            }
        }
    };

    // Override the default submission to add additional checks.  Only continue if the checks pass.
    gpii.express.couchuser.frontend.reset.checkAndSubmit = function (that, event) {
        if (that.passwordsMatch && that.model.code) {
            that.continueSubmission(event);
        }
        else {
            event.preventDefault();
        }
    };

    gpii.express.couchuser.frontend.reset.extractQueryParams = function () {
        var rawQuery = fluid.url.parseUri(window.location.href);
        return rawQuery.queryKey;
    };

    fluid.defaults("gpii.express.couchuser.frontend.reset", {
        gradeNames: ["gpii.templates.hb.client.templateFormControl", "autoInit"],
        ajaxOptions: {
            type:    "POST",
            url:     "/api/user/reset"
        },
        templates: {
            success: "success",
            error:   "common-error",
            initial: "reset-viewport"
        },
        members: {
            passwordsMatch: false
        },
        messages: {
            passwordsDontMatch: {
                message: "The passwords you have entered don't match."
            }
        },
        model: {
            code:     "{that}.model.req.query.code",
            password: null,
            confirm:  null,
            req: {
                query: {
                    expander: {
                        funcName: "gpii.express.couchuser.frontend.reset.extractQueryParams"
                    }
                }
            }
        },
        modelListeners: {
            password: {
                funcName: "gpii.express.couchuser.frontend.reset.checkPasswords",
                args:     ["{that}"]
            },
            confirm: {
                funcName: "gpii.express.couchuser.frontend.reset.checkPasswords",
                args:     ["{that}"]
            }
        },
        selectors: {
            initial:              "",
            success:              ".reset-success",
            error:                ".reset-error",
            submit:               ".reset-button",
            code:                 "input[name='code']",
            confirm:              "input[name='confirm']",
            password:             "input[name='password']"
        },
        bindings: [
            {
                selector:    "code",
                path:        "code"
            },
            {
                selector:    "confirm",
                path:        "confirm"
            },
            {
                selector:    "password",
                path:        "password"
            }
        ],
        invokers: {
            submitForm: {
                funcName: "gpii.express.couchuser.frontend.reset.checkAndSubmit",
                args: ["{that}", "{arguments}.0"]
            },
            continueSubmission: {
                funcName: "gpii.templates.hb.client.templateFormControl.submitForm",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });
})(jQuery);