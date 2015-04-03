// Present a standard set of user controls with login/logout/profile links
/* global fluid, jQuery */
(function ($) {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.express.couchuser.frontend.controls");

    //TODO:  Bind this so that we can update ourselves if the user changes in the background

    gpii.express.couchuser.frontend.controls.handleMenuKeys = function (that, event) {
        switch (event.keyCode) {
            case 27: // escape
                that.toggleMenu();
                break;
        }

        // TODO:  Eventually, we may want to take over control of "natural" arrow key handling using event.preventDefault()
    };

    gpii.express.couchuser.frontend.controls.handleToggleKeys = function (that, event) {
        switch (event.keyCode) {
            case 13: // enter
                that.toggleMenu();
                break;
        }
    };

    gpii.express.couchuser.frontend.controls.handleLogoutKeys = function (that, event) {
        switch (event.keyCode) {
            case 13: // enter
                that.logout();
                break;
        }
    };

    gpii.express.couchuser.frontend.controls.toggleMenu = function (that) {
        var toggle = that.locate("toggle");
        var menu   = that.locate("menu");

        if ($(menu).is(":hidden")) {
            menu.show();
            menu.focus();
        }
        else {
            menu.hide();
            toggle.focus();
        }
    };

    gpii.express.couchuser.frontend.controls.logout = function (that) {
        // Fire the REST call that logs a user out, refresh afterward
        var settings = {
            type:     "POST",
            url:      that.options.apiUrl + "/signout",
            complete: that.handleLogout
        };
        $.ajax(settings);
    };

    gpii.express.couchuser.frontend.controls.handleLogout = function (that) {
        that.applier.change("user", null);
    };

    // Update markup and wiring after a change in user status (login/logout, profile update)
    gpii.express.couchuser.frontend.controls.refresh = function (that) {
        if (that.templates) {
            that.templates.replaceWith(that.locate("controls"), that.options.templateName, that.model);

            that.events.markupLoaded.fire();
        }
        else {
            fluid.log("I don't yet have a templates sub-component, can't process refresh().");
        }
    };

    fluid.defaults("gpii.express.couchuser.frontend.controls", {
        apiUrl:    "/api/user",
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        templateName: "user-controls",
        selectors: {
            controls: ".user-controls",
            menu:     ".user-menu",
            logout:   ".user-menu-logout",
            toggle:   ".user-controls-toggle"
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
                args:     ["{that}"]
            }
        },
        invokers: {
            logout: {
                funcName: "gpii.express.couchuser.frontend.controls.logout",
                args:     [ "{that}"]
            },
            handleLogout: {
                funcName: "gpii.express.couchuser.frontend.controls.handleLogout",
                args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            toggleMenu: {
                funcName: "gpii.express.couchuser.frontend.controls.toggleMenu",
                args:     [ "{that}"]
            },
            handleLogoutKeys: {
                funcName: "gpii.express.couchuser.frontend.controls.handleLogoutKeys",
                args:     [ "{that}", "{arguments}.0"]
            },
            handleMenuKeys: {
                funcName: "gpii.express.couchuser.frontend.controls.handleMenuKeys",
                args:     [ "{that}", "{arguments}.0"]
            },
            handleToggleKeys: {
                funcName: "gpii.express.couchuser.frontend.controls.handleToggleKeys",
                args:     [ "{that}", "{arguments}.0"]
            }
        },
        events: {
            markupLoaded: null
        },
        listeners: {
            "{templates}.events.templatesLoaded": [
                {
                    funcName: "gpii.express.couchuser.frontend.controls.refresh",
                    args:     ["{that}"]
                }
            ],
            markupLoaded: [
                {
                    "this":   "{that}.dom.logout",
                    "method": "click",
                    "args":   "{that}.logout"
                },
                {
                    "this":   "{that}.dom.logout",
                    "method": "keydown",
                    "args":   "{that}.handleLogoutKeys"
                },
                {
                    "this":   "{that}.dom.toggle",
                    "method": "click",
                    "args":   "{that}.toggleMenu"
                },
                {
                    "this":   "{that}.dom.toggle",
                    "method": "keydown",
                    "args":   "{that}.handleToggleKeys"
                },
                {
                    "this":   "{that}.dom.menu",
                    "method": "keydown",
                    "args":   "{that}.handleMenuKeys"
                }
            ]
        }
    });
})(jQuery);