/**
 * ============================================================================
 * donate.js — 打赏/捐赠功能组件
 * ============================================================================
 *
 * 【功能说明】
 *   在博客文章底部提供打赏入口。用户选择支付方式（微信/支付宝等）后，
 *   弹出对应的收款二维码，同时其他区域变模糊以突出二维码。
 *
 * 【技术方案】
 *   - 使用 jQuery 控制 DOM 的显示/隐藏和动画效果
 *   - 通过 CSS 类 .showQR / .hideQR 控制二维码的滑入/滑出动画
 *   - 点击二维码外层区域可关闭二维码弹窗
 *   - 支持比特币地址一键复制（通过 ClipboardJS 库）
 *
 * 【页面结构依赖】
 *   页面需要以下 DOM 元素：
 *     #QRBox     — 二维码弹窗容器
 *     #MainBox   — 二维码显示区域（背景图片为二维码）
 *     #donateBox — 支付方式选择列表（li 元素，qr 属性指向二维码图片地址）
 *     #BTC       — 比特币地址按钮
 *
 * ============================================================================
 */

// 页面 DOM 加载完成后执行
$(document).ready(function () {
    // 缓存常用的 DOM 元素引用
    var QRBox = $('#QRBox');     // 二维码弹窗容器
    var MainBox = $('#MainBox'); // 二维码图片显示区域

    /**
     * 显示打赏二维码
     * 1. 如果传入了 QR 图片地址，将其设为 MainBox 的背景图
     * 2. 将捐赠文字、支付方式列表等区域添加模糊效果
     * 3. 淡入显示二维码弹窗，然后添加 showQR 类触发滑入动画
     *
     * @param {string} QR - 二维码图片的 URL
     */
    function showQR(QR) {
        if (QR) {
            // 将二维码设为背景图片
            MainBox.css('background-image', 'url(' + QR + ')');
        }
        // 添加模糊效果到文字和支付方式区域
        $('#DonateText,#donateBox,#github').addClass('blur');

        // 淡入显示二维码弹窗（300ms 动画）
        QRBox.fadeIn(300, function (argument) {
            // 淡入完成后添加 showQR 类，触发滑入动画
            MainBox.addClass('showQR');
        });
    }

    // ============================================================
    //  支付方式按钮点击事件
    //  读取 li 元素的 qr 属性获取对应的二维码图片地址
    // ============================================================
    $('#donateBox>li').click(function (event) {
        var thisQR = $(this).attr('qr');
        if (thisQR) {
            showQR(thisQR);
        }
    });

    // ============================================================
    //  点击二维码区域关闭弹窗
    //  先触发滑出动画 → 延迟 600ms 后淡出 → 移除模糊效果
    // ============================================================
    MainBox.click(function (event) {
        // 移除 showQR 类，添加 hideQR 类触发滑出动画
        MainBox.removeClass('showQR').addClass('hideQR');

        // 延迟 600ms 等待滑出动画完成
        setTimeout(function (a) {
            // 淡出二维码弹窗（300ms）
            QRBox.fadeOut(300, function (argument) {
                // 移除 hideQR 类，恢复初始状态
                MainBox.removeClass('hideQR');
            });
            // 移除模糊效果，恢复文字和支付方式区域的清晰度
            $('#DonateText,#donateBox,#github').removeClass('blur');
        }, 600);
    });
});

// ============================================================
//  比特币地址一键复制功能
//  使用 ClipboardJS 库实现点击按钮自动复制比特币地址到剪贴板
// ============================================================
!function (e, t, a) {
    // 获取当前 script 元素（用于读取 successText 属性）
    var script = document.currentScript || (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1]
    })()

    // 读取复制成功后的提示文字（可自定义）
    var successText = $(script).attr("successtext")

    // 初始化 ClipboardJS，监听 #BTC 按钮的点击
    var clipboard = new ClipboardJS('#BTC');

    // 复制成功回调
    clipboard.on('success',
        function (e) {
            console.log(successText)
            if (successText) {
                // 使用 toastr 库在页面顶部居中显示成功提示，1 秒后自动消失
                toastr.options = {
                    "positionClass": "toast-top-center",
                    "timeOut": "1000",
                }
                toastr.success(successText)
            }
        });
}(window, document);
