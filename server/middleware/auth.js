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

// it('assigns a username and userId property to the session object if the session is assigned to a user', function(done) {
//   var requestWithoutCookie = httpMocks.createRequest();
//   var response = httpMocks.createResponse();
//   var username = 'BillZito';

//   db.query('INSERT INTO users (username) VALUES (?)', username, function(error, results) {
//     if (error) { return done(error); }
//     var userId = results.insertId;

//     createSession(requestWithoutCookie, response, function() {
//       var hash = requestWithoutCookie.session.hash;
//       db.query('UPDATE sessions SET userId = ? WHERE hash = ?', [userId, hash], function(error, result) {

//         var secondResponse = httpMocks.createResponse();
//         var requestWithCookies = httpMocks.createRequest();
//         requestWithCookies.cookies.shortlyid = hash;

//         createSession(requestWithCookies, secondResponse, function() {
//           var session = requestWithCookies.session;
//           expect(session).to.be.an('object');
//           expect(session.user.username).to.eq(username);
//           expect(session.userId).to.eq(userId);
//           done();
//         });
//       });
//     });
//   });
// });

//session.userId

// relevant user information = ('hash', 'userid')
module.exports.createSession = (req, res, next) => {

  if (!req.cookies[0]) {
    // add a new cookie
    return models.Sessions.create()
      .then((newHashId) => {
        return models.Sessions.get({id: newHashId.insertId});
      })
      .then((newSession) => {
        req.session = newSession;
        res.cookies = {shortlyid: {value: newSession.hash}}; // ?????
        console.log(newSession);
        next();
      });

  } else {
    // check valid cookie
    console.log('SHOULD NOT BE HERE');
    next();
  }

  // console.log('req.session.hash========>', req.session.hash )
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// checking username