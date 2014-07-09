/**
 * @file 性能对象，跟 HTML5 performance 结构相同
 * @author zhujl
 */
define(function (require, exports, module) {

    'use strict';

    /**
     * 浏览器类型和版本信息
     *
     * @inner
     * @type {Object}
     */
    var browser = require('./browser');

    var performance = window.performance
                   || window.msPerformance
                   || window.webkitPerformance
                   || window.mozPerformance
                   || { };

    var timing = performance.timing || { };
    var navigation = performance.navigation || { };

    /**
     * 对外暴露的 timing 对象
     * @type {Object}
     */
    var timingExports = { };

    /**
     * 对外暴露的 navigation 对象
     * @type {Object}
     */
    var navigationExports = {
        type: navigation.type,
        redirectCount: navigation.redirectCount
    };

    /**
     * 浏览器加载按以下顺序打点
     *
     * @inner
     * @type {Array}
     */
    var points = [
        'navigationStart',
        'unloadEventStart', 'unloadEventEnd',
        'redirectStart', 'redirectEnd',
        'fetchStart',
        'domainLookupStart', 'domainLookupEnd',
        'connectStart', 'connectEnd',
        'requestStart',
        'responseStart', 'responseEnd',
        'domLoading',
        'domInteractive',
        'domContentLoadedEventStart', 'domContentLoadedEventEnd',
        'domComplete',
        'loadEventStart', 'loadEventEnd'
    ];

    for (var i = 0, len = points.length, name; i < len; i++) {
        name = points[i];
        timingExports[name] = timing[name] || 0;
    }


    // ==================================================
    // 扩展 firstPaint 属性
    // 白屏时间可用 firstPaint - navigationStart
    // ==================================================
    var chrome = window.chrome;
    if (chrome && chrome.loadTimes) {
        timingExports.firstPaint = chrome.loadTimes().firstPaintTime;
    }
    else if (timing.msFirstPaint) {}
        timingExports.firstPaint = timing.msFirstPaint;
    }

    // =================================================
    // 解决 navigationStart 的兼容问题
    // =================================================

    // 火狐 7 8 有 bug
    if (browser.firefox
        && (browser.version == 7 || browser.version == 8)
    ) {
        // unloadEventStart
        // 如果被请求的文档来自于前一个同源（同源策略）的文档
        // 那么该属性存储的是浏览器开始卸载前一个文档的时刻
        // 否则（前一个文档非同源或者没有前一个文档）为0
        timingExports.navigationStart = timing.unloadEventStart
                                     || timing.fetchStart
                                     || 0;
    }

    if (!timingExports.navigationStart) {

        var value;

        // 谷歌工具栏(google toolbar)
        var gtbExternal = window.gtbExternal;

        if (chrome && chrome.csi) {
            value = chrome.csi().startE;
        }
        else if (gtbExternal && gtbExternal.startE) {
            value = gtbExternal.startE();
        }

        timingExports.navigationStart = value;
    }

    exports.timing = timingExports;
    exports.navigation = navigationExports;

});