const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';
const ALLOWED_SITE = '3ren9zi.github.io';

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    },
  });
}

function loginResult(payload) {
  const message = `authorization:github:${payload.token ? 'success' : 'error'}:${JSON.stringify(payload)}`;
  return html(`<!doctype html><meta charset="utf-8"><title>八重原サイト管理 認証</title>
    <p>認証処理中です。この画面は自動的に閉じます。</p>
    <script>
      (() => {
        const message = ${JSON.stringify(message)};
        function receiveMessage(event) {
          if (event.source !== window.opener) return;
          window.opener.postMessage(message, event.origin);
          window.close();
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener?.postMessage('authorizing:github', '*');
      })();
    </script>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      if (!env.GITHUB_CLIENT_ID) return html('<h1>認証設定が未完了です</h1>', 503);
      const siteId = url.searchParams.get('site_id');
      if (siteId && siteId !== ALLOWED_SITE) return html('<h1>許可されていないサイトです</h1>', 403);
      const state = crypto.randomUUID();
      const authorize = new URL(GITHUB_AUTHORIZE);
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authorize.searchParams.set('scope', 'public_repo');
      authorize.searchParams.set('state', state);
      return new Response(null, {
        status: 302,
        headers: {
          location: authorize.toString(),
          'set-cookie': `decap_oauth_state=${state}; Path=/callback; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const returnedState = url.searchParams.get('state');
      const cookieState = request.headers.get('cookie')?.match(/(?:^|;\s*)decap_oauth_state=([^;]+)/)?.[1];
      if (!returnedState || !cookieState || returnedState !== cookieState) {
        return loginResult({ provider: 'github', error: 'invalid_state' });
      }
      if (error || !code) return loginResult({ provider: 'github', error: error || 'missing_code' });

      const tokenResponse = await fetch(GITHUB_TOKEN, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'user-agent': 'hakken-yaehara-decap-oauth',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/callback`,
        }),
      });
      const result = await tokenResponse.json();
      if (!tokenResponse.ok || !result.access_token) {
        return loginResult({ provider: 'github', error: result.error || 'token_exchange_failed' });
      }
      return loginResult({ provider: 'github', token: result.access_token });
    }

    return html('<h1>八重原サイト管理 認証中継</h1><p>このサービスは管理画面のGitHub認証に使用します。</p>');
  },
};
