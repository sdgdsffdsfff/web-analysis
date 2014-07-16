/**
 * @file 主模块
 * @author zhujl
 */
(function (global) {

    'use strict';

    /**
     * onload 需要一次发送的数据
     *
     * @inner
     * @type {Object}
     */
    var data = { };

    /**
     * 遍历对象
     *
     * @inner
     * @param {Object} obj
     * @param {Function} callback
     */
    function each(obj, callback) {
        Object.keys(obj).forEach(
            function (name) {
                callback(obj[name], name);
            }
        );
    }

    /**
     * 发送请求
     *
     * @inner
     * @param {string} url 请求 url
     * @param {Object} data 请求数据
     */
    var send = (function () {

        var list = [ ];

        return function (url, data) {

            var queryArr = [ ];

            each(
                data,
                function (value, name) {
                    queryArr.push(
                        name + '=' + encodeURIComponent(value)
                    );
                }
            );

            var img = new Image();

            // 保持引用
            var index = list.push(img) - 1;

            img.onload =
            img.onerror = function () {
                // 清除引用
                img =
                img.onload =
                img.onerror = null;
                delete list[index];
            };

            // 加时间戳
            queryArr.push(Date.now().toString(36));

            img.src = url + '?' + queryArr.join('&');
        };
    })();


    window.addEventListener('load', pageReady, false);

    function pageReady(e) {

        window.removeEventListener('load', pageReady);
        exports.ready();

        data =
        pageReady = null;
    }

    var exports = {

        /**
         * 当前版本
         *
         * @type {string}
         */
        version: '0.0.1',

        /**
         * 页面 url
         *
         * @type {string}
         */
        pageUrl: document.URL,

        /**
         * 来源
         *
         * @type {string}
         */
        referrer: document.referrer,

        /**
         * 发送日志的地址
         *
         * @type {string}
         */
        url: '',

        /**
         * 插件
         *
         * @type {Object}
         */
        plugins: { },

        /**
         * 初始化，入口方法
         *
         * @param {Object} options 用户配置
         */
        init: function (options) {

            each(
                options,
                function (value, name) {
                    if (exports.plugins[name]) {
                        exports.plugins[name].init(value);
                    }
                    else {
                        exports[name] = value;
                    }
                }
            );

        },

        /**
         * 页面 load 之后执行
         */
        ready: function () {

            each(
                exports.plugins,
                function (plugin, name) {
                    if (typeof plugin.ready === 'function') {
                        plugin.ready();
                    }
                }
            );

            data.pageUrl = exports.pageUrl;
            data.referrer = exports.referrer;

            exports.info(data);
        },


        /**
         * 添加页面 load 之后需要发送的数据
         *
         * @param {string|Object} name
         * @param {*=} value
         */
        addData: function (name, value) {
            if (arguments.length === 1) {
                each(
                    name,
                    function (value, name) {
                        data[name] = value;
                    }
                );
            }
            else {
                data[name] = value;
            }
        }
    };


    [ 'debug', 'info', 'warn', 'error' ].forEach(
        function (type) {
            exports[type] = function (data) {
                data.logType = type;
                send(exports.url, data);
            };
        }
    );


    global.WAT = exports;

})(this);