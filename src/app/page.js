'use client'

import { createGame } from '@/app/api/post-data'

import Image from 'next/image'
export default function HomePage() {
	const handleRestartClick = async () => {
		const res = await fetch('/api', {
			method: 'POST',
			body: JSON.stringify({ message: { type: 'new-game' }, sender: 'player' }),
		})

		const data = await res.json()
		const { gameId } = data
		console.log(gameId)
		location.href = `/${gameId}`
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className={`relative`}>
				<button
					className={`text-xl absolute top-1/2 p-1 border-2 rounded hover:opacity-50`}
					style={{ right: '-130px', transform: 'translateY(-50%)' }}
					onClick={createGame}
				>
					New Game
				</button>
			</div>
		</main>
	)
}
