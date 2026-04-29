export async function GET() {
  return Response.json({
    app: 'Team2-something-project',
    status: 'ok',
    message: 'Hello from the school clubs API.',
  });
}
