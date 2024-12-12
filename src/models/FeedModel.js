// RSS源数据模型
import { supabase } from '../config/supabase.js';

export class FeedModel {
    constructor() {
        this.feeds = [];
        this.pageSize = 8;
        this.updateInterval = 10 * 60 * 1000;
        // 初始化时加载数据
        this.loadFeeds();
    }

    // 从Supabase加载RSS源
    async loadFeeds() {
        try {
            const { data, error } = await supabase
                .from('feeds')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase Error:', error);
                throw new Error(`加载RSS源失败: ${error.message}`);
            }
            this.feeds = data || [];
        } catch (error) {
            console.error('加载RSS源失败:', error);
            this.feeds = [];
            throw error;
        }
    }

    // 添加新的RSS源
    async addFeed(name, url) {
        try {
            // 首先检查URL是否已存在
            const { data: existingFeeds } = await supabase
                .from('feeds')
                .select('url')
                .eq('url', url);

            if (existingFeeds && existingFeeds.length > 0) {
                throw new Error('该RSS源已经存在');
            }

            const newFeed = {
                name,
                url,
                items: [],
                lastUpdate: null,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('feeds')
                .insert([newFeed])
                .select()
                .single();

            if (error) {
                console.error('Supabase Error:', error);
                throw new Error(`添加RSS源失败: ${error.message}`);
            }

            if (!data) {
                throw new Error('添加RSS源失败: 未返回数据');
            }

            this.feeds.unshift(data);
            return data;
        } catch (error) {
            console.error('添加RSS源失败:', error);
            throw error;
        }
    }

    // 删除RSS源
    async removeFeed(id) {
        try {
            const { error } = await supabase
                .from('feeds')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Supabase Error:', error);
                throw new Error(`删除RSS源失败: ${error.message}`);
            }

            this.feeds = this.feeds.filter(feed => feed.id !== id);
        } catch (error) {
            console.error('删除RSS源失败:', error);
            throw error;
        }
    }

    // 获取所有RSS源
    getFeeds() {
        return this.feeds;
    }

    // 获取指定RSS源
    getFeed(id) {
        return this.feeds.find(feed => feed.id === id);
    }

    // 检查是否需要更新
    needsUpdate(feed) {
        if (!feed.lastUpdate) return true;
        const lastUpdate = new Date(feed.lastUpdate).getTime();
        return Date.now() - lastUpdate > this.updateInterval;
    }

    // 获取分页的新闻列表
    getPagedItems(feedId, page = 1) {
        const feed = this.getFeed(feedId);
        if (!feed) return { items: [], totalPages: 0, currentPage: page };

        // 按发布时间排序
        const sortedItems = [...feed.items].sort((a, b) => 
            new Date(b.pubDate) - new Date(a.pubDate)
        );

        const startIndex = (page - 1) * this.pageSize;
        const items = sortedItems.slice(startIndex, startIndex + this.pageSize);
        const totalPages = Math.ceil(sortedItems.length / this.pageSize);

        return {
            items,
            totalPages,
            currentPage: page
        };
    }

    // 更新RSS源的新闻列表
    async updateFeedItems(id, items) {
        try {
            const feed = this.getFeed(id);
            if (!feed) {
                throw new Error('未找到指定的RSS源');
            }

            const { error } = await supabase
                .from('feeds')
                .update({ 
                    items: items,
                    lastUpdate: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error('Supabase Error:', error);
                throw new Error(`更新RSS源新闻失败: ${error.message}`);
            }

            // 更新本地缓存
            feed.items = items;
            feed.lastUpdate = new Date().toISOString();
        } catch (error) {
            console.error('更新RSS源新闻失败:', error);
            throw error;
        }
    }
} 