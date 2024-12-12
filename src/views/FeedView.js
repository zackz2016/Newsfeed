// RSS阅读器视图层
export class FeedView {
    constructor() {
        // 获取DOM元素
        this.feedsList = document.getElementById('feedsList');
        this.newsList = document.getElementById('newsList');
        this.addFeedBtn = document.getElementById('addFeedBtn');
        this.addFeedModal = document.getElementById('addFeedModal');
        this.addFeedForm = document.getElementById('addFeedForm');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.articleModal = document.createElement('div');
        this.articleModal.className = 'modal article-modal';
        document.body.appendChild(this.articleModal);

        // 绑定事件处理器
        this.bindAddFeedButton();
        this.bindCancelButton();
        this.bindArticleModalClose();
    }

    // 绑定添加RSS源按钮事件
    bindAddFeedButton() {
        this.addFeedBtn.addEventListener('click', () => {
            this.addFeedModal.classList.add('active');
        });
    }

    // 绑定取消按钮事件
    bindCancelButton() {
        this.cancelBtn.addEventListener('click', () => {
            this.addFeedModal.classList.remove('active');
            this.addFeedForm.reset();
        });
    }

    // 绑定文章模态框关闭事件
    bindArticleModalClose() {
        this.articleModal.addEventListener('click', (e) => {
            if (e.target === this.articleModal) {
                this.articleModal.classList.remove('active');
            }
        });
    }

    // 绑定添加RSS源表单提交事件
    bindAddFeedSubmit(handler) {
        this.addFeedForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('feedName').value;
            const url = document.getElementById('feedUrl').value;
            handler(name, url);
            this.addFeedModal.classList.remove('active');
            this.addFeedForm.reset();
        });
    }

    // 绑定RSS源点击事件
    bindFeedSelect(handler) {
        this.feedsList.addEventListener('click', e => {
            const item = e.target.closest('li');
            if (item) {
                // 移除其他项的高亮
                this.feedsList.querySelectorAll('li').forEach(li => {
                    li.classList.remove('active');
                });
                // 添加当前项的高亮
                item.classList.add('active');
                const id = parseInt(item.dataset.id);
                handler(id);
            }
        });
    }

    // 绑定分页事件
    bindPagination(handler) {
        this.newsList.addEventListener('click', e => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                handler(page);
            }
        });
    }

    // 显示文章内容
    showArticle(item) {
        this.articleModal.innerHTML = `
            <div class="modal-content article-content">
                <h2>${item.title}</h2>
                <div class="article-meta">
                    <span class="date">${new Date(item.pubDate).toLocaleString()}</span>
                </div>
                <div class="article-body">
                    ${item.description || '暂无内容'}
                </div>
                <div class="article-footer">
                    <a href="${item.link}" target="_blank" class="btn">在原网站查看</a>
                    <button class="btn close-btn">关闭</button>
                </div>
            </div>
        `;
        this.articleModal.classList.add('active');

        // 绑定关闭按钮事件
        this.articleModal.querySelector('.close-btn').addEventListener('click', () => {
            this.articleModal.classList.remove('active');
        });
    }

    // 渲染RSS源列表
    renderFeeds(feeds, activeFeedId = null) {
        this.feedsList.innerHTML = feeds.map(feed => `
            <li data-id="${feed.id}" class="feed-item ${feed.id === activeFeedId ? 'active' : ''}">
                ${feed.name}
                
            </li>
        `).join('');
    }

    // 渲染新闻列表（带分页）
    renderNews(data) {
        const { items, totalPages, currentPage } = data;
        
        // 渲染新闻列表
        const newsHtml = items.map(item => `
            <article class="news-item" data-article='${JSON.stringify(item)}'>
                <h3 class="news-title">${item.title}</h3>
                <div class="news-meta">
                    <span class="date">${new Date(item.pubDate).toLocaleString()}</span>
                </div>
            </article>
        `).join('');

        // 渲染分页控件
        const paginationHtml = this.renderPagination(currentPage, totalPages);

        // 组合最终HTML
        this.newsList.innerHTML = `
            <div class="news-container">
                ${newsHtml}
            </div>
            ${paginationHtml}
        `;

        // 绑定新闻标题点击事件
        this.newsList.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', () => {
                const articleData = JSON.parse(item.dataset.article);
                this.showArticle(articleData);
            });
        });
    }

    // 渲染分页控件
    renderPagination(currentPage, totalPages) {
        if (totalPages <= 1) return '';

        let pages = [];
        // 添加上一页按钮
        if (currentPage > 1) {
            pages.push(`<button class="page-btn" data-page="${currentPage - 1}">上一页</button>`);
        }

        // 添加页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                pages.push(`<button class="page-btn active" data-page="${i}">${i}</button>`);
            } else {
                pages.push(`<button class="page-btn" data-page="${i}">${i}</button>`);
            }
        }

        // 添加下一页按钮
        if (currentPage < totalPages) {
            pages.push(`<button class="page-btn" data-page="${currentPage + 1}">下一页</button>`);
        }

        return `<div class="pagination">${pages.join('')}</div>`;
    }

    // 显示加载状态
    showLoading() {
        this.newsList.innerHTML = '<div class="loading">加载中...</div>';
    }

    // 显示错误信息
    showError(message) {
        this.newsList.innerHTML = `<div class="error">${message}</div>`;
    }
} 