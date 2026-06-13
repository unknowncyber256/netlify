exports.handler = async (event) => {
  const { httpMethod, path, headers, body } = event;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
      body: '',
    };
  }

  // Determine target host (can be overridden by x-target-host header, default to munowatch.org)
  let targetHost = headers['x-target-host'];
  if (!targetHost) targetHost = 'munowatch.org';

  // Build the full target URL
  const targetUrl = `https://${targetHost}${path}`;

  // Prepare headers to forward (remove conflicting ones)
  const forwardHeaders = { ...headers };
  delete forwardHeaders['host'];
  delete forwardHeaders['x-target-host'];
  delete forwardHeaders['content-length'];

  const fetchOptions = {
    method: httpMethod,
    headers: forwardHeaders,
  };
  if (body) fetchOptions.body = body;

  try {
    const upstream = await fetch(targetUrl, fetchOptions);
    const responseBody = await upstream.text();

    const responseHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    };
    if (upstream.headers.get('content-type')) {
      responseHeaders['Content-Type'] = upstream.headers.get('content-type');
    }
    if (upstream.headers.get('set-cookie')) {
      responseHeaders['Set-Cookie'] = upstream.headers.get('set-cookie');
    }

    return {
      statusCode: upstream.status,
      headers: responseHeaders,
      body: responseBody,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Proxy failed', details: error.message }),
    };
  }
};
