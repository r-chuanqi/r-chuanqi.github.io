/**
 * ============================================================================
 * blog-auth.js — 智能知识库学习考试系统：前端登录鉴权 & 角色权限控制
 * ============================================================================
 *
 * 【功能概述】
 *   本脚本在每个页面 <head> 中注入，实现以下核心功能：
 *   1. 登录拦截 — 未登录用户访问任何受保护页面，自动跳转到登录页；
 *   2. 角色权限控制 — 管理员和普通用户看到的内容不同；
 *   3. 页面闪烁防护 — 在验证登录态之前隐藏页面，防止未登录内容闪现；
 *   4. 登录态过期 — 超过 24 小时自动清除登录态，要求重新登录；
 *   5. Admin-only 内容隐藏 — 普通用户看不到"仅管理员可见"的文章和段落。
 *
 * 【技术方案】
 *   - 登录态存储在 sessionStorage 中（关闭浏览器标签页即失效）
 *   - 使用 TreeWalker API 遍历 DOM 注释节点，实现无需后端的内容级权限控制
 *   - 支持文章级隐藏（data-admin-only-page）和段落级隐藏（HTML 注释标记）
 *
 * 【安全性说明】
 *   - sessionStorage 是浏览器本地存储，不会被发送到服务器
 *   - 仅作为前端层面的访问控制，不替代后端鉴权
 *   - HTML 注释标记在页面渲染后会被移除，普通用户无法通过查看源码获取隐藏内容
 *
 * 【配置依赖】
 *   - AUTH_CONFIG 中的密码需与 source/login.html 中的 CONFIG 保持一致
 *   - loginPage 路径指向登录页面的实际部署路径
 *
 * 【使用方式（二选一）】
 *   方案A. 在 Hexo 主题的 layout 文件 <head> 末尾引入（推荐）：
 *       <script src="/js/blog-auth.js"></script>
 *
 *   方案B. 直接把本文件内容内联到 <head> 的 <script> 标签里：
 *       <script>（将本文件全部内容粘贴在此处）</script>
 *
 * 【文件位置】
 *   source/js/blog-auth.js → 生成后部署到 /js/blog-auth.js
 *
 * ============================================================================
 *  版本：v2.0
 *  更新：2024年 — 增加文章级 admin-only 拦截（data-admin-only-page）
 * ============================================================================
 */

