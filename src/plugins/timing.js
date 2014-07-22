/**
 * @file 获取网页加载时间点（需浏览器支持 timing api）
 * @author zhujl
 */
(function (global) {

    'use strict';

    /**
     * 计算渲染页面的各个时间点
     *
     * @inner
     * @return {Object}
     */
    function getTiming() {

        var performance = window.performance
                       || window.msPerformance
                       || window.webkitPerformance
                       || window.mozPerformance
                       || { };

        var timing = performance.timing;
        var result = { };

        if (timing) {

            for (var key in timing) {
                result[key] = timing[key];
            }

            if (result.firstPaint == null) {

                var chrome = window.chrome;

                if (chrome && chrome.loadTimes) {
                    result.firstPaint = chrome.loadTimes().firstPaintTime * 1000;
                }
                else if (typeof result.msFirstPaint === 'number') {
                    result.firstPaint = result.msFirstPaint;
                    delete result.msFirstPaint;
                }
            }
        }

        return result;
    }

    var exports = {

        /**
         * onload 事件后调用
         */
        ready: function () {
            var timing = getTiming();
            exports.data = {
                timing_navigationStart: timing.navigationStart,
                timing_unloadEventEnd: timing.unloadEventEnd,
                timing_redirectStart: timing.redirectStart,
                timing_redirectEnd: timing.redirectEnd,
                timing_fetchStart: timing.fetchStart,
                timing_domainLookupStart: timing.domainLookupStart,
                timing_domainLookupEnd: timing.domainLookupEnd,
                timing_connectStart: timing.connectStart,
                timing_connectEnd: timing.connectEnd,
                timing_requestStart: timing.requestStart,
                timing_responseStart: timing.responseStart,
                timing_responseEnd: timing.responseEnd,
                timing_domLoading: timing.domLoading,
                timing_domInteractive: timing.domInteractive,
                timing_domContentLoadedEventStart: timing.domContentLoadedEventStart,
                timing_domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
                timing_domComplete: timing.domComplete,
                timing_loadEventStart: timing.loadEventStart,
                timing_loadEventEnd: timing.loadEventEnd,
                timing_firstPaint: timing.firstPaint
            };
        }

    };

    global.WAT.register('timing', exports);

})(this);