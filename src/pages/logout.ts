import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('gym_session', { path: '/' });
  return redirect('/login');
};
