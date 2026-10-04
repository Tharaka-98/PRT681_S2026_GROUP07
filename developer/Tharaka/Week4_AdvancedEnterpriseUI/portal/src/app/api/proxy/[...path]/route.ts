/**
 * Route handler that proxies browser requests to the ASP.NET Core API.
 *
 * Why: the DevExtreme DataGrid pages data from the browser. Pointing it at the
 * API directly would need CORS plus a public API URL. Routing through
 * /api/proxy/* keeps everything same-origin and the API host server-side.
 */
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

const ALLOWED_PREFIXES = ['tasks', 'projects', 'analytics', 'health'];

async function forward(req: NextRequest, path: string[]) {
  if (path.length === 0 || !ALLOWED_PREFIXES.includes(path[0])) {
    return NextResponse.json({ message: 'Not proxied' }, { status: 404 });
  }

  const search = req.nextUrl.search;
  const target = `${API_BASE_URL}/api/${path.join('/')}${search}`;

  const init: RequestInit = {
    method: req.method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
  };

  if (!['GET', 'HEAD', 'DELETE'].includes(req.method)) {
    init.body = await req.text();
  }

  try {
    const upstream = await fetch(target, init);
    if (upstream.status === 204) return new NextResponse(null, { status: 204 });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' }
    });
  } catch {
    return NextResponse.json(
      { message: `Cannot reach the API at ${API_BASE_URL}. Is TaskManagerAPI running?` },
      { status: 502 }
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
