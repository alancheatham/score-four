'use client'

import { useState, useRef, useEffect } from 'react'

import { createGame, joinGame } from '@/app/api/post-data'
import { listenAvailableGames } from '@/app/api/get-data'

export default function HomePage() {
	const mounted = useRef(false)
	const [availableGames, setAvailableGames] = useState([])

	useEffect(() => {
		if (!mounted.current) {
			listenAvailableGames((games) => {
				setAvailableGames(games)
			})
			mounted.current = true
		}
	}, [mounted])

	// const handleRestartClick = async () => {
	// 	const res = await fetch('/api', {
	// 		method: 'POST',
	// 		body: JSON.stringify({ message: { type: 'new-game' }, sender: 'player' }),
	// 	})

	// 	const data = await res.json()
	// 	const { gameId } = data
	// }

	const handleCreateClick = async () => {
		const gameId = await createGame()
		location.href = `/${gameId}`
	}

	const handleJoinClick = async (id) => {
		await joinGame(id)
		location.href = `/${id}`
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="relative">
				<button
					className="text-xl absolute top-1/2 p-1 border-2 text-white rounded hover:opacity-50"
					style={{ right: '-130px', transform: 'translateY(-50%)' }}
					onClick={handleCreateClick}
				>
					New Game
				</button>
			</div>
			<div>
				<div className="text-white">Available Games</div>
				{availableGames.map((game, i) => (
					<button className="text-white" key={`game-${i}`} onClick={() => handleJoinClick(game.id)}>
						{game.blackPlayer.displayName}
					</button>
				))}
			</div>
		</main>
	)
}
