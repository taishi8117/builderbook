const passport = require('passport');
const Strategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('./models/User');

function auth({ ROOT_URL, server }) {
  const verify = async (accessToken, refreshToken, profile, verified) => {
    let email;
    let avatarUrl;

    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.photos && profile.photos.length > 0) {
      avatarUrl = profile.photos[0].value.replace('sz=50', 'sz=128');
    }

    try {
      const user = await User.signInOrSignUp({
        googleId: profile.id,
        email,
        googleToken: { accessToken, refreshToken },
        displayName: profile.displayName,
        avatarUrl,
      });
      verified(null, user);
    } catch (err) {
      verified(err);
        console.log(err); // eslint-disable-line
    }
  };
  // 1. define `verify` function: get profile and googleToken from Google AND
  // 2. call and wait for static method `signInOrSignUp` to return user
  passport.use(
    new Strategy(
      {
        clientID: process.env.Google_clientID,
        clientSecret: process.env.Google_clientSecret,
        callbackURL: `${ROOT_URL}/oauth2callback`,
      },
      verify,
    ),
  );

  // 3. serialize user AND
  // deserialize user;

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, User.publicFields(), (err, user) => {
      done(err, user);
    });
  });

  // 4. initial passport AND
  // save session to keep user logged in (via browser cookie);

  server.use(passport.initialize());
  server.use(passport.session());

  // Express routes
  server.get(
    '/auth/google',
    passport.authenticate('google', {
      // 1. options such as scope and prompt
      scope: ['profile', 'email'],
      prompt: 'select_account',
    }),
  );

  server.get(
    '/oauth2callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // 2. if successful, redirect user to Index page (`/`)
      if (req.user && req.user.isAdmin) {
        res.redirect('/admin');
      } else {
        res.redirect('/my-books');
      }
    },
  );

  server.get('/logout', (req, res) => {
    // 3. remove `req.user` property and user id from session, redirect to Login page
    req.logout();
    res.redirect('/login');
  });
}

module.exports = auth;
