define("lib/tpl-load/index", ["lib/jquery/index", "lib/mod-path/index", "lib/tpl/index", "lib/cache/index", "lib/control-loader/index", "lib/console/index"], function (require, exports, module) {
    "use strict";
    var $ = require("lib/jquery/index");
    var modPath = require("lib/mod-path/index");
    var tpl = require("lib/tpl/index");
    var Cache = require("lib/cache/index");
    var ControlLoader = require("lib/control-loader/index");
    var console = require("lib/console/index");

    var sep = ":";

    var globalCache = new Cache(true);
    var cache = new Cache(false);

    var readys = {};

    module.exports = function (path, callback, node) {
        if (typeof path !== "string") {
            callback(path);
            return;
        }

        var name = path.split(sep);
        var type = name.shift();
        var isNative = false;
        name = name.join(sep);

        if (!type) {
            console.error("tpl type error:" + path);
        }

        if (/^native\-/.test(type)) {
            isNative = true;
            type = type.replace(/^native\-/, "");
        }

        var _callback = function (template) {
            cache.set(path, template);
            callback(template);
        };

        if (cache.has(path)) {
            callback(cache.get(path));
        } else if (readys[path]) {
            readys[path].push(_callback);
        } else {
            switch (type) {
                case "static":
                    readys[path] = [_callback];
                    (function () {
                        function callback(template) {
                            readys[path].forEach(function (item) {
                                item(template);
                            });
                            delete readys[path];
                            //_callback(template);
                        }

                        if (globalCache.has(path)) {
                            callback(globalCache.get(path));
                        } else {
                            require.async(modPath(name), function (template) {
                                globalCache.set(path, template)
                                callback(template);
                            });
                        }
                    })();
                    break;
                case "url":
                    readys[path] = [_callback];
                    (function () {
                        function callback(template) {
                            if (!isNative) {
                                template = tpl.parse(template);
                            }
                            //_callback(template);
                            readys[path].forEach(function (item) {
                                item(template);
                            });
                            delete readys[path];
                        }

                        var absolutePath = (function (name) {
                            var path;

                            if (!/^\//.test(name)) {
                                path = location.pathname.split("/");
                                path.pop();
                                path.push(name);
                                name = path.join("/");
                            }

                            return "url:" + name;
                        })(name);

                        if (globalCache.has(absolutePath)) {
                            callback(globalCache.get(absolutePath));
                        } else {
                            $.ajax({
                                url: name,
                                success: function (template) {
                                    if (name.indexOf("?") === -1) {
                                        globalCache.set(absolutePath, template);
                                    }
                                    callback(template);
                                }
                            });
                        }
                    })();
                    break;
                case "selector":
                    (function (selector) {
                        var key = "template-cache:" + selector;
                        if (node.data(key)) {
                            callback(node.data(key));
                            return;
                        }

                        var target = ControlLoader.tool.parseNode(selector, node);
                        var template = target.is("textarea") ? target.text() : target.html();
                        if (!isNative) {
                            template = tpl.parse(template);
                        }
                        node.data(key, template);
                        // 此类型的模板不缓存
                        callback(template);
                    })(name);
                    break;
            }
        }
    };
});