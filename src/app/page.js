'use client'

import { auth } from '../../firebase'
import { useState, useRef, useEffect } from 'react'

import { listenGameStarted } from '@/firestore/get-data'

export default function HomePage() {
	const mounted = useRef(false)
	const [findingGame, setFindingGame] = useState(false)
	const [playFriend, setPlayFriend] = useState(false)
	const [playComputer, setPlayComputer] = useState(false)

	const user = localStorage.getItem('user')

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
			body: JSON.stringify({ message: { type: 'find-game', uid: user } }),
		})

		listenGameStarted((id) => {
			location.href = `/${id}`
		})
	}

	const handlePlayFriend = async () => {
		setPlayFriend(true)
		fetch('/api', {
			method: 'POST',
			body: JSON.stringify({ message: { type: 'play-friend', uid: user } }),
		})

		listenGameStarted((id) => {
			location.href = `/${id}`
		})
	}

	const handlePlayComputer = async () => {
		setPlayComputer(true)
		fetch('/api', {
			method: 'POST',
			body: JSON.stringify({ message: { type: 'play-computer', uid: user } }),
		})

		listenGameStarted((id) => {
			location.href = `/${id}`
		})
	}

	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<div className="text-5xl text-white">SCORE FOUR</div>
			<div className="mt-12">
				{findingGame ? (
					<div className="animate-spin w-10 h-10 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
				) : (
					<button className="text-xl p-1 w-40 border-2 text-white rounded hover:opacity-50" onClick={handleFindGame}>
						Find Game
					</button>
				)}
			</div>
			<div className="mt-2">
				{playFriend ? (
					<div className="animate-spin w-10 h-10 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
				) : (
					<button className=" text-xl p-1 w-40 border-2 text-white rounded hover:opacity-50" onClick={handlePlayFriend}>
						Play a Friend
					</button>
				)}
			</div>
			<div className="mt-2">
				{playComputer ? (
					<div className="animate-spin w-10 h-10 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
				) : (
					<button
						className="text-xl p-1 w-40 border-2 text-white rounded hover:opacity-50"
						onClick={handlePlayComputer}
					>
						Play Computer
					</button>
				)}
			</div>
		</main>
	)
}
