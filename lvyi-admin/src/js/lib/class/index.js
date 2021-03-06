define("lib/class/index", [], function (require, exports, module) {
    "use strict";
    // 对象继承基类
    module.exports = (function () {
        var initializing = false,
            fnTest = /xyz/.test(function () {
                xyz;
            }) ? /\b_super\b/ : /.*/;

        var Class = function () {};
        //类扩展
        var extend = Class.extend = function (prop) {
            var _super = this.prototype;

            initializing = true;
            var prototype = new this();
            initializing = false;

            for (var name in prop) {
                prototype[name] = typeof prop[name] === "function" &&
                    typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                    (function (name, fn) {
                        return function () {
                            var tmp = this._super;
                            this._super = _super[name];
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name]) : prop[name];
            }

            function Class() {
                if (!initializing && this.init) {
                    var result = this.init.apply(this, arguments);
                    if (typeof result !== "undefined")
                        return result;
                }
            }

            Class.prototype = prototype;
            Class.constructor = Class;
            Class.extend = extend;

            return Class;
        };

        return Class;
    })();
});