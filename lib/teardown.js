const fsExtra = require('fs-extra');

module.exports = async () => {
    const finalCss = Object
      .keys(process.env)
      .filter(k => k.startsWith('_UNBLOAT_'))
      .sort().reduce((css, key, i) => `${css}${i ? '\n' : ''}${process.env[key].replace(/&/g, `.${process.env.__UNBLOAT_PREFIX__}${key.replace('_UNBLOAT_', '')}`)}`, '');

    await fsExtra.outputFile(process.env.__UNBLOAT_OUTPUT__, finalCss);
};
