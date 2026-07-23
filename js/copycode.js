/**
 * ============================================================================
 * copycode.js — 代码块一键复制功能
 * ============================================================================
 *
 * 【功能说明】
 *   页面加载后，自动在每个代码块（.highlight .code pre）的上方添加一个
 *   复制按钮（📋 图标）。点击按钮即可将对应代码块的内容复制到系统剪贴板。
 *
 * 【技术方案】
 *   - 使用 ClipboardJS 库处理剪贴板复制操作（兼容性好）
 *   - 通过 CSS :before 伪元素+SVG 图标渲染按钮外观
 *   - 复制成功后使用 toastr 库显示 "复制成功" 提示
 *
 * 【依赖】
 *   - ClipboardJS 库（需在页面中提前引入）
 *   - toastr 库（用于成功提示弹窗）
 *
 * ============================================================================
 */

/* 页面载入完成后，为所有代码块创建复制按钮 */
!function (e, t, a) {
    // 获取当前 script 标签元素，用于读取自定义属性
    var script = document.currentScript || (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1]
    })()

    // 读取复制成功后的提示文字（通过 script 标签的 successtext 属性配置）
    var successText = $(script).attr("successtext")

    // ============================================================
    //  构建复制按钮的 HTML 片段
    //  使用 SVG 图标（复制文件图标），通过 CSS 类 .btn-copy 定位
    // ============================================================
    var copyHtml = '';
    copyHtml += '<div class="btn-copy" >';

    // 内嵌 SVG 图标：文件复制图标（来自 Ant Design Icons 的 copy 图标）
    copyHtml += '<svg viewBox="64 64 896 896" focusable="false" class="" data-icon="copy" width="1em" height="1em" fill="currentColor" aria-hidden="true">';
    copyHtml += '<path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z"></path>';
    copyHtml += '</svg>';
    copyHtml += '</div>';

    // 将复制按钮插入到每个代码块的高亮区域前面
    // .highlight .code pre 是 Hexo 代码高亮的标准结构
    $(".highlight .code pre").before(copyHtml);

    // ============================================================
    //  初始化 ClipboardJS
    //  当用户点击 .btn-copy 按钮时，复制其下一个兄弟元素的内容
    //  （按钮插入在 <pre> 之前，所以 nextElementSibling 就是 <pre>）
    // ============================================================
    var clipboard = new ClipboardJS('.btn-copy', {
        target: function (trigger) {
            // trigger 是按钮元素，nextElementSibling 是代码块的 <pre>
            return trigger.nextElementSibling;
        }
    });

    // 复制成功后的回调处理
    clipboard.on('success',
        function (e) {
            // 清除浏览器对复制文本的选中状态
            e.clearSelection();
            if (successText) {
                // 使用 toastr 在页面顶部居中显示提示，1 秒后自动消失
                toastr.options = {
                    "positionClass": "toast-top-center",
                    "timeOut": "1000",
                }
                toastr.success(successText)
            }
        });
}(window, document);
