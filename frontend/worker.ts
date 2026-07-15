const SUPABASE_URL = 'https://tkzcfnpaxnsjyieajvne.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRremNmZnBheG5zanlpZWFqdm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMjc0OTcsImV4cCI6MjA2MDkwMzQ5N30.0wQeHHi8vPbHhAOLSN6Qw_PfAr1HOSAA64EqXPR7lvo';

export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (req: Request) => Promise<Response> } }): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const text = await response.text();
      const injected = text.replace(
        '<div id="root"></div>',
        `<script>window.__SUPABASE_URL__="${SUPABASE_URL}";window.__SUPABASE_ANON_KEY__="${SUPABASE_ANON_KEY}";</script><div id="root"></div>`
      );
      return new Response(injected, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
