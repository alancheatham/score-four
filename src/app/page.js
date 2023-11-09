'use client'

import { auth } from '../../firebase'
import { useState, useRef, useEffect } from 'react'

import { createGame, joinGame } from '@/app/api/post-data'
import { listenAvailableGames, listenGameStarted } from '@/app/api/get-data'

export default function HomePage() {
	const mounted = useRef(false)
	const [findingGame, setFindingGame] = useState(false)

	// useEffect(() => {
	// 	if (!mounted.current) {
	// 		listenAvailableGames((games) => {
	// 			setAvailableGames(games)
	// 		})
	// 		mounted.current = true
	// 	}
	// }, [mounted])

	const handleFindGame = async () => {
		setFindingGame(true)
		fetch('/api', {
			method: 'POST',
			body: JSON.stringify({ message: { type: 'find-game', uid: auth.currentUser.uid } }),
		})

		listenGameStarted((id) => {
			location.href = `/${id}`
		})
	}

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<div className="text-5xl text-white">SCORE FOUR</div>
			<div className="m-12">
				{findingGame ? (
					<div className="animate-spin w-10 h-10 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
				) : (
					<button className="text-xl p-1 border-2 text-white rounded hover:opacity-50" onClick={handleFindGame}>
						Find Game
					</button>
				)}
			</div>
		</main>
	)
}
