// Present a standard set of user controls with login/logout/profile links
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.controls");

    //TODO:  Bind this so that we can update ourselves if the user changes in the background

    gpii.express.couchuser.frontend.controls.logout = function(that) {
        // Fire the REST call that logs a user out, refresh afterward
        var settings = {
            type:    "POST",
            url:     that.options.apiUrl + "/signout",
            success: that.handleLogout,
            error:   that.handleLogout
        };
        $.ajax(settings);
    };

    gpii.express.couchuser.frontend.controls.handleLogout = function(that) {
        that.applier.change("user", null);
    };

    // Update markup and wiring after a change in user status (login/logout, profile update)
    gpii.express.couchuser.frontend.controls.refresh = function(that) {
        if (that.templates) {
            that.templates.replaceWith(that.locate("controls"), that.options.templateName, that.model);
        }
        else {
            console.log("Something is really wrong, user controls should always have a 'templates' sub-component.");
        }
    };

    fluid.defaults("gpii.express.couchuser.frontend.controls", {
        apiUrl:    "/api/user",
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        templateName: "user-controls",
        selectors: {
            controls:  ".user-controls",
            badge:     ".user-badge",
            menu:      ".user-menu",
            logout:    ".user-menu-logout"
        },
        components: {
            templates: {
                type: "gpii.templates.hb.client"
            }
        },
        model: {
            user: null
        },
        modelListeners: {
            user: {
                funcName: "gpii.express.couchuser.frontend.controls.refresh",
                args: ["{that}"]
            }
        },
        invokers: {
            logout: {
                funcName: "gpii.express.couchuser.frontend.controls.logout",
                args: [ "{that}"]
            }
        },
        listeners: {
            onCreate: [
                {
                    funcName: "gpii.express.couchuser.frontend.controls.refresh",
                    args:     "{that}"
                }
            ]
        }
    });
})(jQuery);