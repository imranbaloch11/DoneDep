export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Authorization code is required' });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token exchange error:', tokenData);
      return res.status(400).json({ 
        success: false, 
        message: tokenData.error_description || tokenData.error 
      });
    }

    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('GitHub user fetch error:', userData);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to fetch user information from GitHub' 
      });
    }

    // Return success with token and user info
    res.status(200).json({
      success: true,
      access_token: tokenData.access_token,
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
      },
    });

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during GitHub authentication' 
    });
  }
}
