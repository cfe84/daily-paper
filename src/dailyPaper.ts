import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Article, Feed, FeverClient, Group } from "./FeverClient";

dotenv.config();

const FRESHRSS_URL = process.env.FRESHRSS_URL || "";
const API_PASSWORD = process.env.API_PASSWORD || "";
const API_USER = process.env.API_USER || "";
const CATEGORY_IDS = (process.env.CATEGORY_IDS || "").split(",").map(cat => Number.parseInt(cat));
const FETCH_DAYS = parseInt(process.env.FETCH_DAYS || "1");

const SMTP_SERVER = process.env.SMTP_SERVER || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USERNAME = process.env.SMTP_USERNAME || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const TO_EMAIL = process.env.TO_EMAIL || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "";


interface ArticlesByGroup {
  category: Group,
  articles: Article[],
}


function generateEmailContent(articles: ArticlesByGroup[]): string {
  let htmlContent = "<h1>Daily Paper</h1>";
  htmlContent += `<p>Date: ${new Date().toISOString().split("T")[0]}</p>`;
  for (const arts of articles) {
    if (arts.articles.length > 0) {
      htmlContent += `<h2>${arts.category.title}</h2>`;
      for (const article of arts.articles) {
        const title = `${article.title} (${article.feedName})`;
        const link = article.url || "#";
        const snippet = article.excerpt || "No summary available";
        htmlContent += `<h3><a href="${link}">${title}</a></h3><div>${snippet}</div>`;
      }
    }
  }
  return htmlContent;
}

async function sendEmail(subject: string, content: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    // secure: false,1
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject,
    html: content,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

// Main function
async function main() {
  const categories: ArticlesByGroup[] = [];

  const client = new FeverClient({
    url: FRESHRSS_URL,
    apiPassword: API_PASSWORD,
    username: API_USER,
  });

  const since = new Date();
  since.setDate(since.getDate() - FETCH_DAYS);
  const groups = await client.fetchGroups();
  const feeds = await client.fetchFeeds();
  const articles = await client.fetchArticles(since);
  
  for (const categoryId of CATEGORY_IDS) {
    const category = groups[`${categoryId}`];
    const selectedFeeds = category.feedIds;
    const selectedArticles = Object.values(articles).filter(article => selectedFeeds.indexOf(article.feedId) >= 0);
    for(const article of selectedArticles) {
      article.feedName = feeds[article.feedId].title;
    }
    categories.push({category, articles: selectedArticles});
  }

  const emailContent = generateEmailContent(categories);
  await sendEmail("Your Daily Paper", emailContent);
}

// Run the script
main().catch((error) => {
  console.error("An error occurred:", error);
});
