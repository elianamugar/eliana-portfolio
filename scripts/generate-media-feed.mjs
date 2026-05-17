import fs from "node:fs";
import Parser from "rss-parser";

const parser = new Parser();

const LETTERBOXD_RSS = "https://letterboxd.com/elianamugar/rss/";
const GOODREADS_CURRENTLY_READING_RSS = "https://www.goodreads.com/review/list_rss/66067615?key=bNUQb71WimHSkLk6LRZ2Ip7rzMY-C1HQrbjW8p8ClCKn6P52&shelf=currently-reading";
const GOODREADS_READ_RSS =
  "https://www.goodreads.com/review/list_rss/66067615?key=YOUR_KEY&shelf=read&sort=date_read";

  function extractGoodreadsRating(item) {
  const html =
    item.content ||
    item["content:encoded"] ||
    item.description ||
    "";

  const match =
    html.match(/user_rating:\s*(\d+)/i) ||
    html.match(/rating:\s*(\d+)/i);

  return match ? Number(match[1]) : null;
}

function extractGoodreadsReadDate(item) {
  const html =
    item.content ||
    item["content:encoded"] ||
    item.description ||
    "";

  const match =
    html.match(/user_read_at:\s*([^<\n]+)/i) ||
    html.match(/read_at:\s*([^<\n]+)/i) ||
    html.match(/date read:\s*([^<\n]+)/i);

  if (!match) return null;

  const cleaned = match[1].trim();

  const date = new Date(cleaned);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractImage(item) {
  const html = item.content || item["content:encoded"] || item.description || "";

  const match = html.match(/<img[^>]+src="([^">]+)"/);

  return match ? match[1] : null;
}

async function safeParse(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items ?? [];
  } catch (error) {
    console.warn(`Could not fetch ${url}`);
    return [];
  }
}

const letterboxdItems = await safeParse(LETTERBOXD_RSS);
const currentlyReadingItems = await safeParse(GOODREADS_CURRENTLY_READING_RSS);
const readItems = await safeParse(GOODREADS_READ_RSS);
const sortedReadItems = readItems
  .map((item) => ({
    ...item,
    readDate:
      extractGoodreadsReadDate(item) ||
      item.isoDate ||
      item.pubDate,
  }))
  .sort((a, b) => {
    return new Date(b.readDate) - new Date(a.readDate);
  });

const mediaFeed = {
  watching: letterboxdItems.slice(0, 6).map((item) => ({
    title: item.title,
    link: item.link,
    date: item.isoDate || item.pubDate,
    image: extractImage(item),
  })),

  currentlyReading: currentlyReadingItems.slice(0, 3).map((item) => ({
    title: item.title,
    link: item.link,
    date: item.isoDate || item.pubDate,
    image: extractImage(item),
    rating: extractGoodreadsRating(item),
  })),

  read: readItems.slice(0, 6).map((item) => ({
    title: item.title,
    link: item.link,
    date: item.isoDate || item.pubDate,
    image: extractImage(item),
   readDate: extractGoodreadsReadDate(item) || item.isoDate || item.pubDate,
   rating: extractGoodreadsRating(item),
})),
};

fs.mkdirSync("src/data", { recursive: true });

fs.writeFileSync(
  "src/data/mediaFeed.json",
  JSON.stringify(mediaFeed, null, 2)
);

console.log("Generated src/data/mediaFeed.json");