const fs = require('fs');
const createPostcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const md5Hex = require('md5-hex');

const findClassName = selector => {
  let classCount = 0;
  let className;
  const transformer = selectorParser(selectors => {
    selectors.walk(selector => {
      if (selector.type === 'class') {
        classCount += 1;
        if (classCount > 1) {
          throw new Error(`Multiple classes found: ${selectors.toString()}`);
        }

        className = selector.value;
      }
    });
  });

  transformer.processSync(selector);
  return className;
}

const toCSS = (list, variables) => {
  const tokens = variables.reduce((result, variable, i) => {
    result.push(variable);
    result.push(list[i + 1]);
    return result;
  }, [list[0]]);

  return tokens.join('');
}

const db = {};

module.exports = (config = {}) => {
  const {
    output,
    prefix = 'c-',
    hash = css => md5Hex(css).substring(0, 8),
    plugins = [require('postcss-nested')],
  } = config;

  const postcss = createPostcss(plugins);

  if (!output) {
    throw new Error('Output is required');
  }

  return {
    testMatch: ['**/?(*.)+(json).[jt]s?(x)'],
    watchPathIgnorePatterns: ['.css.json$'],
    globals: {
      css: (list, ...variables) => {
        const content = toCSS(list, variables);
        const json = {};
        const src = new Error().stack.split('\n').find(msg => /\.css\.json\.js/.test(msg)).trim().replace(/:\d+:\d+\)$/, '').replace(/\.js$/, '').split('(')[1];

        return postcss.process(content, { from: undefined })
          .then(result => {
            let hasNewCss;

            try {
              result.root.walkDecls(decl => {
                const rule = decl.parent;
                const { parent } = rule;
                const media = parent.type === 'atrule' ? parent.params.replace(/\s+/g, '') : '';
                const className = findClassName(rule.selector);
                let css = `${rule.selector.replace(`.${className}`, '&')}{${decl.toString()}}`;
                if (media) css = `@media ${media}{${css}}`;
                css = css.replace(/\s+/g, ' ').replace(/: /g, ':').replace(/, /g, ',');

                const key = hash(css);

                let curCss = db[key];

                if (!curCss) {
                  hasNewCss = true;
                  db[key] = css;
                } else if (css !== curCss) {
                  throw new Error(`Hash conflict:\n${css}\nand\n${curCss}\nhave the same hash key: ${key}`);
                }

                json[className] = json[className] ? `${json[className]} ${prefix}${key}` : `${prefix}${key}`;
              });
            } catch (e) {
              console.log(`Processed CSS (via PostCSS):\n${result.css}\n\n`);
              throw e;
            }

            fs.writeFileSync(src, JSON.stringify(json, null, 2));
            if (hasNewCss) {
              const finalCss = Object.keys(db).sort().reduce((css, key, i) => `${css}${i ? '\n' : ''}${db[key].replace(/&/g, `.${prefix}${key}`)}`, '');
              fs.writeFileSync(output, finalCss);
            }
          })
          .catch(e => {
            console.log(`Raw CSS:\n${content}\n\n`);
            throw e;
          });
      },
    }
  };
}
