'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Pusher from 'pusher-js'

import { checkIfGameWon } from '@/util/game'

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
})

function Peg({ beads, onPegClick, className }) {
	return (
		<div
			className={`bg-gray-400 rounded w-8 h-28 flex flex-col-reverse items-center justify-start overflow-hidden ${className}`}
			onClick={onPegClick}
		>
			{beads
				.filter((bead) => bead !== 0)
				.map((bead, i) => (
					<div className={`w-full h-6 ${bead === 1 ? 'bg-white' : 'bg-black'}`} key={`bead-${i}`}></div>
				))}
		</div>
	)
}
function Grid({ board, onPegClick, winningPegs, myTurn }) {
	const pegs = []
	for (let i = 0; i < 16; i++) {
		pegs.push(board.slice(i * 4, i * 4 + 4))
	}

	return (
		<div className="grid grid-cols-4 grid-rows-4 gap-10">
			{pegs.map((beads, i) => (
				<Peg
					beads={beads}
					key={`peg-${i}`}
					onPegClick={() => onPegClick(i)}
					className={`${winningPegs.length > 0 && !winningPegs.includes(i) && 'opacity-50'} ${
						myTurn && !beads.find((x) => x === 0) && 'cursor-pointer'
					}`}
				/>
			))}
		</div>
	)
}

export default function Game() {
	const [board, setBoard] = useState(Array(64).fill(0))
	const [winner, setWinner] = useState('')
	const [winningPegs, setWinningPegs] = useState([])
	const [myTurn, setMyTurn] = useState(true)

	// listen for moves
	useEffect(() => {
		const channel = pusher.subscribe('score-four')

		channel.bind('move', (data) => {
			const { board, winnerInfo } = data.message
			setBoard(board)
			setMyTurn(true)

			if (winnerInfo) {
				setWinningPegs(winnerInfo.winningPegs)
				setWinner(winnerInfo.winner)
			}
		})

		channel.bind('new-game', (data) => {
			const { board } = data.message
			setMyTurn(true)
		})

		return () => {
			pusher.unsubscribe('score-four')
		}
	}, [board])

	const handlePegClick = (i) => {
		const newBoard = [...board]
		const peg = newBoard.slice(i * 4, i * 4 + 4)
		const emptySlot = peg.findIndex((x) => x === 0)

		if (!myTurn || emptySlot === -1) {
			return
		}

		setMyTurn(false)

		fetch('/api', {
			method: 'POST',
			body: JSON.stringify({ message: { type: 'move', slot: i * 4 + emptySlot }, sender: 'player' }),
			headers: {
				'Content-Type': 'application/json',
			},
		})

		newBoard[i * 4 + emptySlot] = !myTurn ? 1 : -1
		setBoard(newBoard)

		const winner = checkIfGameWon(newBoard)
		if (winner) {
			setWinningPegs(winner.winningPegs)
			setWinner(winner.winner)
		}
	}

	const handleRestartClick = () => {
		setBoard(Array(64).fill(0))
		setWinningPegs([])
		setWinner('')

		const res = fetch('/api', {
			method: 'POST',
			body: JSON.stringify({ message: { type: 'new-game' }, sender: 'player' }),
		})
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className={`relative ${winner === 'W' ? 'text-white' : winner === 'B' ? 'text-black' : ''}`}>
				{winner ? (
					<div
						className="text-6xl absolute text-center w-full left-1/2"
						style={{ top: '-70px', transform: 'translateX(-50%)' }}
					>
						{winner}
					</div>
				) : (
					<div
						className={`text-xl absolute text-center w-full left-1/2 ${!myTurn && 'text-white'}`}
						style={{ top: '-50px', transform: 'translateX(-50%)' }}
					>
						{myTurn ? 'You' : 'Computer'}
					</div>
				)}
				<div>
					<Grid board={board} onPegClick={handlePegClick} winningPegs={winningPegs} myTurn={myTurn} />
				</div>
				{winner && (
					<button
						className={`text-xl absolute top-1/2 p-1 border-2 rounded hover:opacity-50 ${
							winner === 'W' ? 'border-white' : 'border-black'
						}`}
						style={{ right: '-130px', transform: 'translateY(-50%)' }}
						onClick={handleRestartClick}
					>
						Rematch
					</button>
				)}
			</div>
		</main>
	)
}
