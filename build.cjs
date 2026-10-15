const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = __dirname;
const order = ['kitakoyasu', 'minamikoyasu', 'mokushi', 'sotominowa', 'yaehara', 'uchiminowa', 'hokisaku', 'minao'];

function cleanDistrict(value) {
  const district = structuredClone(value);
  district.origin = Array.isArray(district.origin) ? district.origin : [];
  district.items = Array.isArray(district.items) ? district.items : [];
  for (const item of district.items) {
    item.photo ||= '';
    if (item.extra && !Object.values(item.extra).some(Boolean)) delete item.extra;
    if (item.extra) item.extra.photo ||= '';
  }
  return district;
}

const districts = order.map((id) => {
  const file = path.join(root, 'content', 'districts', `${id}.json`);
  const district = cleanDistrict(JSON.parse(fs.readFileSync(file, 'utf8')));
  if (district.id !== id) throw Error(`地区IDは変更できません: ${id}`);
  return district;
});

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const district of districts) for (const item of district.items) {
  for (const entry of [item, item.extra].filter(Boolean)) {
    if (entry.photo && !fs.existsSync(path.join(root, entry.photo))) {
      throw Error(`写真がありません: ${entry.photo}`);
    }
  }
}
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);

const generated = `/* 管理画面の内容から自動生成。直接編集しないでください。 */\n\nconst DISTRICTS = ${JSON.stringify(districts, null, 2)};\n`;
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(root, 'data.js'), generated, 'utf8');
for (const file of [
  'index.html',
  'data.js',
  'arrange.css',
  'robots.txt',
  'sitemap.xml',
  'google2a682ed3b068ff87.html',
]) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
for (const dir of ['photos', 'admin']) {
  fs.cpSync(path.join(root, dir), path.join(output, dir), { recursive: true });
}
console.log(`Validated ${districts.length} district URLs and ${districts.reduce((sum, district) => sum + district.items.length, 0)} entries. Built static site in dist.`);
