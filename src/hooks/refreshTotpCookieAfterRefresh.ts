import type { CollectionAfterRefreshHook } from 'payload'

import { setCookie } from '../setCookie.js'
import { readTotpCookie } from '../utilities/readTotpCookie.js'
import { PayloadTOTPConfig } from '../types.js'

export const refreshTotpCookieAfterRefresh: CollectionAfterRefreshHook = async ({
	collection,
	req,
}) => {
	const user = req.user

	if (!user) {
		return
	}

	// Only an existing, trustworthy cookie is refreshed. Writing one here for a user
	// who never verified would grant TOTP-verified status without verification.
	const decoded = await readTotpCookie({ payload: req.payload, req, user })

	if (!decoded) {
		return
	}
	const totpConfig = req.payload.config.plugins?.find(
		(plugin) => plugin.slug === 'payload-totp',
	) as unknown as PayloadTOTPConfig | undefined

	if (!totpConfig?.serverAdapter) {
		return
	}

	await setCookie({
		authConfig: collection.auth,
		cookiePrefix: req.payload.config.cookiePrefix,
		originalStrategy: decoded.originalStrategy,
		secret: req.payload.secret,
		user,
		req,
		serverAdapter: totpConfig?.serverAdapter,
	})
}
