import type { Payload, PayloadRequest } from 'payload'

import jwt from 'jsonwebtoken'
import { parseCookies } from 'payload/shared'

import type { AuthenticatedUser, TotpTokenPayload } from '../types.js'

import { TOTP_STRATEGY_NAME } from '../constants.js'

type Args = {
	payload: Payload
	req: Pick<PayloadRequest, 'headers'>
	user: AuthenticatedUser
}

/**
 * Reads the TOTP cookie of the current request, returning its payload only when it
 * can be trusted: signed with the current secret, issued for this user, and naming
 * a strategy other than the TOTP strategy itself. Anything else yields `undefined`.
 */
export async function readTotpCookie({
	payload,
	req,
	user,
}: Args): Promise<TotpTokenPayload | undefined> {
	if (!user) {
		return undefined
	}

	const totpCookie = parseCookies(req.headers).get(`${payload.config.cookiePrefix}-totp`)

	if (!totpCookie) {
		return undefined
	}

	let decoded: Partial<TotpTokenPayload>

	try {
		decoded = jwt.verify(totpCookie, payload.secret) as Partial<TotpTokenPayload>
	} catch {
		return undefined
	}

	const { originalStrategy, userId } = decoded

	if (typeof userId !== 'number' && typeof userId !== 'string') {
		return undefined
	}

	if (String(userId) !== String(user.id)) {
		return undefined
	}

	// A cookie naming the TOTP strategy is self-referential: delegating to it would
	// make the strategy call itself without a termination condition.
	if (!originalStrategy || originalStrategy === TOTP_STRATEGY_NAME) {
		return undefined
	}

	return { originalStrategy, userId }
}
