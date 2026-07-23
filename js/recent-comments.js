/**
 * ============================================================================
 * recent-comments.js — 最新评论展示组件
 * ============================================================================
 *
 * 【功能说明】
 *   从 Waline 评论系统服务端异步获取最新评论列表，并渲染到侧边栏的
 *   "最新评论" 小部件中。每条评论显示时间、内容预览和评论者昵称。
 *
 * 【技术方案】
 *   - 通过 DOM 属性获取服务端地址和评论数量配置
 *   - 使用 AJAX 异步请求评论 API（GET /comment?type=recent）
 *   - 评论内容中可能包含 <a> 链接（回复他人时），需要解析链接标签
 *   - 格式化时间戳为本地化的日期时间字符串
 *
 * 【初始化】
 *   页面需包含一个带有 id="recent-comment" 的 DOM 元素，
 *   并设置 serverURL 和 count 两个属性：
 *
 *      <div id="recent-comment" serverURL="https://xxx" count="10"></div>
 *
 *   同时需要一个 id="widget-waline-list" 的容器来接收评论列表 HTML。
 *
 * ============================================================================
 */

!function () {
  // 从 DOM 元素读取配置：Waline 服务端地址
  let serverURL = document.getElementById("recent-comment").getAttribute("serverURL")

  // 从 DOM 元素读取配置：显示的评论数量（默认 10 条）
  let count = document.getElementById("recent-comment").getAttribute("count")
  if (!count) {
    count = 10
  }

  /**
   * 格式化日期时间为本地字符串
   * 例如：2024-10-24T11:14:46 → "2024/10/24 11:14:46"
   * @param {string} date - ISO 格式的日期字符串
   * @returns {string} 格式化后的本地化时间字符串
   */
  function format( date ) {
    return new Date(date).toLocaleString()
  }

  /**
   * 处理评论内容中的 HTML 链接标签
   * 当评论是回复他人的时候，评论内容中会包含类似以下的 HTML：
   *   <a href="xxx">回复 @某人</a> 这是回复内容...
   *
   * 本函数提取出链接地址和回复对象昵称，并返回纯文本格式的评论内容
   *
   * @param {string} commentStr - 原始评论内容（可能包含 HTML 标签）
   * @returns {object|string} 包含 href, author, str 的对象，或空字符串
   */
  function dealComment( commentStr ) {
    // 匹配 <a href="...">昵称</a> 的正则表达式
    let re = /<a[^>]*href=['"]([^\\"]*)['"][^>]*>(.*?)<\/a>/g;
    let arr = [];
    while (re.exec(commentStr) != null) {
      arr.push(RegExp.$1); // 匹配到的 href 属性值
      arr.push(RegExp.$2); // 匹配到的链接文字（回复对象的昵称）
    }
    if (arr.length > 0) {
      // 移除评论内容中的链接标签，保留纯文本回复内容
      commentStr = commentStr.replace(/<a[^>](.*?)<\/a>/, arr[1])
      return {
        href: arr[0],    // 回复链接地址
        author: arr[1],  // 回复对象昵称
        str: commentStr  // 纯文本评论内容
      }
    }
    return ''
  }

  // 发起 AJAX 请求获取最新评论列表
  $.ajax({
    url: serverURL + '/comment?type=recent',  // Waline API 端点
    dataType: 'json',
    data: {
      count  // 请求的评论数量
    },
    success: function ( response ) {
      // 构建评论列表的 HTML 片段
      let comments = '<ul>'

      // 遍历每条评论，构建列表项
      response.forEach(( comment, index ) => {
        // 序号 + 评论时间
        comments += '<li>' + (index + 1) + '、 ' + format(comment.insertedAt)

        // 判断是否为回复评论（有 pid 表示为回复）
        if (comment.pid) {
          // 回复类型的评论：解析出被回复对象和链接
          let {href, author, str} = dealComment(comment.comment)
          comments += '<div class="waline-comment-content"><a style="display: block" href=' + window.location.origin + comment.url + href + '>'+ str + '</a></div>'
        } else {
          // 普通评论：直接显示评论内容
          comments += '<div class="waline-comment-content"><a style="display: block" href=' + window.location.origin + comment.url + '#' + comment.objectId + '>' + comment.comment + '</a></div>'
        }

        // 显示评论者昵称（以 -- 前缀）
        comments += '<div class="waline-comment-content-author">' + '--' + comment.nick + '</div></li>'
      })

      comments += '</ul>'

      // 将构建好的 HTML 插入到侧边栏容器中
      $('#widget-waline-list').append(comments)
    },
  })
}()
