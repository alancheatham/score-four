'use client'

import { auth } from '../../firebase'
import { useState, useRef, useEffect } from 'react'
import { listenGameStarted } from '@/firestore/get-data'
import HowToPlay from '@/components/HowToPlay'

export default function HomePage() {
	const mounted = useRef(false)
	const [findingGame, setFindingGame] = useState(false)
	const [playFriend, setPlayFriend] = useState(false)
	const [playComputer, setPlayComputer] = useState(false)
	const [showHowToPlay, setShowHowToPlay] = useState(false)

	const [user, setUser] = useState('')

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			if (typeof window !== 'undefined') {
				setUser(localStorage.getItem('user'))
			}
		}
	}, [mounted])

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
		<main className="flex flex-col items-center p-24">
			{/* <div className="mt-12">
				{findingGame ? (
					<div className="animate-spin w-16 h-16 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
				) : (
					<button className="text-2xl h-16 w-60 border-2 text-white rounded hover:opacity-50" onClick={handleFindGame}>
						Find Game
					</button>
				)}
			</div> */}
			<div className="mt-12">
				{playFriend ? (
					<div className="animate-spin w-16 h-16 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
				) : (
					<button
						className=" text-2xl h-16 w-60 border-2 text-white rounded hover:opacity-50"
						onClick={handlePlayFriend}
					>
						Play a Friend
					</button>
				)}
			</div>
			<div className="mt-4">
				{playComputer ? (
					<div className="animate-spin w-16 h-16 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
				) : (
					<button
						className="text-2xl h-16 w-60 border-2 text-white rounded hover:opacity-50"
						onClick={handlePlayComputer}
					>
						Play Computer
					</button>
				)}
			</div>
			<div className="mt-4">
				<button
					className="text-2xl h-16 w-60 border-2 text-white rounded hover:opacity-50"
					onClick={() => setShowHowToPlay(true)}
				>
					How To Play
				</button>
			</div>
			{showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
		</main>
	)
}
