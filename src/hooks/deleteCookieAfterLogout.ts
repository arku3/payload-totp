import type { CollectionAfterLogoutHook } from 'payload'
import { getTotpConfig } from '../utilities/getTotpConfig.js'
import { removeCookie } from '../utilities/removeCookie.js'

export const deleteCookieAfterLogout: CollectionAfterLogoutHook = async ({
	collection,
	req: { payload },
}) => {
	const totpConfig = getTotpConfig(payload)
	if (!totpConfig) {
		return
	}
	await removeCookie({
		authConfig: collection.auth,
		cookiePrefix: payload.config.cookiePrefix,
		serverAdapter: totpConfig.serverAdapter,
	})
}
