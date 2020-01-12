// grabs incoming cookies
// parse them into an object
// assign cookiesObjectAfterParsing to a cookies property on the requests
// req.cookies = cookiesObjectAfterParsing


const parseCookies = (req, res, next) => {

  let cookiesObjectAfterParsing;
  if (req.headers.cookie !== undefined) {
    cookiesObjectAfterParsing = JSON.parse('{"' + req.headers.cookie.replace(/=/g, '":"').replace(/; /g, '","') + '"}');
    req.cookies = cookiesObjectAfterParsing;
  } else {
    req.cookies = {};
  }
  next(req, res);
};

module.exports = parseCookies;