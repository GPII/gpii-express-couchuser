// Provide a front-end to allow users to request that their password be reset...
/* global fluid, jQuery */
(function () {
    "use strict";
    fluid.defaults("gpii.express.couchuser.frontend.forgot", {
        gradeNames: ["gpii.templates.hb.client.templateFormControl", "autoInit"],
        ajaxOptions: {
            type:        "POST",
            url:         "/api/user/forgot",
            success:     "{that}.handleSuccess",
            error:       "{that}.handleAjaxError"
        },
        model: {
            email: ""
        },
        rules: {
            success: { message: "Check your email for instructions about resetting your password." },
            error:   { message: "message" }
        },
        selectors: {
            initial: "",
            error:   ".forgot-message",
            success: "",
            submit:  ".forgot-button",
            email:    "input[name='email']"
        },
        bindings: [
            {
                selector:    "email",
                path:        "email"
            }
        ],
        templates: {
            "initial": "forgot-viewport",
            "error":   "common-error",
            "success": "success"
        }
    });
})(jQuery);