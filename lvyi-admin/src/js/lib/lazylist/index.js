define("lib/lazylist/index", [], function (require, exports, module) {
    "use strict";
    /**
     * 等待多个异步方法执行完毕后执行某个方法
     */
    module.exports = function (list, callback) {
        var count = list.length,
            results = [];
        if (list && count > 0) {
            list.forEach(function (item, index) {
                item(function (result) {
                    results[index] = result;
                    count--;
                    if (count === 0) {
                        callback.apply(null, results);
                    }
                });
            });
        } else {
            callback();
        }
    };
});