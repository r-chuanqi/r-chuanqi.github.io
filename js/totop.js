/**
 * ============================================================================
 * totop.js — 回到顶部按钮
 * ============================================================================
 *
 * 【功能说明】
 *   在页面右下角提供一个火箭图标按钮，当页面滚动超过 500px 后自动显示。
 *   点击后以平滑动画滚动回页面顶部，按钮同时播放"发射"动画。
 *
 * 【技术方案】
 *   - 监听 window.scroll 事件，根据 scrollTop 值控制按钮显示/隐藏
 *   - 使用 jQuery.animate() 实现平滑滚动动画（500ms）
 *   - 通过 CSS 类 .show 控制可见性，.launch 控制发射动画
 *
 * 【页面结构依赖】
 *   页面需要一个 id="rocket" 的 DOM 元素作为回到顶部按钮
 *
 * ============================================================================
 */

// 监听页面滚动事件：超过 500px 时显示按钮，否则隐藏
$(window).scroll(function() {
    $(window).scrollTop() > 500 ? $("#rocket").addClass("show") : $("#rocket").removeClass("show");
});

// 点击回到顶部按钮
$("#rocket").click(function() {
    // 添加 .launch 类触发发射动画
    $("#rocket").addClass("launch");

    // 使用 jQuery animate 平滑滚动到页面顶部
    // scrollTop: 0  → 目标位置为页面最顶部
    // 500          → 动画持续 500ms
    $("html, body").animate({
        scrollTop: 0
    }, 500, function() {
        // 动画完成后移除 .show 和 .launch 类，隐藏按钮
        $("#rocket").removeClass("show launch");
    });

    // 阻止默认行为和事件冒泡
    return false;
});
