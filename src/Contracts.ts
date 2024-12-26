export interface ArticlesByGroup {
  category: Group,
  articles: Article[],
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