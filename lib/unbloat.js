const path = require('path');
const fsExtra = require('fs-extra');
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

module.exports = (config = {}) => {
  const {
    dest,
    prefix = 'c-',
    hash = css => md5Hex(css).substring(0, 8),
    plugins = [require('postcss-nested')],
  } = config;

  if (!dest) {
    throw new Error('Destination is required');
  }

  process.env.__UNBLOAT_PREFIX__ = prefix;
  process.env.__UNBLOAT_DEST__ = dest;

  const postcss = createPostcss(plugins);

  return {
    testMatch: ['**/?(*.)+(json).[jt]s?(x)'],
    watchPathIgnorePatterns: ['.css.json$'],
    globalTeardown: path.join(__dirname, 'teardown.js'),
    globals: {
      css: (list, ...variables) => {
        const content = toCSS(list, variables);
        const json = {};
        const src = new Error().stack.split('\n').find(msg => /\.css\.json\.js/.test(msg)).trim().replace(/:\d+:\d+\)$/, '').replace(/\.js$/, '').split('(')[1];

        return postcss.process(content, { from: undefined })
          .then(result => {
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

                let curCss = process.env[`_UNBLOAT_${key}`];

                if (!curCss) {
                  process.env[`_UNBLOAT_${key}`] = css;
                } else if (css !== curCss) {
                  throw new Error(`Hash conflict:\n${css}\nand\n${curCss}\nhave the same hash key: ${key}`);
                }

                json[className] = json[className] ? `${json[className]} ${prefix}${key}` : `${prefix}${key}`;
              });
            } catch (e) {
              console.log(`Processed CSS (via PostCSS):\n${result.css}\n\n`);
              throw e;
            }

            return fsExtra.outputFile(src, JSON.stringify(json, null, 2));
          })
          .catch(e => {
            console.log(`Raw CSS:\n${content}\n\n`);
            throw e;
          });
      },
    }
  };
}
