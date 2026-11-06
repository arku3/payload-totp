import { BasePayload } from 'payload'
import { PayloadTOTPConfig } from '../types.js'

export function getTotpConfig(payload: BasePayload) {
	const plugin = payload.config.plugins?.find((plugin) => plugin.slug === 'payload-totp')
	return plugin ? (plugin.options as unknown as PayloadTOTPConfig) : undefined
}
