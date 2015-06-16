// Combined login form and user controls.
/* global fluid, jQuery */
(function () {
    "use strict";

    fluid.defaults("gpii.express.couchuser.frontend.loginWithControls", {
        gradeNames: ["fluid.modelRelayComponent", "autoInit"],
        model: {
            user: {}
        },
        components: {
            login: {
                type:      "gpii.express.couchuser.frontend.login",
                container: ".login-viewport",
                options: {
                    model: {
                        user: "{loginWithControls}.model.user"
                    }
                }
            },
            controls: {
                type:      "gpii.express.couchuser.frontend.controls",
                container: ".controls-viewport",
                options: {
                    model: {
                        user: "{loginWithControls}.model.user"
                    }
                }
            }
        }
    });
})(jQuery);