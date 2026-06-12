const authService = require('../services/authService');
const { getGoogleAuthUrl } = require('../config/google-oauth');

exports.register = async (req, res) => {
  console.log('BODY REGISTER headers:', req.headers);
  console.log('BODY REGISTER typeof body:', typeof req.body);
  try {
    console.log('BODY REGISTER keys:', Object.keys(req.body || {}));
    console.log('BODY REGISTER full:', req.body);
  } catch (e) {
    console.log('BODY REGISTER keys error:', e.message);
  }
  try {
    let payload = req.body;
    // fallback: if body is a string (unparsed), try to parse
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (pe) {
        console.log('Failed to parse body string:', pe.message);
      }
    }

    // if body is a Buffer (from raw middleware), convert
    if (Buffer.isBuffer(payload)) {
      try {
        payload = JSON.parse(payload.toString());
      } catch (pe) {
        console.log('Failed to parse body buffer:', pe.message);
      }
    }

    const result = await authService.register(payload);
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  console.log('BODY LOGIN:', req.body);

  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const result =
      await authService.forgotPassword(req.body);

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result =
      await authService.resetPassword(req.body);

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Initiate Google OAuth flow
exports.initGoogleOAuth = (req, res) => {
  try {
    const authUrl = getGoogleAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    res.status(500).json({ message: error.message });
  }
};

// Handle Google OAuth callback
exports.googleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code not found' });
    }

    // Process Google OAuth callback
    const { token, user } = await authService.googleOAuthCallback(code);

    // Encode user data for URL
    const encodedUser = encodeURIComponent(JSON.stringify(user));

    // Redirect to frontend with token and user data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/google/callback?token=${token}&user=${encodedUser}&role=${user.role}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
  }
};

exports.googleLoginWithToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    const result = await authService.googleLoginWithToken(token);
    res.json(result);
  } catch (err) {
    console.error('Google token login error:', err);
    res.status(400).json({ message: err.message });
  }
};