const fs = require("fs");
const Promise = require("bluebird");
const { promisify } = require("util");
const _ = require("lodash");
const fm = require("front-matter");
const marked = require("marked");
const glob = promisify(require("glob"));
const sizeOf = promisify(require("image-size"));
const moment = require("moment");

const readFile = promisify(fs.readFile);

async function getImage({ image, ...data }) {
  let src = image.replace("src/static", "");
  const { width, height } = await sizeOf(image);
  const paddingBottom = (height / width) * 100;
  if (!src.startsWith("/")) {
    src = `/${src}`;
  }
  return { ...data, type: "image", width, height, paddingBottom, src };
}

async function loadImages({ images, ...data }) {
  const imageItems = await glob(`src/static/images/${images}/*.*`);
  const allImages = await Promise.map(imageItems, image =>
    getImage({ image, ...data })
  );
  return allImages;
}

function getVimeo({ vimeo, ...data }) {
  return {
    ...data,
    id: vimeo,
    type: "video",
    url: `//vimeo.com/${vimeo}`,
    src: `//player.vimeo.com/video/${vimeo}?title=0&byline=0&portrait=0`
  };
}

function getYoutube({ youtube, ...data }) {
  return {
    ...data,
    id: youtube,
    type: "video",
    src: `//www.youtube.com/embed/${youtube}`
  };
}

function getBandcampAlbum({ bandcampAlbum, ...data }) {
  return {
    ...data,
    id: bandcampAlbum,
    type: "bandcampAlbum",
    src: `//bandcamp.com/EmbeddedPlayer/album=${bandcampAlbum}/size=large/bgcol=333333/linkcol=ffffff/transparent=true`
  };
}

function getBandcamp({ bandcamp, ...data }) {
  return {
    ...data,
    id: bandcamp,
    type: "bandcamp",
    src: `//bandcamp.com/EmbeddedPlayer/track=${bandcamp}/size=large/bgcol=333333/linkcol=0f91ff/minimal=true/transparent=true/`
  };
}

async function transformMedia(media) {
  if (!media || !media.length) {
    return undefined;
  }
  const result = await Promise.map(media, async mediaConfig => {
    if (mediaConfig.vimeo) {
      return getVimeo(mediaConfig);
    }
    if (mediaConfig.youtube) {
      return getYoutube(mediaConfig);
    }
    if (mediaConfig.bandcampAlbum) {
      return getBandcampAlbum(mediaConfig);
    }
    if (mediaConfig.images) {
      return await loadImages(mediaConfig);
    }
    if (mediaConfig.image) {
      return await getImage(mediaConfig);
    }
    if (mediaConfig.bandcamp) {
      return getBandcamp(mediaConfig);
    }
    throw new Error(`Unknown media config: ${JSON.stringify(mediaConfig)}`);
  });
  return _.flatten(result);
}

function formatDimensions(string, unit = "&rdquo;", times = "&times;") {
  const matches = string.match(/\d+x\d+/gim);
  if (!matches) {
    return string;
  }
  return matches.reduce((acc, match) => {
    const [w, h] = match.trim().split("x");
    return acc.replace(match, `${w}${unit}${times}${h}${unit}`);
  }, string);
}

async function getThumbnail(page) {
  if (page.thumbnail) {
    return await getImage({
      image: `src/static/images/${page.thumbnail}`
    });
  }
  if (page.media && page.media.length) {
    const image = page.media.find(media => media.type === "image");
    if (image) {
      return image;
    }
  }
  return undefined;
}

async function loadPage(pagePath) {
  const content = await readFile(pagePath, "utf-8");
  const { attributes, body } = fm(content);
  if (attributes.hidden) {
    return undefined;
  }
  const page = {
    pagePath,
    ...attributes,
    url: attributes.url.startsWith("/") ? attributes.url : `/${attributes.url}`,
    media: await transformMedia(attributes.media),
    body: marked(formatDimensions(body))
  };
  if (page.year) {
    const date = new Date(page.year).toISOString().slice(0, 10);
    const mDate = moment(date, "YYYY-MM-DD");
    page.dateMs = mDate.valueOf();
    page.year = mDate.format("YYYY");
    page.date = mDate.format("YYYY MMMM");
  }
  page.thumbnail = await getThumbnail(page);
  return page;
}

async function getAllPages() {
  const pagePaths = await glob("src/pages/**/*.md");
  const pages = [];
  await Promise.map(pagePaths, async pagePath => {
    const page = await loadPage(pagePath);
    if (page) {
      pages.push(page);
    }
  });
  return pages;
}

if (require.main === module) {
  getAllPages()
    .then(pages => console.log(JSON.stringify(pages, null, "  ")))
    .catch(error => console.error(error.stack));
}

module.exports = getAllPages;
