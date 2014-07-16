/**
 * @file 往返时间
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
         * 初始化
         *
         * @param {Object} options
         */
        init: function (options) {
            // 这里没啥可配置的...
        },

        /**
         * onload 事件后调用
         */
        ready: function () {
            WAT.addData(getTiming());
        }
    };


    WAT.plugins.RT = exports;

})(this);