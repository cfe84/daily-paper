import MD5 from "crypto-js/md5";
import axios from "axios";

export interface FeverConfig {
    url: string,
    username: string,
    apiPassword: string,
}

export interface Group {
    id: number;
    title: string;
    feedIds: number[];
}

export interface Groups {
    [groupId: string]: Group;
}

export interface Feed {
    id: number;
    title: string;
    url: string;
    groupIds: number[];
}

export interface Feeds {
    [feedId: string]: Feed;
}

export interface Article {
    title: string;
    author: string;
    feedId: number;
    feedName: string;
    excerpt: string;
    url: string;
}

interface FeverItem {
    id: string;
    feed_id: number;
    title: string;
    author: string;
    html: string;
    url: string;
    is_saved: boolean;
    is_read: boolean;
    created_on_time: number
}

interface FeedsGroups {
    group_id: number;
    feed_ids: string;
}

export class FeverClient {
    private url: string;
    private apiKey: string;

    constructor(config: FeverConfig) {
        this.url = config.url;
        const str = `${config.username}:${config.apiPassword}`;
        this.apiKey = MD5(str).toString();
    }

    public async fetchGroups(): Promise<Groups> {
        const groupsArr = await this.fetchSomething("groups");
        const groups: Groups = {};
        if (!groupsArr.groups) {
            return groups;
        }
        groupsArr.groups.forEach((group: Group) => groups[group.id] = group);
        groupsArr.feeds_groups.forEach((feedGroup: FeedsGroups) => {
            groups[feedGroup.group_id].feedIds = feedGroup.feed_ids.split(",").map(id => Number.parseInt(id));
        });
        return groups;
    }

    public async fetchFeeds(): Promise<Feeds> {
        const feedsArr = await this.fetchSomething("feeds");
        const feeds: Feeds = {};
        if (!feedsArr.feeds) {
            return feeds;
        }
        feedsArr.feeds.forEach((feed: any) => feeds[feed.id] = {
            id: feed.id,
            title: feed.title,
            url: feed.site_url,
            groupIds: [],
        });
        feedsArr.feeds_groups.forEach((feedGroup: FeedsGroups) => {
            const feedIds = feedGroup.feed_ids.split(",").map(id => Number.parseInt(id));
            feedIds.forEach(feedId => feeds[feedId].groupIds.push(feedGroup.group_id));
        });
        return feeds;
    }

    public async fetchArticles(since: Date): Promise<Article[]> {
        const sinceId = since.getTime() * 1000;
        const items = await this.fetchSomething(`items&since_id=${sinceId}`);
        if (!items.items) {
            return [];
        }
        return items.items.map((item: FeverItem) => ({
            title: item.title,
            author: item.author,
            url: item.url,
            feedId: item.feed_id,
            excerpt: item.html,
        }));
    }

    private async fetchSomething(path: string): Promise<any> {
        const url = `${this.url}/api/fever.php?api&${path}`;
        try {
            const params = new URLSearchParams();
            params.append("api_key", this.apiKey);
            const response = await axios.post(url, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}