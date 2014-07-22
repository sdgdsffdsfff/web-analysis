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
        if (typeof target.pop === 'function') {
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
     * 扩展对象
     *
     * @inner
     * @param {Object} target
     * @param {Object=} source
     */
    function extend(target, source) {
        if (source) {
            each(
                source,
                function (value, key) {
                    target[key] = value;
                }
            );
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
                    if (value !== null) {
                        queryArr.push(
                            name + '=' + encodeURIComponent(value)
                        );
                    }
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
            queryArr.push('_t=' + (+new Date()).toString(36));

            img.src = url + '?' + queryArr.join('&');
        };
    })();

    /// 在触发 load 事件后发送数据
    on(window, 'load', function pageReady() {

        off(window, 'load', pageReady);

        // 使用延时的理由
        // 1. 不跟业务代码抢 onload 时间点，页面尽早可交互
        // 2. firstPaint（白屏时间）在 onload 读取可能是 0
        setTimeout(
            exports.ready,
            200
        );

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
         * @param {string} options.url 发送日志地址
         * @param {Object} options.data 需要发送的数据，比如 productName sessionId 之类的
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

            var data = {
                pageUrl: exports.pageUrl,
                referrer: exports.referrer
            };

            extend(data, exports.data);

            each(
                exports.plugins,
                function (plugin, name) {
                    if (typeof plugin.ready === 'function') {
                        plugin.ready();
                        extend(data, plugin.data);
                    }
                }
            );

            exports.info(data);
        },

        /**
         * 注册插件
         *
         * @param {string} name 插件名称
         * @param {Object} plugin 插件对象
         */
        register: function (name, plugin) {
            exports.plugins[name] = plugin;
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