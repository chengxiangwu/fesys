define("lib/json/index", [], function (require, exports, module) {
    "use strict";
    var hasJSON = typeof JSON !== "undefined" && JSON.stringify && JSON.parse;

    function stringify(data, isTran) {
        if (data === null) return 'null';
        if (typeof data === 'undefined') return 'undefined';

        var arr = [],
            value;
        switch (data.constructor) {
            case Object:
                for (var name in data)
                    arr.push(stringify(name) + ":" + stringify(data[name], isTran));
                return "{" + arr.join(",") + "}";
            case Array:
                for (var i = 0, l = data.length; i < l; i++)
                    arr[i] = stringify(data[i], isTran);
                return "[" + arr.join(",") + "]";
            case String:
                return '"' + data.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function () {
                    var a = arguments[0];
                    return (a == '\n') ? '\\n' : (a == '\r') ? '\\r' : (a == '\t') ? '\\t' : "";
                }) + '"';
            case Date:
                return "new Date(" + data.getTime() + ")";
            case Number:
            case Boolean:
            case Function:
            case RegExp:
                return isFinite(data) ? data.toString() : 'null';
            default:
                return "null";
        }
    }

    module.exports = {
        stringify: hasJSON && false ? JSON.stringify : stringify,
        parse: hasJSON && false ? JSON.parse : function (data) {
            if (typeof data !== "string" || !data) {
                return null;
            }
            try {
                return (new Function("return " + data.trim()))();
            } catch (e) {
                return null;
            }
        }
    };
});