import { Article, ArticlesByGroup, Feeds, Groups } from "./Contracts";

export interface FormatterConfig {
    categoryIds: number[],
    maxImageWidthPx: number,
}

export class Formatter {
    constructor(private config: FormatterConfig) {}

    generateEmailContent(groups: Groups, feeds: Feeds, articles: Article[]): string {
      const categories: ArticlesByGroup[] = this.groupByCategory(groups, articles, feeds);

      let htmlContent = "";
      htmlContent += `<p>Date: ${new Date().toISOString().split("T")[0]}</p>`;
      for (const arts of categories) {
        if (arts.articles.length > 0) {
          htmlContent += `<h1>${arts.category.title}</h1>`;
          for (const article of arts.articles) {
            const excerpt = this.reformatImg(article.excerpt)
            const title = `${article.title} (${article.feedName})`;
            const link = article.url || "#";
            const snippet = excerpt || "No summary available";
            htmlContent += `<h2><a href="${link}">${title}</a></h2>
            <div>${snippet}</div>`;
          }
        }
      }
      return htmlContent;
    }

    private reformatImg(excerpt: string) {
        const regexp = new RegExp(/<img[^>]*src="([^"]+)"[^>]*>/ig);
        let image: RegExpExecArray | null;

        while (image = regexp.exec(excerpt)) {
            const [originalImageTag, imageSource] = image;
            const reformattedImage = `<img src=${imageSource} style="max-width: ${this.config.maxImageWidthPx}px"/>`
            excerpt = excerpt.replace(originalImageTag, reformattedImage);
        }

        return excerpt;
    }

    private groupByCategory(groups: Groups, articles: Article[], feeds: Feeds) {
        const categories: ArticlesByGroup[] = [];
        for (const categoryId of this.config.categoryIds) {
            const category = groups[`${categoryId}`];
            if (!category) {
                console.warn(`CategoryId ${categoryId} not found`)
                continue;
            }
            const selectedFeeds = category.feedIds;
            const selectedArticles = Object.values(articles).filter(article => selectedFeeds.indexOf(article.feedId) >= 0);
            for (const article of selectedArticles) {
                article.feedName = feeds[article.feedId].title;
            }
            categories.push({ category, articles: selectedArticles });
        }
        return categories;
    }
  
}