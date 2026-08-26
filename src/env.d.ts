/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  DB: D1Database;
  JWT_SECRET: string;
  APP_ENV: string;
}>;

declare namespace App {
  interface Locals extends Runtime {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'TRAINER';
      gymId: string | null;
    } | null;
    gym: {
      id: string;
      name: string;
      slug: string;
      status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
      currency: string;
      phone: string;
    } | null;
    license: {
      maxMembers: number;
      maxStaff: number;
      status: 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED';
      entitlements: Record<string, boolean>;
    } | null;
  }
}
