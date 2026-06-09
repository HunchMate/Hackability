export default function handler(req, res) {
  const client_id = (process.env.OAUTH_CLIENT_ID || '').trim();
  
  if (!client_id) {
    return res.status(500).send('OAUTH_CLIENT_ID is not configured in Vercel Environment Variables');
  }

  // Determine the host dynamically or use the VERCEL_URL environment variable
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirect_uri = `${protocol}://${host}/api/callback`;

  // Redirect to GitHub for OAuth
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  
  res.redirect(githubAuthUrl);
}
