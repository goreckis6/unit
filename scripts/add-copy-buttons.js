const fs = require('fs');
const path = require('path');

const calcRoot = path.join(__dirname, '../app/[locale]/calculators');

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (e.name === 'calculator.tsx') files.push(full);
  }
  return files;
}

const files = walk(calcRoot);
let added = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('CopyButton')) continue;

  let changed = false;

  // Add CopyButton to result-value-box with unit (e.g. result.toFixed(4) + " W")
  const withUnit = /<div className="result-value-box">\s*\n\s*<span className="result-value">\{([^}]+)\}<\/span>\s*\n\s*<span className="result-unit">([^<]+)<\/span>\s*\n\s*<\/div>/g;
  content = content.replace(withUnit, (match, valueExpr, unit) => {
    changed = true;
    const u = unit.trim();
    return `<div className="result-value-box">\n                <span className="result-value">{${valueExpr}}</span>\n                <span className="result-unit">${u}</span>\n                <CopyButton text={\`\${${valueExpr}} ${u}\`} />\n              </div>`;
  });

  // Add CopyButton to result-value-box without unit (single value) - only if no CopyButton on same line
  const noUnit = /<div className="result-value-box">\s*\n\s*<span className="result-value">\{([^}]+)\}<\/span>\s*\n\s*<\/div>/g;
  content = content.replace(noUnit, (match, valueExpr) => {
    changed = true;
    return `<div className="result-value-box">\n                <span className="result-value">{${valueExpr}}</span>\n                <CopyButton text={String(${valueExpr})} />\n              </div>`;
  });

  if (changed) {
    if (content.includes("useScrollToResult")) {
      content = content.replace(
        /import \{ useScrollToResult \} from '@\/hooks\/useScrollToResult';/,
        "import { useScrollToResult } from '@/hooks/useScrollToResult';\nimport { CopyButton } from '@/components/CopyButton';"
      );
    } else {
      content = content.replace(
        /(import \{ useTranslations \} from 'next-intl';)/,
        "$1\nimport { CopyButton } from '@/components/CopyButton';"
      );
    }
    added++;
  }
  fs.writeFileSync(file, content);
}

console.log('Added CopyButton to', added, 'calculators (skipped already having it).');
