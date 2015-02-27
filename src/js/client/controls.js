// Present a standard "user" menu with login/logout/profile controls
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.controls");

    //TODO:  Bind this so that we can update ourselves if the user changes in the background

    gpii.express.couchuser.frontend.controls.logout = function(that) {
        // TODO:  We need a way to let someone else wire in our user object from the server side, but it can't be namespaced with "ctr"
        // perhaps gpii.express.data or something similar.s
        that.data.applier.change("user", undefined);
        that.data.model.user = undefined;

        // Fire the REST call that logs a user out, refresh afterward
        var settings = {
            type:    "POST",
            url:     that.options.apiUrl + "/signout",
            success: that.logoutAndRefresh,
            error:   that.logoutAndRefresh
        };
        $.ajax(settings);
    };

    // After we have our markup in place, wire it up
    gpii.express.couchuser.frontend.controls.init = function(that) {
        // TODO: Evolve our select using jquery.dropBox or something comparable
        that.events.markupLoaded.fire();
    };

    gpii.express.couchuser.frontend.controls.logoutAndRefresh = function(that) {
        that.events.afterLogout.fire();

        that.refresh(that);
    };

    // Update markup and wiring after a change in user status (login/logout, profile update)
    gpii.express.couchuser.frontend.controls.refresh = function(that) {
        that.templates.replaceWith(that.locate("profile"),"user-controls", that.model);
        that.events.markupLoaded.fire();
    };

    fluid.defaults("gpii.express.couchuser.frontend.controls", {
        apiUrl:    "/api/user",
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        selectors: {
            "profile":   "#profile",
            "badge":     ".user-badge",
            "menu":      ".user-menu",
            "logout":    ".user-menu-logout"
        },
        components: {
            templates: {
                "type": "gpii.templates.hb.client"
            }
        },
        events: {
            "logout":       "preventable",
            "afterLogout":  "preventable",
            "refresh":      "preventable",
            "markupLoaded": "preventable"
        },
        invokers: {
            "logout": {
                funcName: "gpii.express.couchuser.frontend.controls.logout",
                args: [ "{that}"]
            },
            "logoutAndRefresh": {
                funcName: "gpii.express.couchuser.frontend.controls.logoutAndRefresh",
                args: [ "{that}"]
            },
            "refresh": {
                funcName: "gpii.express.couchuser.frontend.controls.refresh",
                args: [ "{that}"]
            },
            "init": {
                funcName: "gpii.express.couchuser.frontend.controls.init",
                args: [ "{that}"]
            }
        },
        listeners: {
            onCreate: [
                {
                    "funcName": "gpii.express.couchuser.frontend.controls.init",
                    "args":     "{that}"
                }
            ],
            "markupLoaded": [
                {
                    "this": "{that}.dom.logout",
                    method: "click",
                    args:   "{that}.logout"
                }
            ],
            "refresh": {
                func: "gpii.express.couchuser.frontend.controls.refresh"
            },
            "logout": {
                func: "gpii.express.couchuser.frontend.controls.logout",
                "args" : "{that}"
            }
        }
    });
})(jQuery);