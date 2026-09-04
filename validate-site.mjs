import fs from 'node:fs';
import path from 'node:path';

const files = fs.readdirSync('.').filter((file) => file.endsWith('.html'));
const problems = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const canonicals = source.match(/rel=["']canonical["']/g) || [];
  if (canonicals.length !== 1) problems.push(`${file}: canonical=${canonicals.length}`);

  for (const match of source.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) problems.push(`${file}: missing ${target}`);
  }

  for (const match of source.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      problems.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
}

const knowledge = fs.readFileSync('knowledge.html', 'utf8');
const questionCount = (knowledge.match(/class="qa-item"/g) || []).length;
const categoryCount = (knowledge.match(/data-category-group=/g) || []).length;
const coreFaqCount = (knowledge.match(/<section class="answered-faq"[\s\S]*?<\/section>/)?.[0].match(/<details/g) || []).length;
const oldLabelCount = files.reduce((total, file) => {
  return total + (fs.readFileSync(file, 'utf8').match(/免費工具/g) || []).length;
}, 0);

console.log(`HTML: ${files.join(', ')}`);
console.log(`Knowledge questions: ${questionCount}`);
console.log(`Knowledge categories: ${categoryCount}`);
console.log(`Core FAQs: ${coreFaqCount}`);
console.log(`Old free-tool label: ${oldLabelCount}`);
console.log(`Broken: ${problems.length ? `\n${problems.join('\n')}` : 'none'}`);

if (questionCount !== 100 || categoryCount !== 7 || coreFaqCount !== 10 || oldLabelCount !== 0 || problems.length) {
  process.exitCode = 1;
}
