/**
 * @file 获取屏幕大小
 * @author zhujl
 */
(function (global) {

    'use strict';

    var exports = {

        /**
         * onload 事件后调用
         */
        ready: function () {
            var screen = window.screen;
            exports.data = {
                screen_width: screen.width,
                screen_height: screen.height
            };
        }

    };

    global.WAT.register('screen', exports);

})(this);