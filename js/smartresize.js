/**
 * ============================================================================
 * smartresize.js — 智能防抖 window resize 事件
 * ============================================================================
 *
 * 【功能说明】
 *   为 jQuery 对象提供 .smartresize() 方法，代替原始的 $(window).resize()。
 *   通过防抖（debounce）技术，将高频的 resize 事件合并为低频回调，
 *   避免在拖拽窗口时触发大量不必要的计算。
 *
 * 【核心原理】
 *   防抖函数（debounce）：
 *     - 连续触发事件时，只执行最后一次
 *     - 如果两次触发间隔小于 threshold 毫秒，取消前一次的定时器
 *     - execAsap 参数可控制是否在第一次触发时立即执行
 *
 * 【使用方式】
 *   $(window).smartresize(function() {
 *     // 窗口大小变化后的处理逻辑（防抖后执行）
 *   });
 *
 * 【原始参考】
 *   John Hann 的 debounce 实现
 *   http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
 *
 * ============================================================================
 */

+(function($, sr) {
    /**
     * 防抖函数工厂
     * 返回一个防抖版本的函数，在连续调用时只在停止调用后执行一次
     *
     * @param {Function} func      — 需要防抖的原始函数
     * @param {number}   threshold — 防抖延迟时间（毫秒），默认 100ms
     * @param {boolean}  execAsap  — 是否在第一次触发时立即执行（而非等到停止后）
     * @returns {Function} 包装后的防抖函数
     */
    var debounce = function(func, threshold, execAsap) {
        var timeout; // 存储 setTimeout 的标识符

        return function debounced() {
            // 保存 this 上下文和 arguments 参数
            var obj = this, args = arguments;

            // 延迟执行的函数
            function delayed() {
                // 如果不是立即执行模式，在延迟结束后调用原始函数
                if (!execAsap) {
                    func.apply(obj, args);
                }
                // 清除定时器标识
                timeout = null;
            };

            // 如果已有未执行的定时器，取消它（重置防抖计时）
            if (timeout) {
                clearTimeout(timeout);
            }
            // 如果是立即执行模式且没有等待中的定时器，立即调用
            else if (execAsap) {
                func.apply(obj, args);
            }

            // 设置新的定时器，延迟执行
            timeout = setTimeout(delayed, threshold || 100);
        };
    };

    /**
     * 将 smartresize 方法注册到 jQuery.fn
     * fn 参数决定是绑定事件还是触发事件：
     *   - 传入函数 → 绑定防抖后的 resize 事件
     *   - 不传参数 → 手动触发 smartresize 事件
     */
    jQuery.fn[sr] = function(fn) {
        return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
    };
})(jQuery, 'smartresize');
