// src/utils/LineLogin.js

// Function to start LINE Login
export const lineLogin = () => {
  const LINE_CHANNEL_ID = import.meta.env.VITE_LINE_CHANNEL_ID;
  const CALLBACK_URL = import.meta.env.VITE_LINE_CALLBACK_URL;

  // URL for LINE Login authorization
  const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${CALLBACK_URL}&state=12345&scope=profile%20openid`;

  // Redirect to LINE Login page
  window.location.href = lineLoginUrl;
};

// Function to exchange the authorization code for an access token
export const exchangeCodeForAccessToken = async (code) => {
  const LINE_CHANNEL_ID = import.meta.env.VITE_LINE_CHANNEL_ID;
  const LINE_CHANNEL_SECRET = import.meta.env.VITE_LINE_CHANNEL_SECRET;
  const CALLBACK_URL = import.meta.env.VITE_LINE_CALLBACK_URL;

  const url = 'https://api.line.me/oauth2/v2.1/token';

  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: CALLBACK_URL,
    client_id: LINE_CHANNEL_ID,
    client_secret: LINE_CHANNEL_SECRET,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.ok) {
      const result = await response.json();
      return result.access_token;
    } else {
      throw new Error('Failed to exchange code for access token');
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Function to get user profile using access token
export const getLineProfile = async (accessToken) => {
  try {
    const response = await fetch('https://api.line.me/v2/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data; // returns the profile data (name, pictureUrl, etc.)
    } else {
      throw new Error('Failed to fetch user profile');
    }
  } catch (error) {
    console.error('Error fetching Line profile:', error);
    return null;
  }
};
