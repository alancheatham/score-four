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
				console.log(games)
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
		<main className="flex min-h-screen flex-col items-center p-24">
			<div className="text-5xl text-white">SCORE FOUR</div>
			<div>
				<button className="text-xl p-1 border-2 text-white rounded hover:opacity-50 m-12" onClick={handleCreateClick}>
					New Game
				</button>
			</div>
			<div>
				<div className="text-white">Available Games</div>
				{availableGames.map((game, i) => (
					<button
						className="text-white text-center border-2 p-1 rounded hover:opacity-50"
						key={`game-${i}`}
						onClick={() => handleJoinClick(game.id)}
					>
						Open Game {game.blackPlayer.displayName}
					</button>
				))}
			</div>
		</main>
	)
}
