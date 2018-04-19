define("lib/template/index", [], function (require, exports, module) {
    "use strict";
    var _ = function (obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    var breaker = {};
    var ArrayProto = Array.prototype;
    var slice = ArrayProto.slice;
    var ObjProto = Object.prototype
    var nativeForEach = ArrayProto.forEach;
    var toString = ObjProto.toString;
    var nativeKeys = Object.keys;

    var noMatch = /(.)^/;
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    var templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    var keys = nativeKeys || function (obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj)
            if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
        return keys;
    };

    var each = function (obj, iterator, context) {
        if (obj == null) return obj;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }

        }
        return obj;
    };

    var _defaults = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] === void 0) obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    _.template = function (text, data, settings) {
        var render;
        settings = _defaults({}, settings, templateSettings);

        var matcher = new RegExp([
            (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        var index = 0;
        var source = "__p+='";

        text && text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function (match) {
                    return '\\' + escapes[match];
                });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });

        source += "';\n";

        if (!settings.variable) source = 'if(data){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'data', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        };

        if (data) return render(data, _);
        var template = function (data) {
            return render.call(this, data, _);
        };

        template.source = 'function(' + (settings.variable || 'data') + '){\n' + source + '}';

        return template;
    }

    _.render = function (pTemplate, pData) {
        var _html = pTemplate;
        return _html.replace(/\%\{.*?\}/g, function (a, b) {
            var _key = a.replace(/\%|\{|\}/g, "");
            return pData.hasOwnProperty(_key) ? pData[_key] : a;
        });
    }

    module.exports = _;
});