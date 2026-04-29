export async function GET() {
  return Response.json({
    app: 'TOM-web',
    status: 'ok',
    message: 'Hello from the TOM web API.',
  });
}
