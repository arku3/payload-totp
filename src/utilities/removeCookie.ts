import type { CookieOptions, IncomingAuthType, ServerAdapter } from 'payload'
import { generateExpiredTotpCookie } from './cookie.js'

type Args = {
	authConfig: Omit<IncomingAuthType, 'cookies'> & Required<Pick<IncomingAuthType, 'cookies'>>
	cookiePrefix: string
	serverAdapter: ServerAdapter
}

export async function removeCookie({ authConfig, cookiePrefix, serverAdapter }: Args) {
	const cookie = generateExpiredTotpCookie({
		authConfig,
		cookiePrefix,
		returnCookieAsObject: true,
	})
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
