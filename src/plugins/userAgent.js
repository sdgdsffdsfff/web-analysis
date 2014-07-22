/**
 * @file 获取浏览器信息
 * @author zhujl
 */
(function (global) {

    'use strict';

    var exports = {

        /**
         * onload 事件后调用
         */
        ready: function () {
            exports.data = {
                userAgent: window.navigator.userAgent
            };
        }

    };

    global.WAT.register('userAgent', exports);

})(this);