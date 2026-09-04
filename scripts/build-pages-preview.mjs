import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, ".pages-preview");
const previewBaseUrl = "https://megum1416.github.io/delivery-plus-official-v2/";
const publishedPages = [
  "首頁新版提案.html",
  "服務方案新版提案.html",
  "實際案例新版提案.html",
  "常見QA新版提案.html",
  "外送經營健檢新版提案.html",
  "privacy.html",
  "knowledge.html",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });

const rootFiles = await readdir(root, { withFileTypes: true });
const sharedFiles = rootFiles
  .filter((entry) => entry.isFile() && /\.(css|js)$/i.test(entry.name))
  .map((entry) => entry.name);

for (const file of [...publishedPages, ...sharedFiles]) {
  await cp(path.join(root, file), path.join(output, file));
}

await cp(
  path.join(root, "首頁新版提案.html"),
  path.join(output, "index.html"),
);

const htmlFiles = (await readdir(output)).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const target = path.join(output, file);
  const html = await readFile(target, "utf8");
  const withoutExistingRule = html.replace(
    /\s*<meta\s+name=["']robots["'][^>]*>/gi,
    "",
  );
  const previewUrl = file === "index.html"
    ? previewBaseUrl
    : `${previewBaseUrl}${encodeURI(file)}`;
  const protectedHtml = withoutExistingRule.replace(
    /<head([^>]*)>/i,
    '<head$1>\n  <meta name="robots" content="noindex, nofollow">',
  ).replace(
    /(<meta\s+property=["']og:url["']\s+content=["'])[^"']*(["']\s*\/?>)/i,
    `$1${previewUrl}$2`,
  ).replace(
    /(<meta\s+(?:property=["']og:image["']|name=["']twitter:image["'])\s+content=["'])https:\/\/syncompgo\.com\/assets\//gi,
    `$1${previewBaseUrl}assets/`,
  );
  await writeFile(target, protectedHtml, "utf8");
}

await writeFile(
  path.join(output, "robots.txt"),
  "User-agent: *\nAllow: /\n",
  "utf8",
);
await writeFile(path.join(output, ".nojekyll"), "", "utf8");

console.log(`Preview ready: ${htmlFiles.length} HTML files protected with noindex.`);
