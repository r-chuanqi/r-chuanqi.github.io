/**
 * ============================================================================
 * search.js — 本地全文搜索功能
 * ============================================================================
 *
 * 【功能说明】
 *   在博客页面上提供客户端本地搜索，用户输入关键词后即时过滤文章列表。
 *   搜索数据来源为预生成的 XML 文件（通常为 search.xml），包含所有文章的
 *   标题、正文内容和 URL 信息。
 *
 * 【技术方案】
 *   - 使用 jQuery 的 $.ajax 加载 XML 格式的搜索索引数据
 *   - 通过 input 事件实时监听用户输入
 *   - 对关键词按空格/短横线分词，在标题和正文中分别匹配
 *   - 匹配成功后在结果中高亮关键词（用 <em> 标签包裹）
 *   - 截取匹配位置前后共 100 字符作为预览摘要
 *
 * 【性能特点】
 *   - 纯前端搜索，不依赖后端接口
 *   - XML 数据在页面加载时一次性加载到内存
 *   - 适用于中小型博客（几百篇文章以内）
 *
 * ============================================================================
 */

// 搜索入口函数：由主题模板调用并传入三个参数
// path       — 搜索数据的 XML 文件路径（如 /search.xml）
// search_id  — 搜索输入框的 DOM ID
// content_id — 搜索结果显示容器的 DOM ID
var searchFunc = function(path, search_id, content_id) {
    'use strict';

    // 通过 AJAX 请求加载搜索索引 XML 文件
    // dataType: "xml" 让 jQuery 自动解析 XML 响应
    $.ajax({
        url: path,
        dataType: "xml",
        success: function( xmlResponse ) {

            // ============================================================
            //  解析 XML 搜索结果集
            //  每个 <entry> 节点对应一篇文章，包含 title、content、url
            //  使用 .map() 将 XML 节点集合转换为 JavaScript 对象数组
            // ============================================================
            var datas = $( "entry", xmlResponse ).map(function() {
                return {
                    title:   $( "title", this ).text(),   // 文章标题
                    content: $("content", this).text(),    // 文章正文文本
                    url:     $( "url" , this).text()       // 文章链接地址
                };
            }).get(); // .get() 将 jQuery 集合转换为普通数组

            // 获取搜索输入框和结果容器的 DOM 引用
            var $input = document.getElementById(search_id);
            if (!$input) return; // 如果页面上没有搜索框，提前退出

            var $resultContent = document.getElementById(content_id);

            // 检查页面中是否存在搜索输入框（通过 jQuery 选择器双重确认）
            if ($("#local-search-input").length > 0) {

                // 监听输入框的 input 事件：用户每次键入都触发搜索
                $input.addEventListener('input', function () {

                    // 构建搜索结果 HTML 的起始标签
                    var str = '<ul class=\"search-result-list\">';

                    // 获取输入内容：去除首尾空格，转小写，按空格和短横线拆分为关键词数组
                    // 例如输入 "hello world" → ["hello", "world"]
                    var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);

                    // 清空上一次的搜索结果
                    $resultContent.innerHTML = "";

                    // 输入为空时不搜索
                    if (this.value.trim().length <= 0) {
                        return;
                    }

                    // ============================================================
                    //  遍历所有文章数据进行关键词匹配
                    // ============================================================
                    datas.forEach(function (data) {
                        var isMatch = true;        // 标记当前文章是否匹配所有关键词
                        var content_index = [];     // 保留字段（调试用）

                        // 标题为空时使用默认值 "Untitled"
                        if (!data.title || data.title.trim() === '') {
                            data.title = "Untitled";
                        }

                        // 预处理：标题转小写，内容去除 HTML 标签后转小写
                        var data_title   = data.title.trim().toLowerCase();
                        var data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
                        var data_url     = data.url;

                        var index_title   = -1;  // 标题中关键词的匹配位置
                        var index_content = -1;  // 正文中关键词的匹配位置
                        var first_occur   = -1;  // 正文中首次匹配的位置（用于截取预览）

                        // 只匹配有正文内容的文章（空文章跳过）
                        if (data_content !== '') {

                            // 遍历每个关键词，必须全部匹配才算搜索命中（AND 逻辑）
                            keywords.forEach(function (keyword, i) {
                                index_title   = data_title.indexOf(keyword);
                                index_content = data_content.indexOf(keyword);

                                // 任一关键词在标题和正文中都找不到 → 标记为不匹配
                                if (index_title < 0 && index_content < 0) {
                                    isMatch = false;
                                } else {
                                    // 如果正文中没找到但标题中找到了，将正文索引设为 0
                                    if (index_content < 0) {
                                        index_content = 0;
                                    }
                                    // 记录第一个关键词在正文中的位置
                                    if (i == 0) {
                                        first_occur = index_content;
                                    }
                                }
                            });
                        } else {
                            // 正文为空 → 不匹配
                            isMatch = false;
                        }

                        // ============================================================
                        //  显示搜索结果条目
                        // ============================================================
                        if (isMatch) {
                            // 构建结果条目：文章标题作为可点击的链接
                            str += "<li><a href='" + data_url + "' class='search-result-title'>" + data_title + "</a>";

                            // 截取正文中匹配位置周围的文字作为预览摘要
                            var content = data.content.trim().replace(/<[^>]+>/g, "");
                            if (first_occur >= 0) {
                                // 向前取 20 字符，向后取 80 字符，总共约 100 字符的预览
                                var start = first_occur - 20;
                                var end   = first_occur + 80;

                                // 边界处理：不能为负数
                                if (start < 0) {
                                    start = 0;
                                }

                                // 如果从头开始，取前 100 字符
                                if (start == 0) {
                                    end = 100;
                                }

                                // 末尾截断：不能超出内容长度
                                if (end > content.length) {
                                    end = content.length;
                                }

                                var match_content = content.substring(start, end);

                                // ============================================================
                                //  在预览摘要中高亮所有匹配关键词
                                //  使用正则表达式 + <em> 标签实现高亮效果
                                //  例如：关键词 "hello" → <em class="search-keyword">hello</em>
                                // ============================================================
                                keywords.forEach(function (keyword) {
                                    var regS = new RegExp(keyword, "gi");
                                    match_content = match_content.replace(regS, "<em class=\"search-keyword\">" + keyword + "</em>");
                                });

                                // 追加预览摘要文本到结果条目
                                str += "<p class=\"search-result\">" + match_content + "...</p>"
                            }
                            str += "</li>";
                        }
                    });

                    // 关闭结果列表 HTML 标签
                    str += "</ul>";

                    // 将构建好的搜索结果 HTML 渲染到页面容器中
                    $resultContent.innerHTML = str;
                });
            }
        }
    });
}
