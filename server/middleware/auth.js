const models = require('../models');
const Promise = require('bluebird');

// -write functions that access parsed cookies on requests
// -looks up user data related to that session
// -assigns an object to a session property on the request with user info
//  (what info about user would want to keep in session object?)

// An incoming request with no cookies should generate a session with a unique hash and store it the sessions database. The middleware function should use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).

// If an incoming request has a cookie, the middleware should verify that the cookie is valid (i.e., it is a session that is stored in your database).
// If an incoming cookie is not valid, what do you think you should do with that session and cookie?

// res.headers.cookies = session.hash


/*
it('assigns a session object to the request if a session already exists', function(done) {

  var requestWithoutCookie = httpMocks.createRequest();
  var response = httpMocks.createResponse();

  createSession(requestWithoutCookie, response, function() {
    var cookie = response.cookies.shortlyid.value;
    var secondResponse = httpMocks.createResponse();
    var requestWithCookies = httpMocks.createRequest();
    requestWithCookies.cookies.shortlyid = cookie;

    createSession(requestWithCookies, secondResponse, function() {
      var session = requestWithCookies.session;
      expect(session).to.be.an('object');
      expect(session.hash).to.exist;
      expect(session.hash).to.be.cookie;
      done();
    });
  });
});
*/


// relevant user information = ('hash', 'userid')
module.exports.createSession = (req, res, next) => {

  if (!req.cookies.shortlyid) {
    // console.log('===========> requestObject: ', req.cookies);
    // add a new cookie
    return models.Sessions.create()
      .then((newHashId) => {
        return models.Sessions.get({id: newHashId.insertId});
      })
      .then((newSession) => {
        req.session = newSession;
        res.cookies = {shortlyid: {value: newSession.hash}}; // ?????
        next();
      });

  } else {
    // check valid cookie
    // console.log('VALID SESSION: ', req.cookies.shortlyid);
    // console.log('ISLOGGEDIN: ', req.cookies.shortlyid);

    return models.Sessions.get({hash: req.cookies.shortlyid})
      .then((newSession) => {
        console.log('newSession without valid cookie: ', newSession);
        req.session = newSession;
        next();
      });
    // find the cookieHash at req.cookies.shortlyid.value
    // check to see if the cookie belongs to a user
    // if it does add the user id and username to the session obj
    // else
    // ?????
    // next(); // needs to be nested
  }
};

// models.Users.get({id: newSession.id})
//   .then((userRow) => {
//     console.log('userRow obj ======>', userRow);
//     req.session.user = {username: userRow.username};
//     next();
//   })

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// checking username