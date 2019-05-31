// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
//
// const { window } = new JSDOM(``, {
//     url: "http://localhost"
// });

// const window = jsdom.jsdom().defaultView;
//
// module.exports = window;

import * as jsdom from 'jsdom';
const { JSDOM } = jsdom;

const { window } = new JSDOM(``, {
    url: "http://localhost"
});

export {
    window
}
