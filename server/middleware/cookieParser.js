// import sessions

// grabs incoming cookies
// parse them into an object
// assign cookiesObjectAfterParsing to a cookies property on the requests
// req.cookies = cookiesObjectAfterParsing

// headers:
// { cookie:
//    'shortlyid=18ea4fb6ab3178092ce936c591ddbb90c99c9f66; otherCookie=2a990382005bcc8b968f2b18f8f7ea490e990e78; anotherCookie=8a864482005bcc8b968f2b18f8f7ea490e577b20' },

//   headers:
//   cookie:
//   '{
    // shortlyid: '18ea4fb6ab3178092ce936c591ddbb90c99c9f66',
//    otherCookie: 2a990382005bcc8b968f2b18f8f7ea490e990e78,
//    anotherCookie: 8a864482005bcc8b968f2b18f8f7ea490e577b20'
//  }
// JSON.parse('{"' + str.replace(/[=]/g, '":"').replace(/[;]/g, '","') + '"}')
const parseCookies = (req, res, next) => {

  let cookiesObjectAfterParsing;
  if (req.headers.cookie !== undefined) {
    cookiesObjectAfterParsing = JSON.parse('{"' + req.headers.cookie.replace(/=/g, '":"').replace(/; /g, '","') + '"}');
    req.cookies = cookiesObjectAfterParsing;
  } else {
    req.cookies = {};
  }

  next();
};

module.exports = parseCookies;