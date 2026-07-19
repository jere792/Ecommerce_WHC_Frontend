export default {
  async fetch(
    request: Request,
    env: {
      ASSETS: { fetch: (req: Request) => Promise<Response> };
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      VITE_CLOUDINARY_CLOUD_NAME?: string;
      VITE_CLOUDINARY_UPLOAD_PRESET?: string;
    }
  ): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const text = await response.text();
      const injected = text.replace(
        '<div id="root"></div>',
        `<script>
window.__SUPABASE_URL__="${env.SUPABASE_URL}";
window.__SUPABASE_ANON_KEY__="${env.SUPABASE_ANON_KEY}";
window.__VITE_CLOUDINARY_CLOUD_NAME__="${env.VITE_CLOUDINARY_CLOUD_NAME || ""}";
window.__VITE_CLOUDINARY_UPLOAD_PRESET__="${env.VITE_CLOUDINARY_UPLOAD_PRESET || ""}";
</script><div id="root"></div>`
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
