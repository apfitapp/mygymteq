import { SessionUser } from '@gymtech/shared';
import { errorResponse, corsOptionsResponse } from '../lib/response';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  APP_ENV?: string;
  CORS_ORIGINS?: string;
  MEDIA_BUCKET?: R2Bucket;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  APP_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export interface RequestContext {
  env: Env;
  user?: SessionUser;
  gymId?: number;
  params: Record<string, string>;
  query: URLSearchParams;
  url: URL;
  executionCtx?: ExecutionContext;
}

export type Handler = (req: Request, ctx: RequestContext) => Promise<Response> | Response;
export type Middleware = (
  req: Request,
  ctx: RequestContext,
  next: () => Promise<Response>
) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handlers: Handler[];
}

export class NativeRouter {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  private addRoute(method: string, path: string, ...handlers: Handler[]) {
    const paramNames: string[] = [];
    const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    const regexPath = cleanPath.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    const pattern = new RegExp(`^${regexPath}/?$`);

    this.routes.push({
      method: method.toUpperCase(),
      pattern,
      paramNames,
      handlers,
    });
  }

  get(path: string, ...handlers: Handler[]) {
    this.addRoute('GET', path, ...handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this.addRoute('POST', path, ...handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this.addRoute('PUT', path, ...handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this.addRoute('PATCH', path, ...handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this.addRoute('DELETE', path, ...handlers);
  }

  async handle(req: Request, env: Env, executionCtx?: ExecutionContext): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return corsOptionsResponse();
    }

    const url = new URL(req.url);
    const pathname = url.pathname;

    let matchedRoute: Route | null = null;
    let params: Record<string, string> = {};

    for (const route of this.routes) {
      if (route.method !== req.method) continue;
      const match = pathname.match(route.pattern);
      if (match) {
        matchedRoute = route;
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        break;
      }
    }

    const ctx: RequestContext = {
      env,
      params,
      query: url.searchParams,
      url,
      executionCtx,
    };

    const runRoute = async (): Promise<Response> => {
      if (!matchedRoute) {
        return errorResponse('Endpoint not found', 404);
      }

      let handlerIdx = 0;
      const nextHandler = async (): Promise<Response> => {
        if (handlerIdx < matchedRoute!.handlers.length) {
          const currentHandler = matchedRoute!.handlers[handlerIdx++];
          return await currentHandler(req, ctx);
        }
        return errorResponse('Handler returned no response', 500);
      };

      return await nextHandler();
    };

    // Execute global middlewares
    let middlewareIdx = 0;
    const nextMiddleware = async (): Promise<Response> => {
      if (middlewareIdx < this.middlewares.length) {
        const currentMiddleware = this.middlewares[middlewareIdx++];
        return await currentMiddleware(req, ctx, nextMiddleware);
      }
      return await runRoute();
    };

    try {
      return await nextMiddleware();
    } catch (err: any) {
      console.error('Request Error:', err);
      return errorResponse(err.message || 'Internal Server Error', 500);
    }
  }
}
