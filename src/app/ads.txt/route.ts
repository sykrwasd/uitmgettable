export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return new Response("Not found", { status: 404 });
  const pub = client.replace(/^ca-/, "");
  return new Response(`google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain" },
  });
}
