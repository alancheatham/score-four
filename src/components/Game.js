'use client'

import { useState, useEffect, useRef, useMemo, Fragment, useCallback } from 'react'
import { pegToNotation } from '@/lib/util'
import { AVAILABLE, IN_PROGRESS, COMPLETED } from '@/lib/constants'
import { listenToGame, listenGameStarted } from '@/firestore/get-data'

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
	const userId = localStorage.getItem('user')
	const isBlack = userId === game.blackPlayer.uid
	const [myTurn, setMyTurn] = useState(isBlack ? game.moves.length % 2 === 1 : game.moves.length % 2 === 0)
	const [rematchRequested, setRematchRequested] = useState(false)

	const boardRef = useRef(null)

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

	const scaleBoard = () => {
		// boardRef.current.style.transform = `scale(${Math.min(window.innerHeight / 850, 1)})`
		// boardRef.current.style.height = `${(window.innerHeight / 850) * 696}px`
		// boardRef.current.style.width = `${(window.innerHeight / 850) * 376}px`
		// boardRef.current.style.marginBottom = `10%`
	}

	useEffect(() => {
		if (!mounted.current) {
			scaleBoard()
			window.addEventListener('resize', scaleBoard, true)

			const fetchData = async () => {
				if (game.status === AVAILABLE) {
					if (userId !== game.blackPlayer.uid && userId !== game.whitePlayer.uid) {
						await fetch('/api', {
							method: 'POST',
							body: JSON.stringify({ message: { type: 'join-game', gameId: id }, sender: userId }),
						})
					}
				}

				listenToGame(id, (gameData) => {
					if (gameData.moves.length === 1) {
						return
					}

					const newBoard = JSON.parse(gameData.moves.slice(-1)[0].position)
					setBoard(newBoard)
					setMoves(gameData.moves)
					setStatus(gameData.status)
					setMyTurn(isBlack ? gameData.moves.length % 2 === 1 : gameData.moves.length % 2 === 0)
				})

				fetch('/api', {
					method: 'POST',
					body: JSON.stringify({
						message: {
							type: 'connected-game',
							gameId: id,
						},
						sender: userId,
					}),
				})

				window.addEventListener('beforeunload', () => {
					fetch('/api', {
						method: 'POST',
						body: JSON.stringify({
							message: {
								type: 'disconnected-game',
								gameId: id,
							},
							sender: userId,
						}),
						keepalive: true, // this is important!
					})
				})

				mounted.current = true
			}
			fetchData()
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

		// playMove(id, pegToNotation(i), newBoard, winner?.winner, winner?.winningPegs)
		setMoves([...moves, { lastMove: pegToNotation(i), position: JSON.stringify(newBoard) }])
		fetch('/api', {
			method: 'POST',
			body: JSON.stringify({
				message: {
					type: 'move',
					peg: i,
					gameId: id,
				},
				sender: userId,
			}),
		})
	}

	const handleRematchClick = () => {
		if (!rematchRequested) {
			listenGameStarted((gameId) => {
				location.href = `/${gameId}`
			})

			fetch('/api', {
				method: 'POST',
				body: JSON.stringify({ message: { type: 'request-rematch', gameId: id }, sender: userId }),
			})
		} else {
			fetch('/api', {
				method: 'POST',
				body: JSON.stringify({ message: { type: 'unrequest-rematch', gameId: id }, sender: userId }),
			})
		}
		setRematchRequested(!rematchRequested)
	}

	return (
		<main className="flex items-center text-white justify-center grow p-8">
			<div
				className={`bg-slate-500 p-16 rounded-md relative origin-top ${
					winner === 'W' ? 'text-white' : winner === 'B' ? 'text-black' : ''
				}`}
				ref={boardRef}
			>
				<Grid board={board} onPegClick={handlePegClick} winningPegs={winningPegs} myTurn={myTurn} status={status} />
			</div>
			<div className="bg-slate-800 w-64 h-80 ml-8 flex flex-col rounded overflow-hidden">
				<div
					className={`text-2xl w-full text-center h-16 flex items-center justify-center shrink-0 ${
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
				<div className="flex flex-col justify-between min-h-0 grow">
					<div
						ref={moveContainerRef}
						className="grid grid-cols-[30px_1fr_1fr] bg-slate-800 m-h-0 overflow-y-auto overflow-x-hidden no-scrollbar"
					>
						{moves.slice(1).map((move, i) => (
							<Fragment key={`move-${i}`}>
								{i % 2 === 0 && <div className="text-center bg-slate-500">{i / 2 + 1}</div>}
								<div
									className={`cursor-pointer pl-4 ${
										currentMoveIndex === i + 1 ? 'bg-slate-600' : 'hover:bg-slate-700'
									}`}
									onClick={() => moveClick(move)}
								>
									{move.lastMove}
								</div>
							</Fragment>
						))}
					</div>
					{(winner || status === COMPLETED) && (
						<button
							className="flex justify-center items-center h-16 w-full text-2xl hover:bg-slate-700 shrink-0"
							onClick={handleRematchClick}
						>
							{rematchRequested ? (
								<div className="animate-spin w-10 h-10 rounded-full" style={{ borderBottom: 'solid 5px white' }}></div>
							) : (
								<div>Rematch</div>
							)}
						</button>
					)}
				</div>
			</div>
		</main>
	)
}
