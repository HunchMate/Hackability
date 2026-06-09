export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirect_uri = `${protocol}://${host}/api/callback`;

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code,
        redirect_uri
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error, error_description: data.error_description });
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
