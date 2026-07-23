/**
 * ============================================================================
 * share.js — 文章分享组件
 * ============================================================================
 *
 * 【功能说明】
 *   在博客文章页面上提供社交平台分享功能。点击分享按钮后，弹出分享面板，
 *   包含当前文章链接、Twitter/Facebook/微博分享入口、以及 QR 二维码。
 *
 * 【技术方案】
 *   - 使用 jQuery 事件代理，监听 body 和 .article-share-link 的点击事件
 *   - 动态创建分享面板 DOM（通过模板字符串拼接 HTML）
 *   - 点击空白区域自动关闭分享面板
 *   - 每个文章有独立的分享面板（通过 data-id 标识）
 *
 * 【数据结构】
 *   .article-share-link 元素的 data 属性：
 *     data-url    — 文章分享链接
 *     data-qrcode — 文章二维码图片地址
 *     data-id     — 文章唯一标识（用于区分不同文章的分享面板）
 *
 * ============================================================================
 */

(function($){

  // ============================================================
  //  全局点击事件：点到分享面板外部时，关闭已打开的面板
  // ============================================================
  $('body')
    .on('click', function(){
      // 移除所有已打开的分享面板的 .on 类
      $('.article-share-box.on').removeClass('on');
    })

    // ============================================================
    //  分享按钮点击事件：打开/关闭分享面板
    //  e.stopPropagation() 阻止事件冒泡到 body，避免面板刚打开就被关闭
    // ============================================================
    .on('click', '.article-share-link', function(e){
      e.stopPropagation();

      // 读取分享按钮上携带的文章信息
      var $this = $(this),
        url        = $this.attr('data-url'),       // 文章链接
        qrcode_img = $this.attr('data-qrcode'),    // 二维码图片地址
        encodedUrl = encodeURIComponent(url),       // URL 编码后的链接（用于拼接到分享 URL）
        id         = 'article-share-box-' + $this.attr('data-id'),  // 面板唯一 ID
        title      = document.title,                // 页面标题
        offset     = $this.offset();                // 分享按钮的位置（用于定位面板）

      // 检查该文章对应的分享面板是否已存在
      if ($('#' + id).length){
        var box = $('#' + id);

        // 如果面板已经打开，点击第二次应关闭面板
        if (box.hasClass('on')){
          box.removeClass('on');
          return;
        }
      } else {
        // ============================================================
        //  首次打开：动态创建分享面板 DOM
        //  包含：链接输入框 + Twitter/Facebook/微博/二维码入口
        // ============================================================
        var html = [
          '<div id="' + id + '" class="article-share-box">',
            // 文章链接输入框（可直接复制）
            '<input class="article-share-input" value="' + url + '">',
            '<div class="article-share-links">',
              // Twitter 分享链接
              '<a href="//twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"></a>',
              // Facebook 分享链接
              '<a href="//www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"></a>',
              // 微博分享链接（title + url）
              '<a href="//service.weibo.com/share/share.php?title=' + title + '&url=' + encodedUrl + '&searchPic=true&style=number' + '" class="article-share-weibo" target="_blank" title="Weibo"></a>',
              // QR 二维码入口
              '<a href="' + qrcode_img + '" class="article-share-qrcode" target="_blank" title="QR code"></a>',
              '<div class="qrcode"><img src=' + qrcode_img + '></div>',
            '</div>',
          '</div>'
        ].join('');

        // 将创建的 HTML 转为 jQuery 对象并挂载到 body
        var box = $(html);
        $('body').append(box);
      }

      // 隐藏其他已打开的面板（保证同时只有一个面板可见）
      $('.article-share-box.on').hide();

      // 定位面板：在分享按钮下方 25px 处
      box.css({
        top: offset.top + 25,
        left: offset.left
      }).addClass('on');  // 显示面板

    })

    // ============================================================
    //  分享面板自身的点击事件：阻止冒泡，防止面板内部点击触发关闭
    // ============================================================
    .on('click', '.article-share-box', function(e){
      e.stopPropagation();
    })

    // 链接输入框点击：自动全选文字，方便用户复制
    .on('click', '.article-share-box-input', function(){
      $(this).select();
    })

    // 分享链接点击：在新窗口中打开（非弹窗模式已废弃，改为新标签打开）
    .on('click', '.article-share-box-link', function(e){
      e.preventDefault();
      e.stopPropagation();

      // 打开 500×450 的新窗口加载分享链接
      window.open(this.href, 'article-share-box-window-' + Date.now(), 'width=500,height=450');
    });

})(jQuery);
