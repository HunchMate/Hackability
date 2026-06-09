export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirect_uri = `${protocol}://${host}/api/callback`;

    const clientId = (process.env.OAUTH_CLIENT_ID || '').trim();
    const clientSecret = (process.env.OAUTH_CLIENT_SECRET || '').trim();

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code.trim(),
        redirect_uri
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).send(`
        <div style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ffcdd2; border-radius: 8px; background: #ffebee;">
          <h2 style="color: #c62828;">Authentication Failed</h2>
          <p><strong>Error:</strong> <code>${data.error}</code></p>
          <p><strong>Reason:</strong> ${data.error_description}</p>
          <hr style="border-color: #ffcdd2; margin: 20px 0;">
          <h3 style="color: #c62828;">How to fix this:</h3>
          <ol style="line-height: 1.6;">
            <li><strong>Did you refresh this popup?</strong> The login code can only be used once. Close this window and click the Login button again.</li>
            <li><strong>Did you forget to Redeploy?</strong> After adding your Client ID and Client Secret in Vercel, you MUST go to the Deployments tab and click <strong>Redeploy</strong>. Environment variables don't apply until you do a fresh deployment.</li>
            <li><strong>Is the Client Secret correct?</strong> Double-check that you copied the exact Client Secret from GitHub (not the Client ID twice) and that there are no extra spaces.</li>
          </ol>
          <p>Please close this popup and try again.</p>
        </div>
      `);
    }

    const token = data.access_token;
    const provider = 'github';

    // Decap CMS expects this specific postMessage format from the popup window
    const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            window.opener.postMessage(
              'authorization:${provider}:success:${JSON.stringify({ token, provider })}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:${provider}", "*");
        })();
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(script);
    
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).send('Internal Server Error');
  }
}
