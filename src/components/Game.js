'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, Fragment } from 'react'
import Pusher from 'pusher-js'
import { playMove } from '@/app/api/post-data'
import { pegToNotation } from '@/lib/util'
import { AVAILABLE, IN_PROGRESS, COMPLETED } from '@/lib/constants'
import { listenToGame } from '@/app/api/get-data'
import { auth } from '../../firebase'

import { checkIfGameWon } from '@/lib/game'

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
function Grid({ board, onPegClick, winningPegs, myTurn, status }) {
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
						myTurn && !beads.find((x) => x === 0) && status === IN_PROGRESS && 'cursor-pointer'
					}`}
				/>
			))}
		</div>
	)
}

export default function Game({ game, id }) {
	const [board, setBoard] = useState(JSON.parse(game.moves.slice(-1)[0].position))
	const [moves, setMoves] = useState(game.moves)
	const [status, setStatus] = useState(game.status)
	const [winner, setWinner] = useState(game.winner)
	const [winningPegs, setWinningPegs] = useState(game.winningPegs)
	const mounted = useRef(false)
	const isBlack = localStorage.getItem('user') === game.blackPlayer.uid
	const [myTurn, setMyTurn] = useState(isBlack ? game.moves.length % 2 === 1 : game.moves.length % 2 === 0)

	const newWinner = checkIfGameWon(board)
	if (!winner && newWinner) {
		setWinningPegs(newWinner.winningPegs)
		setWinner(newWinner.winner)
	}

	useEffect(() => {
		if (!mounted.current) {
			listenToGame(id, (gameData) => {
				const newBoard = JSON.parse(gameData.moves.slice(-1)[0].position)
				setBoard(newBoard)
				setMoves(gameData.moves)
				setStatus(gameData.status)
				setMyTurn(isBlack ? gameData.moves.length % 2 === 1 : gameData.moves.length % 2 === 0)

				// const winner = checkIfGameWon(newBoard)
				// if (winner) {
				// 	setWinningPegs(winner.winningPegs)
				// 	setWinner(winner.winner)
				// }
			})
			mounted.current = true
		}
	}, [mounted, id, isBlack])

	const handlePegClick = (i) => {
		const newBoard = [...board]
		const peg = newBoard.slice(i * 4, i * 4 + 4)
		const emptySlot = peg.findIndex((x) => x === 0)

		if (!myTurn || emptySlot === -1 || status !== IN_PROGRESS) {
			return
		}

		setMyTurn(false)

		newBoard[i * 4 + emptySlot] = isBlack ? -1 : 1
		setBoard(newBoard)
		const winner = checkIfGameWon(newBoard)

		if (winner) {
			setWinningPegs(winner.winningPegs)
			setWinner(winner.winner)
		}

		playMove(id, pegToNotation(i), newBoard, winner?.winner, winner?.winningPegs)
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
		<main className="flex min-h-screen items-center text-white justify-center p-16">
			<div
				className={`bg-slate-500 p-28 rounded-lg relative ${
					winner === 'W' ? 'text-white' : winner === 'B' ? 'text-black' : ''
				}`}
			>
				{winner ? (
					<div
						className="text-3xl absolute text-center w-full left-1/2"
						style={{ top: '30px', transform: 'translateX(-50%)' }}
					>
						{winner === 'W' ? 'White Wins' : winner === 'B' ? 'Black Wins' : 'Draw'}
					</div>
				) : (
					<div
						className={`text-3xl absolute text-center w-full left-1/2 ${
							((myTurn && !isBlack) || (!myTurn && isBlack)) && 'text-white'
						}`}
						style={{ top: '30px', transform: 'translateX(-50%)' }}
					>
						{status !== COMPLETED &&
							(status === AVAILABLE ? 'Waiting for Opponent' : myTurn ? 'Your Turn' : "Opponent's Turn")}
					</div>
				)}
				<div>
					<Grid board={board} onPegClick={handlePegClick} winningPegs={winningPegs} myTurn={myTurn} status={status} />
				</div>
				{/* {winner && (
					<button
						className="text-xl absolute top-1/2 p-1 border-2 rounded hover:opacity-50 border-white text-white"
						style={{ right: '-130px', transform: 'translateY(-50%)' }}
						onClick={handleRestartClick}
					>
						Rematch
					</button>
				)} */}
			</div>
			<div>
				<div className="m-10 grid grid-cols-[30px_1fr_1fr] bg-slate-800">
					{moves.slice(1).map((move, i) => (
						<Fragment key={`move-${i}`}>
							{i % 2 === 0 && <div className="text-center bg-slate-500">{i / 2 + 1}.</div>}
							<div
								className="w-24 cursor-pointer bg-slate-800 pl-3 hover:bg-slate-700"
								onClick={() => {
									setBoard(JSON.parse(move.position))
									setWinner('')
									setWinningPegs([])
								}}
							>
								{move.lastMove}
							</div>
						</Fragment>
					))}
				</div>
			</div>
		</main>
	)
}
