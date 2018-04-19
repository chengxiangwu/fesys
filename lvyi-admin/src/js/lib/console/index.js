define("lib/console/index", [], function (require, exports, module) {
    "use strict";
    module.exports = typeof console === "undefined" ? {
        log: function () {},
        error: function () {},
        warn: function () {}
    } : console;
});