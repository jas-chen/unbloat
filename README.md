# unbloat
> Atomic CSS in JS



## What
To prevent CSS file from bloating.

It's like [Atomic CSS](https://acss.io/), but you don't have to remember [all the complex syntax](https://acss.io/guides/atomic-classes.html).



## Feature
- Styled-component like syntax, well supported by editors
- Can be used in server side (Python, Ruby, Go, etc), as long as it can parse JSON
- Zero runtime - build to static CSS file



## Installation

```
yarn add "https://github.com/jas-chen/unbloat#0.0.4"
```



## Setup

1. Create a file `unbloat.jest.config.js` under the project root
```
const path = require('path');

module.exports = require('unbloat')({
  output: path.join(__dirname, 'src', 'style.css'),
});
```

2. Add a script in the `package.json`
```
"scripts": {
  "unbloat": "jest --config=unbloat.jest.config.js"
},
```

3. Ignore generated files
`.gitignore`
```
src/style.css
*.css.json
```



## Example
`src/button.css.json.js`
```
const PRIMARY_COLOR = '#007bff';

test(__filename, async () => {
  await css`
    .primary {
      cursor: pointer;
      color: #fff;
      background-color: ${PRIMARY_COLOR};
      text-align: center;
      user-select: none;
      border: 1px solid ${PRIMARY_COLOR};
      padding: .375rem .75rem;
      border-radius: .25rem;
      transition:
        color .15s ease-in-out,
        background-color .15s ease-in-out,
        border-color .15s ease-in-out;

      &:hover {
        background-color: #0069d9;
        border-color: #0062cc;
      }

      @media (min-width: 501px) {
        display: inline-block;
      }

      @media (max-width: 500px) {
        display: block;
      }
    }
  `;
});
```


## Inspiration
- [Atomic CSS Modules](https://medium.com/yplan-eng/atomic-css-modules-cb44d5993b27)
- [Un-bloat CSS by using multiple classes](https://css-tricks.com/un-bloat-css-by-using-multiple-classes/)
- [Styletron](https://www.styletron.org/)



## License
MIT
