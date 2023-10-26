'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useMemo, Fragment, useCallback } from 'react'
import { playMove } from '@/app/api/post-data'
import { pegToNotation } from '@/lib/util'
import { AVAILABLE, IN_PROGRESS, COMPLETED } from '@/lib/constants'
import { listenToGame } from '@/app/api/get-data'
import { auth } from '../../firebase'

import { checkIfGameWon } from '@/lib/game'

function Peg({ beads, onPegClick, className }) {
	return (
		<div
			className={`bg-gray-400 rounded w-8 h-28 flex flex-col-reverse items-center justify-start overflow-hidden ${className}`}
			onClick={onPegClick}
		>
			{beads
				.filter((bead) => bead !== 0)
				.map((bead, i) => (
					<div
						className={`w-full h-6 border-t border-gray-400 ${bead === 1 ? 'bg-white' : 'bg-black'}`}
						key={`bead-${i}`}
					></div>
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
					className={`${winningPegs.length > 0 && !winningPegs.includes(i) && 'opacity-30'} ${
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

	const currentMoveIndex = moves.findIndex((x) => x.position === JSON.stringify(board))
	const isCurrentMove = currentMoveIndex === moves.length - 1

	const moveContainerRef = useRef(null)

	useEffect(() => {
		if (moveContainerRef.current) {
			const scrollAmount =
				moveContainerRef.current.scrollHeight * (parseInt((currentMoveIndex - 1) / 2) / (moves.length / 2)) -
				moveContainerRef.current.getBoundingClientRect().height / 2 +
				30
			moveContainerRef.current.scrollTop = scrollAmount
		}
	}, [moveContainerRef, currentMoveIndex, moves])

	const newWinner = checkIfGameWon(board)
	if (!winner && newWinner) {
		setWinningPegs(newWinner.winningPegs)
		setWinner(newWinner.winner)
	}

	const moveClick = useCallback(
		(move) => {
			setBoard(JSON.parse(move.position))
			setWinner('')
			setWinningPegs([])
		},
		[moveContainerRef, currentMoveIndex, moves]
	)

	const handleKeyStroke = useCallback(
		(event) => {
			switch (event.key) {
				case 'ArrowLeft':
					if (currentMoveIndex > 1) {
						moveClick(moves[currentMoveIndex - 1])
					}
					break
				case 'ArrowRight':
					if (currentMoveIndex < moves.length - 1) {
						moveClick(moves[currentMoveIndex + 1])
					}
					break
				case 'ArrowUp':
					if (currentMoveIndex > 1) {
						moveClick(moves[1])
					}
					break
				case 'ArrowDown':
					if (currentMoveIndex < moves.length - 1) {
						moveClick(moves[moves.length - 1])
					}
					break
			}
		},
		[currentMoveIndex, moves, moveClick]
	)

	useEffect(() => {
		if (!mounted.current) {
			listenToGame(id, (gameData) => {
				const newBoard = JSON.parse(gameData.moves.slice(-1)[0].position)
				setBoard(newBoard)
				setMoves(gameData.moves)
				setStatus(gameData.status)
				setMyTurn(isBlack ? gameData.moves.length % 2 === 1 : gameData.moves.length % 2 === 0)
			})

			mounted.current = true
		}
	}, [mounted])

	useEffect(() => {
		document.addEventListener('keydown', handleKeyStroke)
		return () => {
			document.removeEventListener('keydown', handleKeyStroke)
		}
	}, [handleKeyStroke])

	const handlePegClick = (i) => {
		const newBoard = [...board]
		const peg = newBoard.slice(i * 4, i * 4 + 4)
		const emptySlot = peg.findIndex((x) => x === 0)

		if (!myTurn || emptySlot === -1 || status !== IN_PROGRESS || !isCurrentMove) {
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
				className={`bg-slate-500 p-20 rounded-md relative ${
					winner === 'W' ? 'text-white' : winner === 'B' ? 'text-black' : ''
				}`}
			>
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
			<div className="bg-slate-800 w-64 h-48 ml-8 flex flex-col rounded overflow-hidden">
				<div
					className={`text-xl w-full text-center h-8 flex align-items-center justify-center ${
						((myTurn && !isBlack) || (!myTurn && isBlack)) && 'text-white'
					}`}
				>
					{winner
						? winner === 'W'
							? 'White Wins'
							: winner === 'B'
							? 'Black Wins'
							: 'Draw'
						: status !== COMPLETED
						? status === AVAILABLE
							? 'Waiting for Opponent'
							: myTurn
							? 'Your Turn'
							: "Opponent's Turn"
						: 'Game Completed'}
				</div>
				<div
					ref={moveContainerRef}
					className="grid grid-cols-[30px_1fr_1fr] grow-1 bg-slate-800 m-h-0 overflow-y-auto overflow-x-hidden no-scrollbar"
				>
					{moves.slice(1).map((move, i) => (
						<Fragment key={`move-${i}`}>
							{i % 2 === 0 && <div className="text-center bg-slate-500">{i / 2 + 1}</div>}
							<div
								className={`cursor-pointer pl-4 ${currentMoveIndex === i + 1 ? 'bg-slate-600' : 'hover:bg-slate-700'}`}
								onClick={() => moveClick(move)}
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
