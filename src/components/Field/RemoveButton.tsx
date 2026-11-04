/* eslint-disable no-restricted-exports */

'use client'

import { Button, useModal } from '@payloadcms/ui'

type Args = {
	children: React.ReactNode
	modalSlug: string
}

export default function RemoveButton({ children, modalSlug }: Args) {
	const { openModal } = useModal()

	return (
		<Button
			buttonStyle="secondary"
			onClick={() => {
				openModal(modalSlug)
			}}
			// size="small"
		>
			{children}
		</Button>
	)
}
