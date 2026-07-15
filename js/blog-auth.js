/**
 * blog-auth.js
 * 在每个页面头部注入此脚本，实现登录拦截 + 角色权限控制
 *
 * 使用方式（二选一）：
 *   A. 在 Hexo 主题的 layout 文件 <head> 末尾引入：
 *      <script src="/js/blog-auth.js"></script>
 *
 *   B. 直接把此文件内容内联到 <head> 的 <script> 标签里
 */

(function () {
  "use strict";

  // ================================================================
  //  ⚙️ 配置区 — 与 login.html 保持一致
  // ================================================================
  var AUTH_CONFIG = {
    loginPage  : "/login.html",   // 登录页路径（相对于网站根）
    sessionKey : "blog_role",     // sessionStorage 中存储角色的 key
    tsKey      : "blog_login_ts", // 存储登录时间戳的 key
    maxAge     : 24 * 60 * 60 * 1000,  // 登录有效期：24 小时（毫秒）
    // 不需要登录也能访问的路径前缀（login 页自身必须在此列表）
    publicPaths: ["/login.html", "/login/index.html"]
  };
  // ================================================================

  var currentPath = window.location.pathname;

  // 非登录页：先隐藏页面，防止未登录时内容闪出
  var isLoginPage = AUTH_CONFIG.publicPaths.some(function (p) {
    return currentPath === p || currentPath.indexOf(p) === 0;
  });
  if (!isLoginPage) {
    document.documentElement.style.visibility = "hidden";
  }

  // 判断当前页是否是公开页（不需要登录）
  function isPublicPage() {
    return AUTH_CONFIG.publicPaths.some(function (p) {
      return currentPath === p || currentPath.indexOf(p) === 0;
    });
  }

  // 检查登录态是否有效
  function getLoginState() {
    var role = sessionStorage.getItem(AUTH_CONFIG.sessionKey);
    var ts   = parseInt(sessionStorage.getItem(AUTH_CONFIG.tsKey) || "0", 10);
    if (!role || !ts) return null;
    if (Date.now() - ts > AUTH_CONFIG.maxAge) {
      // 过期：清除
      sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
      sessionStorage.removeItem(AUTH_CONFIG.tsKey);
      return null;
    }
    return role; // "admin" 或 "user"
  }

  // 重定向到登录页（把当前 URL 作为 from 参数带过去）
  function redirectToLogin() {
    var from = encodeURIComponent(window.location.href);
    window.location.replace(AUTH_CONFIG.loginPage + "?from=" + from);
  }

  // ----- 主逻辑 -----
  if (isPublicPage()) return;  // 公开页（登录页），放行

  var role = getLoginState();
  if (!role) {
    // 未登录 → 跳转登录页（页面已隐藏，不会闪烁）
    redirectToLogin();
    return;
  }

  // 已登录 → 显示页面
  document.documentElement.style.visibility = "";

  // ================================================================
  //  角色权限控制
  //  在文章/页面中，用 HTML 注释标记仅管理员可见的区域：
  //
  //  <!-- admin-only-start -->
  //  （这里是管理员专属内容）
  //  <!-- admin-only-end -->
  //
  //  普通用户访问时，此区域会被替换为提示文字并隐藏。
  // ================================================================
  if (role !== "admin") {
    // 等 DOM 就绪后再处理
    document.addEventListener("DOMContentLoaded", function () {
      hideAdminOnlyContent();
    });
  }

  // 暴露当前角色，方便主题模板读取（如显示"管理员"徽章）
  window.BLOG_ROLE = role;

  // 可选：在控制台显示登录状态（调试用，上线后可删除）
  // console.info("[blog-auth] 当前角色：" + role);


  // ================================================================
  //  内部函数
  // ================================================================

  /**
   * 隐藏 HTML 注释标记的管理员专属内容
   * 兼容 innerHTML 中已渲染的内容
   */
  function hideAdminOnlyContent() {
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    var startNodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim() === "admin-only-start") {
        startNodes.push(node);
      }
    }

    startNodes.forEach(function (startNode) {
      var curr = startNode.nextSibling;
      var toRemove = [startNode];

      while (curr) {
        toRemove.push(curr);
        if (
          curr.nodeType === Node.COMMENT_NODE &&
          curr.nodeValue.trim() === "admin-only-end"
        ) {
          break;
        }
        curr = curr.nextSibling;
      }

      // 插入替换提示
      var placeholder = document.createElement("div");
      placeholder.style.cssText =
        "border:1.5px dashed #e0e0e0; border-radius:8px; padding:12px 16px;" +
        "color:#aaa; font-size:13px; text-align:center; margin:12px 0;";
      placeholder.innerHTML = "🔒 此内容仅管理员可见";

      var parent = startNode.parentNode;
      parent.insertBefore(placeholder, startNode);
      toRemove.forEach(function (n) { parent.removeChild(n); });
    });
  }

})();
