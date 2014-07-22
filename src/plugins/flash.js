/**
 * @file 获取浏览器 flash player 版本
 * @author zhujl
 */
(function (global) {

    'use strict';

    var exports = {

        /**
         * onload 事件后调用
         */
        ready: function () {

            var installed = 0;
            var version;

            var plugins = navigator.plugins;
            if (plugins && plugins.length > 0) {
                var swf = plugins['Shockwave Flash'];
                if (swf) {
                    installed = 1;
                    version = swf.description;
                }
            }
            else if (document.all) {
                var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (swf) {
                    installed = 1;
                    version = swf.GetVariable('$version');
                }
            }

            exports.data = {
                flash_installed: installed,
                flash_version: version
            };
        }

    };

    global.WAT.register('flash', exports);

})(this);