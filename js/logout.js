/**
 * logout.js
 * 提供退出登录功能
 *
 * 在页面中添加退出按钮：
 *   <button onclick="blogLogout()">退出登录</button>
 *
 * 或者在主题 layout 里引入本文件后使用：
 *   <a href="javascript:blogLogout()">退出</a>
 */

function blogLogout() {
  sessionStorage.removeItem("blog_role");
  sessionStorage.removeItem("blog_login_ts");
  window.location.replace("/login.html");
}

/**
 * 工具函数：获取当前登录角色
 * 返回 "admin" / "user" / null（未登录）
 */
function getBlogRole() {
  return sessionStorage.getItem("blog_role") || null;
}

/**
 * 在页面的指定容器里自动渲染身份信息栏
 * 用法：<div id="auth-bar"></div>
 *       <script>renderAuthBar("auth-bar");</script>
 */
function renderAuthBar(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var role = getBlogRole();
  if (!role) return;

  var label = role === "admin" ? "👑 管理员" : "👤 普通用户";
  var color = role === "admin" ? "#7c4dff" : "#1565c0";

  el.innerHTML =
    '<span style="font-size:13px;color:#888;">当前身份：' +
    '<strong style="color:' + color + ';">' + label + '</strong>' +
    '&nbsp;&nbsp;<a href="javascript:blogLogout()" ' +
    'style="font-size:12px;color:#999;text-decoration:underline;">退出登录</a>' +
    "</span>";
}
