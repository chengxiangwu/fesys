define("lib/cookie/index", ["lib/json/index"], function (require, exports, module) {
    "use strict";
    var JSON = require("lib/json/index");

    module.exports = {
        get: function (name) {
            if (!this.config.raw) {
                name = encodeURIComponent(name);
            }

            var cookiestring = "; " + document.cookie;
            var cookies = cookiestring.split("; " + name + "=");
            var value = null;
            if (cookies.length === 2) {
                value = cookies.pop().split(";").shift();
                if (!this.config.raw) {
                    value = decodeURIComponent(value);
                }
            }
            return value;
        },
        set: function (name, value, options) {
            if (typeof options.expires === 'number') {
                options.expires = new Date(new Date() + options.expires * 24 * 60 * 60 * 1000);
            }

            if (typeof value === "object") {
                value = JSON.stringify(value);
            }

            if (!this.config.raw) {
                name = encodeURIComponent(name);
                value = encodeURIComponent(value);
            }

            return (document.cookie = [
                name, '=', value,
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        },
        remove: function (name) {
            this.set(name, "", {
                expires: -1
            });
        },
        config: {
            raw: false
        }
    };
});