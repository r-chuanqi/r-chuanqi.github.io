/**
 * ============================================================================
 * fancybox.js — 图片灯箱/画廊查看器
 * ============================================================================
 *
 * 【功能说明】
 *   为博客文章中的所有图片添加灯箱效果。点击图片后，会在当前页面上
 *   以浮层形式放大显示图片，支持键盘导航和手势操作。
 *
 * 【技术方案】
 *   - 使用 fancybox jQuery 插件实现灯箱效果
 *   - 页面加载后自动扫描所有 <img> 标签，将其包裹在 <a> 链接中
 *   - 如果图片有 alt 属性，在图片下方添加 caption 说明文字
 *   - 将所有图片链接归入同一画廊组（rel='article'），支持左右切换
 *
 * 【两阶段处理】
 *   阶段1 — 图片处理：将 <img> 包装为支持 fancybox 的链接结构
 *   阶段2 — 图片链接处理：为所有图片链接激活 fancybox 插件
 *
 * 【依赖】
 *   - jQuery
 *   - fancybox 插件（需在页面中提前引入）
 *
 * ============================================================================
 */

// 阶段一：图片元素处理（页面加载完成后执行）
$(document).ready(function() {

  // 遍历页面中的所有 <img> 标签
  $('img').each(function() {
    // 跳过已经被 fancybox 包裹的图片（避免重复包装）
    if ($(this).parent().hasClass('fancybox')) return;

    // 跳过带有 nofancybox CSS 类的图片（允许选择性禁用灯箱效果）
    if ($(this).parents().addBack().hasClass('nofancybox')) return;

    // 获取图片的 alt 文本（用作灯箱标题）
    var alt = this.alt;

    // 如果有 alt 文本，在图片后插入说明文字
    if (alt) $(this).after('<span class="caption">' + alt + '</span>');

    // 将 <img> 包裹在 fancybox 链接中
    // 优先使用 data-src 属性（懒加载），否则使用 src 属性
    $(this).wrap('<a href="' + ($(this).attr('data-src') == null ? this.src : $(this).attr('data-src')) + '" title="' + alt + '" class="fancybox"></a>');
  });

  // 给所有 fancybox 链接添加 rel='article' 属性
  // 将同一文章内的图片归为同一个画廊组，支持前后翻页
  $(this).find('.fancybox').each(function(){
    $(this).attr('rel', 'article');
  });
});

// 阶段二：激活 fancybox 插件（为图片链接启用灯箱效果）
$(document).ready(function() {
  // 选择所有常见图片格式的链接，激活 fancybox
  // 支持的格式：JPEG, JPG, PNG, GIF, WebP
  $("a[href$='.jpeg'],a[href$='.jpg'],a[href$='.png'],a[href$='.gif'],a[href$='.webp']")
    .attr('rel', 'gallery')  // 归入画廊分组
    .fancybox({
      helpers : {
        title: { type: 'inside'}  // 标题显示在灯箱内部
      }
    });
});