(function () {
  "use strict";

  // ================================================================
  //  ⚙️ 全局配置区 — 修改此处的参数以适配不同的部署环境
  //  注意：loginPage 路径需与网站实际路径一致
  // ================================================================
  var AUTH_CONFIG = {
    // 登录页面的访问路径（相对于网站根目录）
    loginPage  : "/login.html",

    // sessionStorage 中存储当前用户角色的 key 名称
    sessionKey : "blog_role",

    // sessionStorage 中存储登录时间戳的 key 名称
    // 用于判断登录是否过期（超过 maxAge 则失效）
    tsKey      : "blog_login_ts",

    // 登录有效期（毫秒），当前设为 24 小时
    // 超过此时间后，用户需重新登录
    maxAge     : 24 * 60 * 60 * 1000,

    // 公开访问路径列表：不需要登录即可访问的页面
    // 登录页自身和可能的别名路径必须在此数组中
    publicPaths: ["/login.html", "/login/index.html"]
  };
  // ================================================================

  // 获取当前页面的路径部分（如 /index.html）
  var currentPath = window.location.pathname;

  // ================================================================
  //  第一步：非登录页默认隐藏
  //  判断当前页面是否为公开页（登录页），如果不是，先将整个页面隐藏
  //  目的是防止在 JS 判断登录态之前，页面内容短暂"闪现"给未登录用户
  //  验证通过后再恢复可见（将 visibility 设为空字符串即可）
  // ================================================================
  var isLoginPage = AUTH_CONFIG.publicPaths.some(function (p) {
    return currentPath === p || currentPath.indexOf(p) === 0;
  });
  if (!isLoginPage) {
    document.documentElement.style.visibility = "hidden";
  }

  /**
   * 判断当前页面是否为公开页面（不需要登录验证）
   * 遍历 publicPaths 数组，检查当前路径是否以任一公开路径开头
   * @returns {boolean} true 表示公开页，false 表示需要登录
   */
  function isPublicPage() {
    return AUTH_CONFIG.publicPaths.some(function (p) {
      return currentPath === p || currentPath.indexOf(p) === 0;
    });
  }

  /**
   * 获取当前登录状态
   * 从 sessionStorage 读取角色和时间戳，校验是否在有效期内
   *
   * @returns {string|null}
   *   返回 "admin" — 管理员已登录
   *   返回 "user"  — 普通用户已登录
   *   返回 null    — 未登录或登录已过期
   */
  function getLoginState() {
    // 读取角色信息
    var role = sessionStorage.getItem(AUTH_CONFIG.sessionKey);
    // 读取登录时间戳，转成数字（默认为 0）
    var ts   = parseInt(sessionStorage.getItem(AUTH_CONFIG.tsKey) || "0", 10);

    // 角色或时间戳不存在 → 未登录
    if (!role || !ts) return null;

    // 当前时间减去登录时间，判断是否超过有效期
    if (Date.now() - ts > AUTH_CONFIG.maxAge) {
      // 已过期：清除存储的两个 key
      sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
      sessionStorage.removeItem(AUTH_CONFIG.tsKey);
      return null;
    }

    // 有效 → 返回角色类型
    return role;
  }

  /**
   * 重定向到登录页面
   * 将当前页面完整 URL 作为 from 参数带上，
   * 以便登录成功后能返回到原始访问页面
   */
  function redirectToLogin() {
    var from = encodeURIComponent(window.location.href);
    window.location.replace(AUTH_CONFIG.loginPage + "?from=" + from);
  }

  // ================================================================
  //  ═══════════ 主流程 ═══════════
  //  执行顺序：公开页放行 → 未登录跳转 → 已登录显示 → 权限过滤
  // ================================================================

  // 如果是公开页（登录页自身），直接退出脚本，不做任何拦截
  if (isPublicPage()) return;

  // 检查登录态，如果未登录则跳转到登录页
  var role = getLoginState();
  if (!role) {
    // 未登录：跳转登录页
    // 此时页面仍处于 visibility:hidden 状态，用户看不到任何内容
    redirectToLogin();
    return;
  }

  // 登录验证通过：恢复页面可见性
  // 将 visibility 设为空字符串，恢复 CSS 默认值（可见）
  document.documentElement.style.visibility = "";

  // ================================================================
  //  角色权限控制
  //
  //  【文章级权限】
  //  在 .md 文件的 Front-matter 中添加 admin_only: true
  //  主题模板会为此文章输出 data-admin-only-page 属性和 post-admin-only CSS 类
  //  普通用户访问时，本脚本会：
  //    1. 直接重定向到首页（文章详情页）
  //    2. 从列表页中移除该文章条目
  //
  //  【段落级权限】
  //  在文章 Markdown 中，用 HTML 注释标记管理员专属段落：
  //
  //    <!-- admin-only-start -->
  //    （这里是管理员才能看到的内容区域）
  //    <!-- admin-only-end -->
  //
  //  普通用户访问时，标记之间的内容会被替换为：
  //    🔒 此内容仅管理员可见
  //
  // ================================================================
  if (role !== "admin") {
    // 等 DOM 完全加载后再执行权限过滤逻辑
    // 因为 DOM 节点中的注释标记需要在页面渲染后才能被 TreeWalker 遍历到
    document.addEventListener("DOMContentLoaded", function () {
      hideAdminOnlyContent();
    });
  }

  // 将当前登录角色暴露为全局变量 BLOG_ROLE
  // 主题模板可通过此变量判断角色并渲染不同的 UI 元素
  window.BLOG_ROLE = role;

  // 可选：在浏览器控制台显示当前登录状态（调试用，生产环境可注释掉）
  // console.info("[blog-auth] 当前角色：" + role);


  // ================================================================
  //  ═══════════ 内部函数 ═══════════
  // ================================================================

  /**
   * 对普通用户隐藏管理员专属内容
   *
   * 分三个层级处理：
   *   L1 — 文章详情页：整篇文章标记为 admin-only，直接 302 重定向到首页
   *   L2 — 文章列表页：移除带有 post-admin-only 类的整篇文章条目
   *   L3 — 段落级隐藏：扫描 DOM 中的 HTML 注释标记，替换隐藏内容
   *
   * 【实现原理】
   *   L1: 检测页面中是否存在 data-admin-only-page 属性的元素
   *   L2: 查找所有 .post.post-admin-only 元素并移除
   *   L3: 使用 document.createTreeWalker 以 NodeFilter.SHOW_COMMENT 模式
   *       遍历 DOM 树中的所有注释节点，找到 <!-- admin-only-start -->
   *       和 <!-- admin-only-end --> 配对标记，将其间的内容替换为提示占位符
   */
  function hideAdminOnlyContent() {
    // --- L1: 文章级拦截 ---
    // 检查页面是否包含 data-admin-only-page 标记
    // 如果存在，说明当前页面是一篇管理员专属文章，普通用户无权查看
    var adminOnlyPage = document.querySelector("[data-admin-only-page]");
    if (adminOnlyPage) {
      // 直接重定向到首页，用户不会看到任何文章内容
      window.location.replace("/");
      return;
    }

    // --- L2: 列表级隐藏 ---
    // 在首页或归档页面，查找所有带 post-admin-only 类的文章条目
    // 将其从 DOM 树中完全移除，普通用户看到的列表就不包含这些文章
    var adminOnlyPosts = document.querySelectorAll(".post.post-admin-only");
    adminOnlyPosts.forEach(function (el) {
      el.remove();
    });

    // --- L3: 段落级隐藏 ---
    // 使用 TreeWalker API 遍历 DOM 中的所有注释节点
    // NodeFilter.SHOW_COMMENT: 只遍历注释类型的节点（<!-- ... -->）
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    // 收集所有标记为 "admin-only-start" 的起始注释节点
    var startNodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim() === "admin-only-start") {
        startNodes.push(node);
      }
    }

    // 对每个起始标记：收集起始标记到结束标记之间的所有兄弟节点，整体替换
    startNodes.forEach(function (startNode) {
      var curr = startNode.nextSibling;   // 从起始注释的下一个兄弟节点开始
      var toRemove = [startNode];         // 待移除节点列表，先加入起始标记本身

      // 向后遍历兄弟节点，直到遇到结束标记
      while (curr) {
        toRemove.push(curr);
        if (
          curr.nodeType === Node.COMMENT_NODE &&
          curr.nodeValue.trim() === "admin-only-end"
        ) {
          // 找到结束标记，停止遍历
          break;
        }
        curr = curr.nextSibling;
      }

      // 创建占位提示元素：虚线边框 + 灰色文字 + 锁图标
      var placeholder = document.createElement("div");
      placeholder.style.cssText =
        "border:1.5px dashed #e0e0e0; border-radius:8px; padding:12px 16px;" +
        "color:#aaa; font-size:13px; text-align:center; margin:12px 0;";
      placeholder.innerHTML = "🔒 此内容仅管理员可见";

      // 在起始标记位置插入占位符，然后移除所有 collected 节点
      var parent = startNode.parentNode;
      parent.insertBefore(placeholder, startNode);
      toRemove.forEach(function (n) { parent.removeChild(n); });
    });
  }

})();
