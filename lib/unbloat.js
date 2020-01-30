const fs = require('fs');
const path = require('path');
const createPostcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

const version = '0.0.1';

const normalizeSelector = (function() {
  const transformer = selectorParser();
  return selector => transformer.processSync(selector, { lossless: false });
} ());

const findClassName = selector => {
  let classCount = 0;
  let className;
  const transformer = selectorParser(selectors => {
    selectors.walk(selector => {
      if (selector.type === 'class') {
        classCount += 1;
        if (classCount > 1) {
          throw new Error(`Multiple classes found: ${selector}`);
        }

        className = selector.value;
      }
    });
  });

  transformer.processSync(selector);
  return className;
}

const postcss = createPostcss([
  require('postcss-nested'),
  require('cssnano')({
    preset: 'default',
  }),
]);

const toCSS = (list, variables) => {
  const tokens = variables.reduce((result, variable, i) => {
    result.push(variable);
    result.push(list[i + 1]);
    return result;
  }, [list[0]]);

  return tokens.join('');
}

let db;

try {
  db = JSON.parse(fs.readFileSync(UNBLOAT_LOCK));
  if (db.version !== version) {
    throw new Error('Version of unbloat lockfile not match.');
  }
} catch(e) {}

if (!db) {
  db = {
    version,
    id: 0,
    data: {},
  };
}

module.exports = rootPath => ({
  testMatch: ['**/?(*.)+(json).[jt]s?(x)'],
  globals: {
    css: (list, ...variables) => {
      const content = toCSS(list, variables);
      const json = {};
      const src = new Error().stack.split('\n').find(msg => /\.css\.json\.js/.test(msg)).trim().replace('at Object.<anonymous> (', '').replace(/:\d+:\d+\)$/, '').replace(/\.js$/, '');

      return postcss.process(content, { from: undefined }).then(result => {
        // const final = [];
        result.root.walkDecls(decl => {
          const rule = decl.parent;
          const { parent } = rule;
          const media = parent.type === 'atrule' ? parent.params.replace(/\s+/g, '') : '';
          const selector = normalizeSelector(rule.selector);
          const className = findClassName(selector);
          let key = `${selector.replace(`.${className}`, '&')}{${decl.toString()}}`;
          if (media) key = `@media ${media}{${key}}`;

          if (!json.hasOwnProperty(className)) {
            json[className] = '';
          }

          let cls = db.data.hasOwnProperty(key) ? db.data[key] : undefined;

          if (!cls) {
            cls = `c-${(db.id++).toString(16)}`;
            let css = `${selector.replace(`.${className}`, `.${cls}`)}{${decl.toString()}}`;
            if (media) css = `@media ${media}{${css}}`;
            db.data[key] = cls;
          }

          json[className] = `${json[className]} ${cls}`.trim();
        });
        console.log(db);
        console.log(json);
        fs.writeFileSync(src, JSON.stringify(json, null, 2));
        fs.writeFileSync(path.join(rootPath, 'unbloat-lock.json'), JSON.stringify(db, null, 2));
      });
    },
  }
});
