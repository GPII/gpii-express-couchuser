// Provide a front-end to allow users to request that their password be reset...
/* global fluid, jQuery */
(function () {
    "use strict";
    fluid.defaults("gpii.express.couchuser.frontend.forgot", {
        gradeNames: ["gpii.templates.hb.client.templateFormControl", "autoInit"],
        ajaxOptions: {
            type:        "POST",
            url:         "/api/user/forgot"
        },
        model: {
            email: ""
        },
        selectors: {
            initial: "",
            error:   ".forgot-error",
            success: ".forgot-success",
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