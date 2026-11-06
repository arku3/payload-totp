import type { CookieOptions, IncomingAuthType, PayloadRequest, ServerAdapter } from 'payload'

import type { AuthenticatedUser } from './types.js'

import { generateTotpCookie } from './utilities/cookie.js'

type Args = {
	authConfig: Omit<IncomingAuthType, 'cookies'> & Required<Pick<IncomingAuthType, 'cookies'>>
	cookiePrefix: string
	originalStrategy?: string
	req: Pick<PayloadRequest, 'responseHeaders'>
	secret: string
	user: AuthenticatedUser
	serverAdapter: ServerAdapter
}

export async function setCookie({
	authConfig,
	cookiePrefix,
	originalStrategy,
	secret,
	user,
	serverAdapter,
}: Args) {
	const cookie = generateTotpCookie({
		authConfig,
		cookiePrefix,
		originalStrategy,
		secret,
		user,
		returnCookieAsObject: true,
	})
	if (!cookie) {
		return
	}
	await serverAdapter.setCookie(cookie.name, cookie.value ?? '', {
		domain: cookie.domain,
		expires: cookie.expires ? new Date(cookie.expires) : undefined,
		httpOnly: cookie.httpOnly,
		maxAge: cookie.maxAge,
		path: cookie.path,
		sameSite: cookie.sameSite?.toLowerCase() as CookieOptions['sameSite'],
		secure: cookie.secure,
	})
}
