/**
 * @file 主模块
 * @author zhujl
 */
(function (global) {

    'use strict';

    /**
     * 绑定事件
     *
     * @inner
     * @type {Function}
     */
    var on;

    /**
     * 解绑事件
     *
     * @inner
     * @type {Function}
     */
    var off;

    if (window.addEventListener) {
        on = function (element, type, handler) {
            element.addEventListener(type, handler, false);
        };
        off = function (element, type, handler) {
            element.removeEventListener(type, handler);
        };
    }
    else {
        on = function (element, type, handler) {
            element.attachEvent('on' + type, handler);
        };
        off = function (element, type, handler) {
            element.detachEvent('on' + type, handler);
        };
    }

    /**
     * 遍历对象
     *
     * @inner
     * @param {Object} target
     * @param {Function} callback
     */
    function each(target, callback) {
        if ('length' in target) {
            for (var i = 0, len = target.length; i < len; i++) {
                callback(target[i], i);
            }
        }
        else {
            for (var key in target) {
                if (target.hasOwnProperty(key)) {
                    callback(target[key], key);
                }
            }
        }
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
            queryArr.push((+new Date()).toString(36));

            img.src = url + '?' + queryArr.join('&');
        };
    })();

    /// 在触发 load 事件后发送数据
    on(window, 'load', function pageReady() {
        off(window, 'load', pageReady);
        exports.ready();
    });

    // 监控 js 报错
    on(window, 'error', function (e) {

        var data = {
            from: 'js'
        };

        // IE 可能是字符串
        if (!e || typeof e === 'string') {
            e = window.event;
            data.msg = e.errorMessage;
            data.line = e.errorLine;
            data.col = e.errorCharacter;
        }
        else {
            data.msg = e.message;
            data.line = e.lineno;
            data.col = e.colno;
        }

        exports.error(data);
    });


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
                    var plugin = exports.plugins[name];
                    if (plugin && typeof plugin.init === 'function') {
                        plugin.init(value);
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

            var data = { };

            each(
                exports.plugins,
                function (plugin, name) {
                    if (typeof plugin.ready === 'function') {

                        plugin.ready();

                        if (plugin.data) {
                            each(
                                plugin.data,
                                function (value, key) {
                                    if (value != null) {
                                        data[key] = value;
                                    }
                                }
                            );
                        }

                    }
                }
            );

            data.pageUrl = exports.pageUrl;
            data.referrer = exports.referrer;

            exports.info(data);
        }

    };


    each(
        ['debug', 'info', 'warn', 'error'],
        function (type) {
            exports[type] = function (data) {
                data.logType = type;
                send(exports.url, data);
            };
        }
    );


    global.WAT = exports;

})(this);