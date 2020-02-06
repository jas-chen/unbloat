const path = require('path');
const fsExtra = require('fs-extra');
const md5Hex = require('md5-hex');

module.exports = async () => {
    const finalCss = Object
      .keys(process.env)
      .filter(k => k.startsWith('_UNBLOAT_'))
      .sort().reduce((css, key) => {
        css.push(`${process.env[key].replace(/&/g, `.${process.env.__UNBLOAT_PREFIX__}${key.replace('_UNBLOAT_', '')}`)}`);
        return css;
      }, []);

    if (process.env.NODE_ENV !== 'production') {
      const file = path.join(process.env.__UNBLOAT_DEST__, 'style.css');
      await fsExtra.outputFile(file, finalCss.join(''));
      console.log(file);
    } else {
      const files = finalCss.reduce((files, css) => {
        const media = css.startsWith('@media')
          ? css.split('{')[0].replace('@media', '').trim()
          : 'all';

        if (!files.hasOwnProperty(media)) {
          files[media] = [css];
        } else {
          files[media].push(css);
        }

        return files;
      }, {});

      await Promise.all(Object.keys(files).map(media => {
        const content = files[media].join('');
        const hash = md5Hex(content).substring(0, 10);
        const file = path.join(process.env.__UNBLOAT_DEST__, `style.${media}.${hash}.css`);
        files[media] = file;
        return fsExtra.outputFile(file, content).then(() => console.log(file));
      }));

      const manifastFile = path.join(process.env.__UNBLOAT_DEST__, 'style-manifast.json');
      await fsExtra.outputFile(manifastFile, JSON.stringify(files, null, 2));
      console.log(manifastFile);
    }
};
