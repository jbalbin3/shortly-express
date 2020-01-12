const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');


const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/logout',
  (req, res) => {
    Auth.deleteSession(req, res, (req, res) => {
      // console.log(res);
      res.status(200).redirect('/login');
    });
  });


app.get('/', // main entry point
  // check here if session active, if active redirect to index, else redirect to login
  // verifySession called here?
  (req, res) => {
    Auth.verifySession(req, res, (req, res) => {
      console.log('IS THE REQ SESSION =====>', req.session);
      if (models.Sessions.isLoggedIn(req.session)) {
        console.log('inside of TRUE of verify session');
        res.status(200).render('index');
      } else {
        console.log('inside of FALSE of verify session');
        res.status(200).redirect('/login');
      }
    });
  });

app.get('/login', // renders the login page
  (req, res) => {
    res.render('login');
  });

app.post('/login', // When someone is logging in POST
  (req, res) => { // req.body = username && password
    // call some sort of Promise
    // An object where the keys are column names and the values are the current values to be matched.
    // console.log('userInfo is undefined ======>', req.body.username);
    models.Users.get({ username: req.body.username})
      .then((userInfo) => { // has id, username, password, salt
        if (userInfo === undefined) {

          throw userInfo;
        } else {
          console.log('userInfo is ======>', userInfo);
          models.Users.compare(req.body.password, userInfo.password, userInfo.salt)
            // .then((isCorrectPassword) => {
              if (models.Users.compare(req.body.password, userInfo.password, userInfo.salt)) {
                Auth.verifySession(req, res, (req, res) => {
                  models.Sessions.update({hash: req.session.hash}, {userId: userInfo.id})
                    .then(() => {
                      res.setHeader('Content-Type', 'text/html');
                      res.status(201).redirect('/');
                    });
                });
              } else {
                res.redirect('/login');
              }
            // })
        }
      })
      .catch((error) => {
        console.log(error)
        res.redirect('/login');
      });
  });

app.get('/signup', // renders the signup page
  (req, res) => {
    res.render('signup');
  });

app.post('/signup', // When someone is signing up. POST
  (req, res) => {
    // call some sort of Promise
    models.Users.create({username: req.body.username, password: req.body.password}) // req.body =  username && password
      .then((userRecord) => {
        Auth.verifySession(req, res, (req, res) => {
          models.Sessions.update({hash: req.session.hash}, {userId: userRecord.insertId})
            .then(() => {
              res.setHeader('Content-Type', 'text/html');
              res.status(201).redirect('/');
            });
        });
      })
      .error(error => {
        res.redirect('/signup');
      });
  });

app.get('/links', // GET for all the links in the database
  (req, res, next) => {
    Auth.verifySession(req, res, (req, res) => {
      if (!models.Sessions.isLoggedIn(req.session)) {
        res.status(200).redirect('/login');
      } else {
        models.Links.getAll()
        .then(links => {
          res.status(201).send(links);
        })
        .error(error => {
          res.status(500).send(error);
        });

      }
    })
  });

app.post('/links',
  (req, res, next) => {

    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) { // checks if the link is valid
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url }) // checks to see if the link already exists
      .then(link => {
        if (link) {
          throw link; // if it does, throw an error with the link name?
        }
        return models.Links.getUrlTitle(url); // if it doesn't, create a title
      })
      .then(title => {
        return models.Links.create({ // create a new row with the link
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId }); // get the ID that is returned from the creation in the table
      })
      .then(link => {
        throw link; // means that the link is in the database
      })
      .error(error => {
        res.status(500).send(error); // error handling, could not add to database for some reason
      })
      .catch(link => {
        res.status(200).send(link); // means that the link is in the database
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => { // the endpoint for created URLs when being used

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      // console.log('inside of catch block of /:code');
      res.redirect('/');
    });
});

module.exports = app;
