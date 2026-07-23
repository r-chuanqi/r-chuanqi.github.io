/**
 * ============================================================================
 * codeblock-resizer.js — 代码块自适应宽度调整
 * ============================================================================
 *
 * 【功能说明】
 *   自动检测并调整代码块的宽度，使其填满容器。在以下两种场景尤为重要：
 *   1. 页面加载时 — 初次渲染代码块后调整宽度
 *   2. 窗口大小变化时 — 响应式调整，避免代码块溢出
 *
 * 【技术方案】
 *   - 构造函数模式：CodeBlockResizer 类封装了调整逻辑
 *   - 通过计算代码块容器、行号区（gutter）、代码区（code）的实际宽度，
 *     动态设置代码区的 CSS width 属性
 *   - 使用防抖（debounce）技术处理窗口 resize 事件，避免高频触发
 *
 * 【依赖】
 *   - jQuery（操作 DOM）
 *   - smartresize.js（提供防抖的 resize 事件）
 *
 * ============================================================================
 */

+function($) {
    'use strict';

    /**
     * 代码块宽度调整器构造函数
     * @param {string|Element} elem - 代码块的选择器或元素
     */
    var CodeBlockResizer = function(elem) {
        // 缓存 jQuery 选择器的结果
        this.$codeBlocks = $(elem);
    };

    // 原型方法
    CodeBlockResizer.prototype = {
        /**
         * 启动代码块宽度自适应功能
         * 1. 立即执行一次调整
         * 2. 绑定窗口 resize 事件（防抖处理）
         */
        run: function() {
            var self = this;

            // 初始调整：页面加载后立即调整所有代码块宽度
            self.resize();

            // 监听窗口大小变化事件（smartresize 提供防抖支持）
            $(window).smartresize(function() {
                self.resize();
            });
        },

        /**
         * 核心调整逻辑：遍历每个代码块并重新计算宽度
         *
         * 计算原理：
         *   代码块外层 width = gutter(行号) 宽度 + code(代码) 宽度
         *   目标是让 code 区域填满剩余空间：
         *     code 宽度 = 外层总宽度 - gutter 宽度 - 代码区域的 padding
         */
        resize: function() {
            var self = this;

            // 遍历每个代码块元素
            self.$codeBlocks.each(function() {
                var $gutter = $(this).find('.gutter');  // 行号区域
                var $code   = $(this).find('.code');    // 代码区域

                // 获取代码区域的 padding 值
                // .width() 返回不含 padding 的宽度，.innerWidth() 返回含 padding 的宽度
                // 差值即为左右 padding 之和
                var codePaddings = $code.width() - $code.innerWidth();

                // 计算代码区域应有的宽度：
                // 外层宽度 - 行号区域宽度 + padding（避免内容被截断）
                var width = $(this).outerWidth() - $gutter.outerWidth() + codePaddings;

                // 应用新宽度到代码区域和内部 <pre> 元素
                $code.css('width', width);
                $code.children('pre').css('width', width);
            });
        }
    };

    // DOM 加载完成后执行初始化
    $(document).ready(function() {

        // ============================================================
        //  注册 jQuery 工具方法：检测元素是否有水平滚动条
        //  使用方式：$('.selector').hasHorizontalScrollBar()
        // ============================================================
        $.fn.hasHorizontalScrollBar = function() {
            // scrollWidth 大于 innerWidth 说明内容溢出，存在水平滚动条
            return this.get(0).scrollWidth > this.innerWidth();
        };

        // 实例化代码块调整器，目标为所有 figure.highlight 元素
        var resizer = new CodeBlockResizer('figure.highlight');
        // 启动自适应调整
        resizer.run();
    });
}(jQuery);
