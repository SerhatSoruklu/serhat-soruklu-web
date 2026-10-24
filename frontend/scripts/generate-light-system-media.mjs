import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const directory = new URL('../public/assets/social/', import.meta.url);
const colors = {
  '#07090d': '#ffffff', '#10141c': '#f8f7f3', '#0c1017': '#f8f7f3',
  '#0b1016': '#f8f7f3', '#0b1518': '#f8f7f3', '#15130d': '#f8f7f3',
  '#252b36': '#e5e0d6', '#1a202b': '#e5e0d6',
  '#f5f7fa': '#111827', '#f8fafc': '#111827', '#a8b0bd': '#5f6673',
  '#d6a84f': '#b8872f', '#f0d58c': '#b8872f',
  '#59e4eb': '#087f89', '#28c9d4': '#087f89', '#6aa8ff': '#2f6fb5',
};

// Keep the original logo markup byte-for-byte, including its brand colors.
function protectElement(source, openingPattern, saved, backplate = '') {
  const match = openingPattern.exec(source);
  assert.ok(match, `Missing logo: ${openingPattern}`);
  const tag = match[0].match(/^<(\w+)/)[1];
  const tokens = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'g');
  tokens.lastIndex = match.index;
  let depth = 0;
  let token;
  while ((token = tokens.exec(source))) {
    if (token[0].startsWith('</')) depth--;
    else if (!token[0].endsWith('/>')) depth++;
    if (depth === 0) {
      const original = source.slice(match.index, tokens.lastIndex);
      const placeholder = `<!-- PRESERVED-BRAND-${saved.length} -->`;
      saved.push({ placeholder, original, backplate });
      return source.slice(0, match.index) + placeholder + source.slice(tokens.lastIndex);
    }
  }
  throw new Error(`Unclosed logo: ${openingPattern}`);
}

for (const project of ['coupyn', 'stervox', 'codaris']) {
  const file = `serhat-soruklu-systems-${project}-og`;
  const original = await readFile(new URL(`${file}.svg`, directory), 'utf8');
  const saved = [];
  let light = original;
  if (project === 'coupyn') {
    light = protectElement(light, /<g id="coupyn-brand-wordmark"[^>]*>/, saved);
    light = protectElement(light, /<g id="coupyn-og-logo"[^>]*>/, saved,
      '<rect data-brand-plate="detail" x="16" y="58" width="280" height="58" rx="10" fill="#10141c"/>');
  } else if (project === 'stervox') {
    light = protectElement(light, /<svg x="64" y="112"[^>]*>/, saved);
  } else {
    light = protectElement(light, /<svg id="codaris-brand-wordmark"[^>]*>/, saved);
    light = protectElement(light, /<g transform="translate\(137 67\) scale\(1\.15\)"[^>]*>/, saved,
      '<rect data-brand-plate="detail" x="132" y="62" width="56" height="56" rx="10" fill="#10141c"/>');
  }
  light = light.replace(/#[0-9a-f]{6}\b/gi, color => colors[color.toLowerCase()] ?? color);
  light = light.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (color, ...channels) => {
    const hex = '#' + channels.slice(0, 3).map(value => Number(value).toString(16).padStart(2, '0')).join('');
    return colors[hex] ?? color;
  });
  // The unchanged light-colored wordmarks need a compact dark contrast plate.
  const plate = '<rect data-brand-plate="main" x="48" y="96" width="446" height="104" rx="12" fill="#10141c"/>';
  const logoStart = project === 'coupyn'
    ? '<g transform="translate(19 24) scale(1.5)">'
    : saved[0].placeholder;
  light = light.replace(logoStart, plate + '\n' + logoStart);
  for (const { placeholder, original: logo, backplate } of saved) {
    light = light.replace(placeholder, backplate + logo);
    assert.ok(light.includes(logo), `${project} logo changed`);
  }
  await writeFile(new URL(`${file}-light.svg`, directory), light);
  assert.equal(await readFile(new URL(`${file}.svg`, directory), 'utf8'), original);
  console.log(`Created ${file}-light.svg; dark source and logos preserved.`);
}
