/**
 * ============================================================================
 * copyright.js — 版权声明一键复制功能
 * ============================================================================
 *
 * 【功能说明】
 *   在博客文章底部提供版权声明文字的一键复制功能。
 *   用户点击版权区域的复制图标（.fa-clipboard）后，将整段版权文字
 *   复制到系统剪贴板，方便引用时附带来源信息。
 *
 * 【技术方案】
 *   - 使用 ClipboardJS 库监听 .fa-clipboard 元素的点击事件
 *   - 复制成功后使用 toastr 库显示 "复制成功" 提示
 *
 * 【依赖】
 *   - ClipboardJS 库（需在页面中提前引入）
 *   - toastr 库（用于成功提示弹窗）
 *
 * ============================================================================
 */

!function (e, t, a) {
    // 获取当前 script 标签元素，用于读取 successText 自定义属性
    var script = document.currentScript || (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1]
    })()

    // 读取复制成功后的提示文字（通过 script 标签的 successtext 属性配置）
    var successText = $(script).attr("successtext")

    // 初始化 ClipboardJS，监听 .fa-clipboard（版权复制按钮）的点击
    var clipboard = new ClipboardJS('.fa-clipboard');

    // 复制成功回调
    clipboard.on('success', function () {
        if (successText) {
            // 使用 toastr 在页面顶部居中显示成功提示，1 秒后自动消失
            toastr.options = {
                "positionClass": "toast-top-center",
                "timeOut": "1000",
            }
            toastr.success(successText)
        }
    });
}(window, document);
