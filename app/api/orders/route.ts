function closed() { return Response.json({ error: 'Component ordering is unavailable. Request a software or hardware project instead.' }, { status: 410 }); }
export const GET = closed;
export const POST = closed;
export const PATCH = closed;
