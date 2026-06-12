const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getTokensFromCode } = require('../config/google-oauth');
const axios = require('axios');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.register = async ({ name, username, email, password }) => {
  const finalName = name || username;

  if (!finalName || !email || !password) {
    throw new Error('All fields are required');
  }

  const check = await pool.query('SELECT * FROM users WHERE email=$1', [
    email,
  ]);

  if (check.rows.length > 0) {
    throw new Error('Email sudah ada');
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users
    (
      name,
      email,
      password,
      provider
    )
    VALUES
    (
      $1,$2,$3,'local'
    )
    RETURNING id,name,email,role
    `,
    [finalName, email, hashed],
  );

  const user = result.rows[0];

  // create token so frontend can auto-login if desired
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' },
  );

  return { token, user };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const result = await pool.query(
    'SELECT id, name, email, password, role FROM users WHERE email = $1',
    [email],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Kredensial salah');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' },
  );

  // do not expose password
  delete user.password;

  return { token, user };
};

// Handle Google OAuth callback
exports.googleOAuthCallback = async (code) => {
  try {
    // Get tokens from authorization code
    const tokens = await getTokensFromCode(code);
    
    // Get user info from Google
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const { email, name, picture, id: google_id } = response.data;

    // Check if user exists
    let userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email]
    );

    let user = userResult.rows[0];

    // If user doesn't exist, create new user with google provider
    if (!user) {
      const createResult = await pool.query(
        `
        INSERT INTO users
        (
          name,
          email,
          password,
          provider,
          google_id,
          avatar
        )
        VALUES
        (
          $1, $2, $3, $4, $5, $6
        )
        RETURNING id, name, email, role
        `,
        [name, email, 'google-oauth', 'google', google_id, picture]
      );

      user = createResult.rows[0];
    } else {
      // Update existing user with google info if not already set
      await pool.query(
        'UPDATE users SET google_id = $1, avatar = $2, provider = $3 WHERE id = $4',
        [google_id, picture, 'google', user.id]
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return { token, user };
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw new Error('Failed to authenticate with Google: ' + error.message);
  }
};

exports.googleLoginWithToken = async (accessToken) => {
  try {
    // Get user info from Google
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { email, name, picture, id: google_id } = response.data;

    // Check if user exists
    let userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email]
    );

    let user = userResult.rows[0];

    // If user doesn't exist, create new user with google provider
    if (!user) {
      const createResult = await pool.query(
        `
        INSERT INTO users
        (
          name,
          email,
          password,
          provider,
          google_id,
          avatar
        )
        VALUES
        (
          $1, $2, $3, $4, $5, $6
        )
        RETURNING id, name, email, role
        `,
        [name, email, 'google-oauth', 'google', google_id, picture]
      );

      user = createResult.rows[0];
    } else {
      // Update existing user with google info if not already set
      await pool.query(
        'UPDATE users SET google_id = $1, avatar = $2, provider = $3 WHERE id = $4',
        [google_id, picture, 'google', user.id]
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return { token, user };
  } catch (error) {
    console.error('Google token login error:', error);
    throw new Error('Failed to authenticate with Google token: ' + error.message);
  }
};

exports.forgotPassword = async ({ email }) => {
  if (!email) throw new Error('Email wajib diisi');

  const check = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
  if (check.rows.length === 0) {
    // Return success to prevent email enumeration, or throw error depending on design.
    // We throw error here so the user knows if the email doesn't exist.
    throw new Error('Email tidak ditemukan');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expiry to 1 hour
  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  // Save to database
  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
    [hashedToken, tokenExpiry, email]
  );

  // Build reset URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;

  // Configure email transport
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const port = parseInt(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Fallback to testing Ethereal account if no env vars are set
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'fanny.lind@ethereal.email',
          pass: 'XbW71wT88xHbMvY3mE'
      }
    });
  }

  const mailOptions = {
    from: '"Learnit Support" <noreply@learnit.com>',
    to: email,
    subject: 'Reset Password Notification',
    html: `
      <div style="background-color: #f3f4f6; padding: 40px; font-family: sans-serif; color: #333;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center;">
          <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Hello!</h1>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.5;">
            You are receiving this email because we received a password reset request for your account.
          </p>
          <a href="${resetUrl}" style="background-color: #111827; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 30px;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            This password reset link will expire in 60 minutes.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            If you did not request a password reset, no further action is required.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: left;">
            If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
            <br>
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} Learnit. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Email send failed:", error);
    // Ignore error in dev so user can still copy the link from console if email fails
    console.log("Fallback Reset URL: ", resetUrl);
  }

  return { message: 'Jika email terdaftar, tautan reset password telah dikirim ke kotak masuk Anda.' };
};

exports.resetPassword = async ({ email, token, password }) => {
  if (!email || !token || !password) {
    throw new Error('Semua bidang (email, token, password) wajib diisi');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const check = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > NOW()',
    [email, hashedToken]
  );

  if (check.rows.length === 0) {
    throw new Error('Token tidak valid atau sudah kedaluwarsa');
  }

  const newHashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2',
    [newHashedPassword, email]
  );

  return { message: 'Password Anda berhasil direset. Silakan login dengan password baru.' };
};