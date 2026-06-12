const { OAuth2Client } = require('google-auth-library');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Generate Google OAuth URL
const getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
};

// Get tokens from authorization code
const getTokensFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Get user info from access token
const getUserInfo = async (accessToken) => {
  oauth2Client.setCredentials({ access_token: accessToken });
  const { credential } = await oauth2Client.verifyIdToken({
    idToken: accessToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return credential;
};

module.exports = {
  oauth2Client,
  getGoogleAuthUrl,
  getTokensFromCode,
  getUserInfo,
};
