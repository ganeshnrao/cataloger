const fs = require("fs-extra");
const path = require("path");
const { promisify } = require("util");
const _ = require("lodash");
const Promise = require("bluebird");
const glob = promisify(require("glob"));
const makeDir = require("make-dir");
const pug = require("pug");
const { ncp } = require("ncp");
const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const tailwind = require("tailwindcss");
const PurgeCss = require("@fullhuman/postcss-purgecss");
const cssnano = require("cssnano")({ preset: "default" });
const getAllPages = require("./getAllPages");
const moment = require("moment");
const rimraf = promisify(require("rimraf"));
const browserify = require("browserify");
const uglify = require("uglify-js");
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngQuant = require("imagemin-pngquant");

ncp.limit = 20;

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const distDir = path.resolve(__dirname, "dist");
const isProduction = process.env.NODE_ENV === "production";

async function loadPages() {
  console.log("Loading pages");
  const pages = await getAllPages();
  return _.orderBy(pages, ["dateMs", "title"], ["desc", "asc"]);
}

async function loadTemplates() {
  console.log("Loading templates");
  const templatePaths = await glob("src/templates/**/*.pug");
  const templates = {};
  await Promise.map(templatePaths, async filename => {
    const templateString = await readFile(filename, "utf-8");
    const name = filename.replace("src/templates/", "").replace(".pug", "");
    templates[name] = pug.compile(templateString, { filename });
  });
  return templates;
}

async function generateHtml(data, templates) {
  const { page } = data;
  const { url, template } = page;
  const opFileDir = path.resolve(distDir, `./${url}`);
  await makeDir(opFileDir);
  const opFilePath = path.resolve(opFileDir, "index.html");
  await writeFile(opFilePath, templates[template](data));
}

async function buildStyles() {
  console.log("Building styles");
  const input = "src/styles/main.css";
  const output = "dist/main.css";
  const mapOutput = "dist/main.css.map";
  const purge = new PurgeCss({
    content: ["./dist/**/*.html"],
    defaultExtractor(content) {
      return content.match(/[\w-/:]+(?<!:)/g) || [];
    }
  });
  const css = await readFile(input);
  const plugins = isProduction
    ? [tailwind, autoprefixer, purge, cssnano]
    : [tailwind, autoprefixer];
  const options = { from: input, to: output };
  const result = await postcss(plugins).process(css, options);
  await writeFile(output, result.css);
  if (result.map) {
    await writeFile(mapOutput, result.map);
  }
}

async function buildScripts() {
  console.log("Building scripts");
  return new Promise((resolve, reject) => {
    browserify("src/scripts/app.js")
      .transform("babelify", { presets: ["@babel/preset-env"] })
      .bundle(async (error, jsContent) => {
        if (error) {
          return reject(error);
        }
        const jsCode = isProduction
          ? uglify.minify(String(jsContent)).code
          : jsContent;
        await writeFile("./dist/app.js", jsCode);
        resolve();
      });
  });
}

async function buildImages() {
  if (!isProduction) {
    return ncp("src/static", "dist");
  }
  console.log("Optimizing static assets");
  const files = await imagemin(["./src/static/**/*"], {
    destination: "./dist/",
    plugins: [imageminMozjpeg(), imageminPngQuant()]
  });
  await Promise.map(
    files,
    async ({ sourcePath, destinationPath }) => {
      const newDest = sourcePath.replace("./src/static", "dist");
      if (destinationPath !== newDest) {
        await fs.move(destinationPath, newDest);
      }
    },
    { concurrency: 10 }
  );
}

async function build() {
  const env = process.env.NODE_ENV || "development";
  const startMs = Date.now();
  await rimraf("./dist");
  await makeDir("./dist");
  const [pages, templates] = await Promise.join(loadPages(), loadTemplates());
  console.log("Geneating pages");
  await Promise.map(pages, page =>
    generateHtml({ pages, page, moment, isProduction }, templates)
  );
  await Promise.join(buildStyles(), buildScripts(), buildImages());
  const duration = Date.now() - startMs;
  console.log(`Built for ${env} in ${duration}ms`);
}

build().catch(error => console.error(error.stack));
