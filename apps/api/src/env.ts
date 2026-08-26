export interface Bindings {
  DB: D1Database;
  STORAGE: R2Bucket;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}

export interface Variables {
  user?: {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'GYM_OWNER' | 'MANAGER' | 'STAFF' | 'TRAINER';
    gymId: string | null;
    branchId: string | null;
  };
  gym?: {
    id: string;
    name: string;
    slug: string;
    status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  };
  branchId?: string;
}
