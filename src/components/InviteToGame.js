import { useState } from 'react'
import Image from 'next/image'
import QRCode from 'react-qr-code'

export default function InviteToGame() {
	const [copiedLink, setCopiedLink] = useState(false)

	const copyLink = () => {
		navigator.clipboard.writeText(document.location.href)
		setCopiedLink(true)
	}

	return (
		<div className="absolute min-h-96 w-full top-0 sm:top-24 h-full sm:w-3/4 sm:h-3/4 sm:min-w-[500px] sm:min-h-[375px] bg-slate-800 p-6 flex flex-col items-center justify-center rounded-lg">
			<div className="w-1/2 flex flex-col items-center min-w-[375px]">
				<div className="text-5xl">Invite To Game</div>
				<div className="text-2xl pt-5">The first person with this link will join the game</div>
				<div className="flex w-full justify-center pt-2">
					<input
						className="bg-slate-700 text-white p-2 rounded w-80 font-sans"
						value={document.location.href}
						readOnly
					/>
					<button
						className="bg-blue-500 w-10 h-10 rounded flex items-center justify-center hover:opacity-90"
						onClick={copyLink}
					>
						{!copiedLink ? (
							<Image src="link.svg" alt="link" width="25" height="25" />
						) : (
							<Image src="check.svg" alt="checkmark" width="25" height="25" />
						)}
					</button>
				</div>
				<div className="text-2xl pt-5">Or have them scan this QR code</div>
				<div className="w-32 pt-2">
					<QRCode
						size={256}
						style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
						value={document.location.href}
						viewBox={`0 0 256 256`}
					/>
				</div>
			</div>
		</div>
	)
}
