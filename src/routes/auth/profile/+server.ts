import { type RequestHandler, error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/public'

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.profile) {
    return error(401)
  }

  return json(locals.profile)
}

export const DELETE: RequestHandler = async ({ cookies }) => {
  const cookieKey = env.PUBLIC_COOKIE_KEY
  if (!cookieKey) {
    error(500, 'Config problem')
  }

  if (cookies.get(cookieKey)) {
    cookies.delete(cookieKey, { path: '/' })
  }

  return json({
    ok: true,
  })
}
