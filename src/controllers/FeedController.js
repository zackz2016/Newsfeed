// RSS阅读器控制器
export class FeedController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentFeedId = null;
        this.currentPage = 1;

        // 绑定视图事件
        this.view.bindAddFeedSubmit(this.handleAddFeed.bind(this));
        this.view.bindFeedSelect(this.handleFeedSelect.bind(this));
        this.view.bindPagination(this.handlePageChange.bind(this));

        // 初始化显示
        this.initializeApp();
    }

    // 初始化应用
    async initializeApp() {
        try {
            await this.model.loadFeeds();
            this.refreshFeeds();
        } catch (error) {
            this.view.showError('加载RSS源失败：' + error.message);
        }
    }

    // 刷新RSS源列表
    refreshFeeds() {
        const feeds = this.model.getFeeds();
        this.view.renderFeeds(feeds, this.currentFeedId);
    }

    // 处理添加RSS源
    async handleAddFeed(name, url) {
        try {
            this.view.showLoading();
            const feed = await this.model.addFeed(name, url);
            this.refreshFeeds();
            await this.fetchFeedItems(feed.id);
        } catch (error) {
            this.view.showError('添加RSS源失败：' + error.message);
        }
    }

    // 处理RSS源选择
    async handleFeedSelect(id) {
        try {
            const feed = this.model.getFeed(id);
            if (feed) {
                this.currentFeedId = id;
                this.currentPage = 1;
                this.view.showLoading();

                // 检查是否需要更新数据
                if (this.model.needsUpdate(feed)) {
                    await this.fetchFeedItems(id);
                } else {
                    // 直接使用缓存的数据
                    const pagedData = this.model.getPagedItems(id, this.currentPage);
                    this.view.renderNews(pagedData);
                }
            }
        } catch (error) {
            this.view.showError('获取新闻失败：' + error.message);
        }
    }

    // 处理页码变化
    handlePageChange(page) {
        if (this.currentFeedId) {
            this.currentPage = page;
            const pagedData = this.model.getPagedItems(this.currentFeedId, page);
            this.view.renderNews(pagedData);
        }
    }

    // 获取RSS源的新闻内容
    async fetchFeedItems(feedId) {
        try {
            const feed = this.model.getFeed(feedId);
            if (!feed) return;

            // 使用CORS代理来解决跨域问题
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(feed.url));
            const text = await response.text();

            // 解析XML
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            
            // 提取新闻项
            const items = Array.from(xml.querySelectorAll('item')).map(item => ({
                title: item.querySelector('title')?.textContent || '',
                description: item.querySelector('description')?.textContent || '',
                link: item.querySelector('link')?.textContent || '',
                pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString()
            }));

            // 更新模型
            await this.model.updateFeedItems(feedId, items);

            // 获取分页数据并更新视图
            const pagedData = this.model.getPagedItems(feedId, this.currentPage);
            this.view.renderNews(pagedData);
        } catch (error) {
            this.view.showError('获取RSS内容失败：' + error.message);
        }
    }
} 