const qs = require('qs');
const request = require('request');
const GithubAPI = require('@octokit/rest');

const User = require('./models/User');

const AUTHORIZE_URI = 'https://github.com/login/oauth/authorize';
const TOKEN_URI = 'https://github.com/login/oauth/access_token';

function setupGithub({ server }) {
  const dev = process.env.NODE_ENV !== 'production';

  const CLIENT_ID = dev ? process.env.Github_Test_ClientID : process.env.Github_Live_ClientID;
  const API_KEY = dev ? process.env.Github_Test_SecretKey : process.env.Github_Live_SecretKey;

  server.get('/auth/github', (req, res) => {
    // 1. check if user exists and user is Admin
    // If not, redirect to Login page, return undefined
    if (!req.user || !req.user.isAdmin) {
      res.redirect('/login');
      return;
    }
    // 2. Redirect to Github's OAuth endpoint

    res.redirect(
      `${AUTHORIZE_URI}?${qs.stringify({
        scope: 'repo',
        state: req.session.state,
        client_id: CLIENT_ID,
      })}`,
    );
  });

  server.get('/auth/github/callback', (req, res) => {
    // 3. check if user exists and user is Admin
    // If not, redirect to Login page, return undefined
    if (!req.user || !req.user.isAdmin) {
      res.redirect('/login');
      return;
    }
    // 4. return undefined if req.query has error

    if (req.query.error) {
      res.redirect(`/admin?error=${req.query.error_description}`);
      return;
    }

    const { code } = req.query;
    request.post(
      // 5. send request from our server to Github's server
      {
        url: TOKEN_URI,
        headers: { Accept: 'application/json' },
        form: {
          client_id: CLIENT_ID,
          code,
          client_secret: API_KEY,
        },
      },
      async (err, response, body) => {
        // 6. return undefined if result has error
        if (err) {
          res.redirect(`/admin?error=${err.message || err.toString()}`);
          return;
        }

        const result = JSON.parse(body);
        if (result.error) {
          res.redirect(`/admin?error=${result.error_description}`);
          return;
        }
        // 7. update User document on database
        try {
          await User.updateOne(
            { _id: req.user.id },
            { $set: { isGithubConnected: true, githubAccessToken: result.access_token } },
          );
          res.redirect('/admin');
        } catch (err2) {
          res.redirect(`/admin?error=${err2.message || err2.toString()}`);
        }
      },
    );
  });
}

function getAPI({ accessToken }) {
  const github = new GithubAPI({
    // 8. set parameters for new GithubAPI()
    auth: accessToken,
    request: { timeout: 10000 },
  });

  return github;
}

function getRepos({ accessToken }) {
  // 9. function that gets list of repos for user
  const github = getAPI({ accessToken });

  return github.repos.list({ per_page: 100 });
}

function getContent({ accessToken, repoName, path }) {
  // 10. function that gets repo's content
  const github = getAPI({ accessToken });
  const [owner, repo] = repoName.split('/');

  return github.repos.getContents({ owner, repo, path });
}

function getCommits({ accessToken, repoName, limit }) {
  // 11. function that gets list of repo's commits
  const github = getAPI({ accessToken });
  const [owner, repo] = repoName.split('/');

  return github.repos.listCommits({ owner, repo, per_page: limit });
}

exports.setupGithub = setupGithub;
exports.getRepos = getRepos;
exports.getContent = getContent;
exports.getCommits = getCommits;
