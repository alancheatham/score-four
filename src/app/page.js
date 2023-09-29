'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Pusher from 'pusher-js'

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
})

function Peg({ beads, onPegClick, className }) {
	return (
		<div
			className={`bg-gray-400 rounded w-8 h-28 flex flex-col-reverse items-center justify-start overflow-hidden cursor-pointer ${className}`}
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
function Grid({ board, onPegClick, winningPegs }) {
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
					className={winningPegs.length > 0 && !winningPegs.includes(i) && 'opacity-50'}
				/>
			))}
		</div>
	)
}
export default function Game() {
	const [board, setBoard] = useState(Array(64).fill(0))
	const [whiteToMove, setWhiteToMove] = useState(false)
	const [winner, setWinner] = useState('')
	const [winningPegs, setWinningPegs] = useState([])

	useEffect(() => {
		const channel = pusher.subscribe('score-four')

		channel.bind('move', (data) => {
			const { board, winnerInfo } = data.message
			setBoard(board)

			if (winnerInfo) {
				setWinningPegs(winnerInfo.winningPegs)
				setWinner(winnerInfo.winner)
			}
		})

		return () => {
			pusher.unsubscribe('score-four')
		}
	}, [board])

	const handlePegClick = (i) => {
		const newBoard = [...board]
		const peg = newBoard.slice(i * 4, i * 4 + 4)

		const emptySlot = peg.findIndex((x) => x === 0)
		if (emptySlot === -1) return

		fetch('/api/move', {
			method: 'POST',
			body: JSON.stringify({ message: { slot: i * 4 + emptySlot }, sender: 'player' }),
			headers: {
				'Content-Type': 'application/json',
			},
		})

		newBoard[i * 4 + emptySlot] = whiteToMove ? 1 : -1
		setBoard(newBoard)
		// setWhiteToMove(!whiteToMove)
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			{winner && <div>{winner}</div>}
			<Grid board={board} onPegClick={handlePegClick} winningPegs={winningPegs} />
		</main>
	)
}
