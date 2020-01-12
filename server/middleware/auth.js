const models = require('../models');
const Promise = require('bluebird');
const parseCookies = require('./cookieParser');

// -write functions that access parsed cookies on requests
// -looks up user data related to that session
// -assigns an object to a session property on the request with user info
//  (what info about user would want to keep in session object?)

// An incoming request with no cookies should generate a session with a unique hash and store it the sessions database. The middleware function should use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).

// If an incoming request has a cookie, the middleware should verify that the cookie is valid (i.e., it is a session that is stored in your database).
// If an incoming cookie is not valid, what do you think you should do with that session and cookie?

// res.headers.cookies = session.hash

// relevant user information = ('hash', 'userid')
module.exports.createSession = (req, res, next) => {

  if (!req.cookies.shortlyid) {

    return models.Sessions.create()
      .then((newHashId) => {
        return models.Sessions.get({id: newHashId.insertId});
      })
      .then((newSession) => {
        req.session = newSession;
        res.cookie('shortlyid', newSession.hash);// ?????
        next(req, res);
      });

  } else {

    return models.Sessions.get({hash: req.cookies.shortlyid})
      .then((newSession) => {
        // if newSession is undefined
        if (!newSession) {
          return models.Sessions.create()
            .then((newHashId) => {
              return models.Sessions.get({id: newHashId.insertId});
            })
            .then((newSession) => {
              req.session = newSession;
              sessionHash = newSession.hash;
              res.cookie('shortlyid', sessionHash); // ?????
              next(req, res);
            });
        } else {
          req.session = newSession;
          next(req, res);
        }
      });
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

// Add a verifySession helper function to all server routes that require login,
// redirect the user to a login page as needed.
// Require users to log in to see shortened links and create new ones.
// Do NOT require the user to login when using a previously shortened link.

module.exports.verifySession = (req, res, next) => {
  parseCookies(req, res, (req, res) => {
    exports.createSession(req, res, (req, res) => {
      // check to see if the cookieHash belongs to a user
      // if it does, assign
      next(req, res);
    });
  });
};

module.exports.deleteSession = (req, res, next) => {
  parseCookies(req, res, (req, res) => {
    // delete cookie in db
    models.Sessions.delete({hash: req.cookies.shortlyid})
    .then(() => {
      res.cookie('shortlyid', '')
      next(req, res);
    })
  })
};