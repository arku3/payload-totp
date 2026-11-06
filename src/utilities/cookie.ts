import jwt from 'jsonwebtoken'
import { generateCookie, getCookieExpiration } from 'payload/shared'
import type { IncomingAuthType } from 'payload'

import type { AuthenticatedUser, TotpTokenPayload } from '../types.js'

import { TOTP_STRATEGY_NAME } from '../constants.js'

type CookieObject = {
	domain?: string
	expires?: string
	httpOnly?: boolean
	maxAge?: number
	name: string
	path?: string
	sameSite?: 'Lax' | 'None' | 'Strict'
	secure?: boolean
	value: string | undefined
}
type Args<ReturnCookieAsObject> = {
	authConfig: Omit<IncomingAuthType, 'cookies'> & Required<Pick<IncomingAuthType, 'cookies'>>
	cookiePrefix: string
	originalStrategy?: string
	secret: string
	user: AuthenticatedUser
	returnCookieAsObject: ReturnCookieAsObject
}

export function generateTotpCookie<ReturnCookieAsObject extends boolean = boolean>({
	authConfig,
	cookiePrefix,
	originalStrategy,
	secret,
	user,
	returnCookieAsObject,
}: Args<ReturnCookieAsObject>): ReturnCookieAsObject extends true
	? CookieObject | null
	: string | null {
	const originalStrategyName = originalStrategy ?? user._strategy

	// Both cases would produce a cookie that cannot authenticate anyone: the TOTP
	// strategy would either delegate to itself without a termination condition, or
	// find no strategy at all. Leave the cookie alone and let the user verify again.
	if (!originalStrategyName || originalStrategyName === TOTP_STRATEGY_NAME) {
		return null
	}

	const token = jwt.sign(
		{
			originalStrategy: originalStrategyName,
			userId: user.id,
		} satisfies TotpTokenPayload,
		secret,
		{
			expiresIn: authConfig.tokenExpiration || 7200,
		},
	)

	const sameSite =
		typeof authConfig.cookies.sameSite === 'string'
			? authConfig.cookies.sameSite
			: authConfig.cookies.sameSite
				? 'Strict'
				: undefined
	return generateCookie<ReturnCookieAsObject>({
		name: `${cookiePrefix}-totp`,
		domain: authConfig.cookies.domain ?? undefined,
		expires: getCookieExpiration({
			seconds: authConfig.tokenExpiration || 7200,
		}),
		httpOnly: true,
		path: '/',
		returnCookieAsObject,
		sameSite: sameSite,
		secure: authConfig.cookies.secure,
		value: token,
	})
}

export function generateExpiredTotpCookie<ReturnCookieAsObject extends boolean = boolean>({
	authConfig,
	cookiePrefix,
	returnCookieAsObject,
}: Omit<
	Args<ReturnCookieAsObject>,
	'originalStrategy' | 'secret' | 'user'
>): ReturnCookieAsObject extends true ? CookieObject : string {
	const sameSite =
		typeof authConfig.cookies.sameSite === 'string'
			? authConfig.cookies.sameSite
			: authConfig.cookies.sameSite
				? 'Strict'
				: undefined

	const expires = new Date(Date.now() - 1000)
	return generateCookie<ReturnCookieAsObject>({
		name: `${cookiePrefix}-totp`,
		domain: authConfig.cookies.domain ?? undefined,
		expires,
		httpOnly: true,
		path: '/',
		returnCookieAsObject,
		sameSite: sameSite,
		secure: authConfig.cookies.secure,
	})
}
