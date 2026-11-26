import fs from 'node:fs';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

const parser = new Parser();
const output = 'src/data/mediaFeed.json';
let previous = {};
if (fs.existsSync(output)) previous = JSON.parse(fs.readFileSync(output, 'utf8'));
const base = 'https://www.goodreads.com/review/';
const currentURL = base + 'grid_widget/66067615?shelf=currently-reading&num_books=2';
const readURL = base + 'custom_widget/66067615?shelf=read&sort=date_read&order=d&num_books=3';

function widgetHTML(source) {
  const match = source.match(/var\s+widget_code\s*=\s*'((?:\\[\s\S]|[^'\\])*)'/);
  if (!match) throw new Error('Goodreads widget payload missing');
  return match[1].replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_, c) => {
    if (/^[ux][0-9a-fA-F]+$/.test(c)) return String.fromCharCode(parseInt(c.slice(1), 16));
    return ({n:'\n',r:'\r',t:'\t'})[c] ?? c;
  });
}
function parseWidget(source, custom) {
  const $ = cheerio.load(widgetHTML(source));
  const container = custom ? '.gr_custom_container_' : '.gr_grid_container';
  if (!$(container).length) throw new Error('Unexpected widget layout');
  const rows = $(custom ? '.gr_custom_each_container_' : '.gr_grid_book_container');
  return rows.map((_, el) => {
    const row = $(el);
    const a = row.find(custom ? '.gr_custom_book_container_ a' : 'a').first();
    const img = a.find('img');
    const title = a.attr('title') || img.attr('alt');
    const href = a.attr('href');
    if (!title || !href) throw new Error('Incomplete book entry');
    const link = new URL(href, base); link.search = '';
    const stars = row.find('.gr_custom_rating_ .staticStars');
    const labels = {'did not like it':1,'it was ok':2,'liked it':3,'really liked it':4,'it was amazing':5};
    const rating = labels[stars.attr('title')] ?? null;
    return {title, link:link.href, image:img.attr('src') || null, author:row.find('.gr_custom_author_ a').text().trim() || null, date:null, readDate:null, rating};
  }).get();
}
async function books(url, custom) {
  const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseWidget(await response.text(), custom);
}
async function preserve(key, load) {
  try { const items = await load(); console.log(`${key}: ${items.length} items`); return items; }
  catch (error) { console.warn(`${key}: ${error.message}; retaining previous data`); return previous[key] ?? []; }
}
const [watching, currentlyReading, read] = await Promise.all([
  preserve('watching', async () => {
    const feed = await parser.parseURL('https://letterboxd.com/elianamugar/rss/');
    if (!Array.isArray(feed.items)) throw new Error('Invalid RSS feed');
    return feed.items.slice(0,6).map(item => ({title:item.title, link:item.link, date:item.isoDate || item.pubDate, image:(item.content || item['content:encoded'] || item.description || '').match(/<img[^>]+src="([^">]+)"/)?.[1] ?? null}));
  }),
  preserve('currentlyReading', async () => (await books(currentURL,false)).slice(0,2)),
  preserve('read', async () => (await books(readURL,true)).slice(0,3)),
]);
fs.mkdirSync('src/data', {recursive:true});
fs.writeFileSync(output, JSON.stringify({watching, currentlyReading, read}, null, 2));
console.log(`Generated ${output}`);
