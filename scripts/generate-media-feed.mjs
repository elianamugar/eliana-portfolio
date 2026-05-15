import fs from "node:fs";
import Parser from "rss-parser";

const parser = new Parser();

const LETTERBOXD_RSS = "https://letterboxd.com/elianamugar/rss/";
const GOODREADS_CURRENTLY_READING_RSS = "https://www.goodreads.com/review/list_rss/66067615?key=bNUQb71WimHSkLk6LRZ2Ip7rzMY-C1HQrbjW8p8ClCKn6P52&shelf=currently-reading";
const GOODREADS_READ_RSS = "https://www.goodreads.com/review/list_rss/66067615?key=bNUQb71WimHSkLk6LRZ2Ip7rzMY-C1HQrbjW8p8ClCKn6P52&shelf=read";

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

const mediaFeed = {
  watching: letterboxdItems.slice(0, 6).map((item) => ({
    title: item.title,
    link: item.link,
    date: item.isoDate || item.pubDate,
  })),

  currentlyReading: currentlyReadingItems.slice(0, 3).map((item) => ({
    title: item.title,
    link: item.link,
    date: item.isoDate || item.pubDate,
  })),

  read: readItems.slice(0, 6).map((item) => ({
    title: item.title,
    link: item.link,
    date: item.isoDate || item.pubDate,
  })),
};

fs.mkdirSync("src/data", { recursive: true });

fs.writeFileSync(
  "src/data/mediaFeed.json",
  JSON.stringify(mediaFeed, null, 2)
);

console.log("Generated src/data/mediaFeed.json");