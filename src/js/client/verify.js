// A front-end component to provide meaningful feedback when users verify their accounts using /api/user/verify/:code
/* global fluid, jQuery, window */
(function () {
    "use strict";
    fluid.registerNamespace("gpii.express.couchuser.frontend.verify");

    gpii.express.couchuser.frontend.verify.extractQueryParams = function () {
        var rawQuery = fluid.url.parseUri(window.location.href);
        return rawQuery.queryKey;
    };

    gpii.express.couchuser.frontend.verify.assembleUrl = function (baseUrl, code) {
        return baseUrl + code;
    };

    fluid.defaults("gpii.express.couchuser.frontend.verify", {
        gradeNames: ["gpii.templates.hb.client.templateFormControl", "autoInit"],
        model: {
            code:     "{that}.model.req.query.code",
            req: {
                query: {
                    expander: {
                        funcName: "gpii.express.couchuser.frontend.verify.extractQueryParams"
                    }
                }
            }
        },
        templates: {
            initial: "verify-viewport",
            success: "common-success",
            error:   "common-error"
        },
        ajaxOptions: {
            url:    {
                expander: {
                    funcName: "gpii.express.couchuser.frontend.verify.assembleUrl",
                    args:     ["/api/user/verify/", "{that}.model.code"]
                }
            },
            method: "GET"
        },
        rules: {
            submission: {
                "": "notfound"
            },
            error: {
                "message": "message"
            },
            success: {
                "message": "message"
            }
        },
        hideOnSuccess: false,
        selectors: {
            initial: "",
            success: "", // Kill the original form whether we succeed or fail.
            error:   ""
        },
        listeners: {
            "onMarkupRendered.autoSubmit" : {
                func: "{that}.submitForm",
                args: [ false]
            }
        }
    });
})(jQuery);