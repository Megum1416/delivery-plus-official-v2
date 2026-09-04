import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, ".production-site");

const pages = [
  { source: "首頁新版提案.html", destination: "index.html", route: "/" },
  { source: "服務方案新版提案.html", destination: "uber-eats-plan/index.html", route: "/uber-eats-plan" },
  { source: "實際案例新版提案.html", destination: "results/index.html", route: "/results" },
  { source: "常見QA新版提案.html", destination: "knowledge/index.html", route: "/knowledge" },
  { source: "外送經營健檢新版提案.html", destination: "delivery-tools/index.html", route: "/delivery-tools" },
  { source: "privacy.html", destination: "privacy/index.html", route: "/privacy" },
];

const requiredFiles = [
  "gtm-loader.js",
  "site-events.js",
  "homepage-concept.css",
  "homepage-concept.js",
  "service-plan-concept.css",
  "service-plan-concept.js",
  "results-concept.css",
  "results-concept.js",
  "knowledge-concept.css",
  "knowledge-concept.js",
  "qa-data.js",
  "delivery-tools-concept.css",
  "delivery-tools-concept.js",
  "privacy-concept.css",
  "shared-content.js",
  "robots.txt",
  "sitemap.xml",
];

const routeMap = new Map(pages.map(({ source, route }) => [source, route]));

const replacePageLinks = (source) => {
  let result = source;
  for (const [file, route] of routeMap) result = result.replaceAll(file, route);
  return result;
};

const makeRootRelative = (html) => replacePageLinks(html).replace(
  /((?:href|src)=["'])(?!https?:|mailto:|tel:|data:|#|\/)([^"']+)(["'])/gi,
  "$1/$2$3",
);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });

for (const file of requiredFiles) {
  const sourcePath = path.join(root, file);
  const destinationPath = path.join(output, file);
  await mkdir(path.dirname(destinationPath), { recursive: true });

  if (file === "shared-content.js") {
    const source = await readFile(sourcePath, "utf8");
    const productionSource = replacePageLinks(source).replaceAll('assets/', '/assets/');
    await writeFile(destinationPath, productionSource, "utf8");
  } else {
    await cp(sourcePath, destinationPath);
  }
}

for (const { source, destination } of pages) {
  const sourceHtml = await readFile(path.join(root, source), "utf8");
  const productionHtml = makeRootRelative(sourceHtml).replace(
    /\s*<meta\s+name=["']robots["'][^>]*>/gi,
    "",
  );
  const destinationPath = path.join(output, destination);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, productionHtml, "utf8");
}

const packagePages = pages.map(({ destination }) => path.join(output, destination));
for (const page of packagePages) {
  const html = await readFile(page, "utf8");
  if (/新版提案\.html|外送加-官網改版展示\.html/.test(html)) {
    throw new Error(`${path.relative(output, page)} 仍包含提案版檔名`);
  }
  if (/noindex|nofollow/i.test(html)) {
    throw new Error(`${path.relative(output, page)} 不應包含預覽版禁止搜尋設定`);
  }
}

console.log(`Production package ready: ${pages.length} routes in ${path.relative(root, output)}`);
