exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Proxy function is working!' }),
  };
};    const upstream = await fetch(targetUrl, fetchOptions);
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
