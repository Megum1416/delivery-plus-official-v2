import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, ".pages-preview");
const previewBaseUrl = "https://megum1416.github.io/delivery-plus-official-v2/";
const publishedPages = [
  { source: "pages/首頁新版提案.html", legacy: "首頁新版提案.html", destination: "index.html", route: "" },
  { source: "pages/服務方案新版提案.html", legacy: "服務方案新版提案.html", destination: "uber-eats-plan/index.html", route: "uber-eats-plan/" },
  { source: "pages/實際案例新版提案.html", legacy: "實際案例新版提案.html", destination: "results/index.html", route: "results/" },
  { source: "pages/常見QA新版提案.html", legacy: "常見QA新版提案.html", destination: "knowledge/index.html", route: "knowledge/" },
  { source: "pages/外送經營健檢新版提案.html", legacy: "外送經營健檢新版提案.html", destination: "delivery-tools/index.html", route: "delivery-tools/" },
  { source: "pages/privacy.html", legacy: "privacy.html", destination: "privacy/index.html", route: "privacy/" },
];

const routeMap = new Map(
  publishedPages.map(({ legacy, route }) => [legacy, `${previewBaseUrl}${route}`]),
);

const replacePageLinks = (source) => {
  let result = source;
  for (const [file, url] of routeMap) result = result.replaceAll(file, url);
  return result;
};

const protectPreviewHtml = (source, previewUrl) => replacePageLinks(source)
  .replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, "")
  .replaceAll("../assets/", `${previewBaseUrl}assets/`)
  .replaceAll("../styles/", `${previewBaseUrl}styles/`)
  .replaceAll("../scripts/site/", `${previewBaseUrl}scripts/site/`)
  .replace(
    /<head([^>]*)>/i,
    '<head$1>\n  <meta name="robots" content="noindex, nofollow">',
  )
  .replace(
    /(<meta\s+property=["']og:url["']\s+content=["'])[^"']*(["']\s*\/?>)/i,
    `$1${previewUrl}$2`,
  )
  .replace(
    /(<meta\s+(?:property=["']og:image["']|name=["']twitter:image["'])\s+content=["'])https:\/\/syncompgo\.com\/assets\//gi,
    `$1${previewBaseUrl}assets/`,
  );

const makeLegacyRedirect = (targetUrl) => `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="0; url=${targetUrl}">
  <link rel="canonical" href="${targetUrl}">
  <title>頁面已搬移｜外送＋</title>
  <script>location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body><p>頁面已搬移，<a href="${targetUrl}">前往新網址</a>。</p></body>
</html>
`;

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });

const sharedFiles = [
  "scripts/site/gtm-loader.js",
  "scripts/site/site-events.js",
  "scripts/site/homepage-concept.js",
  "scripts/site/service-plan-concept.js",
  "scripts/site/results-concept.js",
  "scripts/site/knowledge-concept.js",
  "scripts/site/qa-data.js",
  "scripts/site/delivery-tools-concept.js",
  "scripts/site/shared-content.js",
  "styles/homepage-concept.css",
  "styles/service-plan-concept.css",
  "styles/results-concept.css",
  "styles/knowledge-concept.css",
  "styles/delivery-tools-concept.css",
  "styles/privacy-concept.css",
];

for (const file of sharedFiles) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  if (file === "scripts/site/shared-content.js") {
    const source = await readFile(path.join(root, file), "utf8");
    const previewSource = replacePageLinks(source)
      .replaceAll("../assets/", `${previewBaseUrl}assets/`);
    await writeFile(destination, previewSource, "utf8");
  } else {
    await cp(path.join(root, file), destination);
  }
}

for (const { source, legacy, destination, route } of publishedPages) {
  const sourceHtml = await readFile(path.join(root, source), "utf8");
  const destinationPath = path.join(output, destination);
  const previewUrl = `${previewBaseUrl}${route}`;
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, protectPreviewHtml(sourceHtml, previewUrl), "utf8");
  await writeFile(path.join(output, legacy), makeLegacyRedirect(previewUrl), "utf8");
}

await writeFile(
  path.join(output, "robots.txt"),
  "User-agent: *\nDisallow: /\n",
  "utf8",
);
await writeFile(path.join(output, ".nojekyll"), "", "utf8");

console.log(`Preview ready: ${publishedPages.length} clean routes + ${publishedPages.length} legacy redirects, all protected with noindex.`);
