function moveFindWinWontLose(board) {
	const availablePegs = getAvailablePegs(board)

	const index = Math.floor(Math.random() * availablePegs.length)
	const pegIndex = board[index].indexOf(0)
	// let nextMove
	let nextMove = availablePegs[index] * 4 + pegIndex
	// const newBoard = JSON.parse(JSON.stringify(board.slice(0, 4)))
	for (const peg of availablePegs) {
		// check for white win
		let newestBoard = JSON.parse(JSON.stringify(board))
		let index = newestBoard[peg].indexOf(0)
		newestBoard[peg][index] = 1
		let winnerInfo = checkIfGameWon(newestBoard)
		if (winnerInfo) {
			const winner = winnerInfo.winner
			if (winner === 'W') {
				nextMove = peg * 4 + index
				break
			}
		}

		// prevent black win
		newestBoard = JSON.parse(JSON.stringify(board))
		index = newestBoard[peg].indexOf(0)
		newestBoard[peg][index] = -1
		winnerInfo = checkIfGameWon(newestBoard)
		if (winnerInfo) {
			const winner = winnerInfo.winner
			if (winner === 'B') {
				nextMove = peg * 4 + index
				break
			}
		}
	}
	if (!isNaN(nextMove)) {
		return nextMove
	} else {
		// this.neuralMove()
	}
}

// neuralMove() {
//   const { board } = this.$.store.getState().game

//   const tenseBlock = tf.tensor([board.slice(0, 4).flat()])
//   const result = model.predict(tenseBlock)
//   const flatty = result.flatten()
//   const maxy = flatty.argMax()
//   maxy.data().then((m) => {
//     flatty.data().then((allMoves) => {
//       flatty.dispose()
//       tenseBlock.dispose()
//       result.dispose()
//       maxy.dispose()
//       console.log(allMoves)
//       console.log(m[0])
//       if (board[m[0]].findIndex((x) => x === 0) > -1) {
//         this.$.store.dispatch(move(m[0]))
//       } else {
//         console.log('illegal move')
//         this.moveFindWinWontLose()
//       }
//     })
//   })
// }

function getAvailablePegs(board) {
	return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].filter((i) => board[i].findIndex((x) => x === 0) > -1)
}

export function topMinimax(board, whiteToMove) {
	// const now = Date.now()

	const availablePegs = getAvailablePegs(board)
	let aboutToLose = false
	let bestMove
	let score = whiteToMove ? -Infinity : Infinity
	let value = 0

	debugger
	const scores = {
		'-1': [],
		0: [],
		1: [],
	}
	for (const peg of availablePegs) {
		const newBoard = JSON.parse(JSON.stringify(board))
		const index = newBoard[peg].indexOf(0)
		newBoard[peg][index] = whiteToMove ? 1 : -1

		value = minimax(newBoard, 3, -Infinity, Infinity, !whiteToMove)
		// console.log(value)

		if ((value === -1 && whiteToMove) || (value === 1 && !whiteToMove)) {
			aboutToLose = true
		}

		if (whiteToMove) {
			// win
			if (value === 1) {
				return peg
			} else {
				scores[value].push(peg)
			}
		} else {
			// win
			if (value === -1) {
				return peg
			}
			if (value < score) {
				bestMove = peg
				score = value
			}
		}
	}

	// if (score === 0 && !aboutToLose) {
	//   // play random move
	//   console.log('playing random')
	//   this.moveFindWinWontLose()
	//   return
	// }

	// console.log('time', Date.now() - now)
	if (scores[0].length > 0) {
		for (const peg of scores[0]) {
			const newBoard = JSON.parse(JSON.stringify(board))
			const index = newBoard[peg].indexOf(0)
			newBoard[peg][index] = whiteToMove ? 1 : -1
			if (threatensVictory(newBoard)) {
				return peg
			}
		}
		// console.log('random', scores)
		const index = Math.floor(Math.random() * scores[0].length)
		// let nextMove
		let nextMove = scores[0][index]
		return nextMove
	}

	// game is lost, try to block anyway
	// console.log('lost')
	moveFindWinWontLose()
}

function minimax(board, depth, alpha, beta, isMaximizingPlayer) {
	let value = 0

	// check for  win
	let winnerInfo = checkIfGameWon(board)
	if (winnerInfo) {
		if (winnerInfo.winner === 'W') {
			return 1
		}
		if (winnerInfo.winner === 'B') {
			return -1
		} else {
			return 0
		}
	}

	if (depth === 0) {
		return 0
	}

	const availablePegs = getAvailablePegs(board)
	if (isMaximizingPlayer) {
		value = -Infinity

		for (const peg of availablePegs) {
			const nextIndex = board[peg].indexOf(0)

			const newBoard = JSON.parse(JSON.stringify(board))
			newBoard[peg][nextIndex] = 1

			value = Math.max(value, minimax(newBoard, depth - 1, alpha, beta, false))
			if (value > beta) {
				break
			}
			alpha = Math.max(alpha, value)
		}

		return value
	} else {
		value = Infinity

		for (const peg of availablePegs) {
			const nextIndex = board[peg].indexOf(0)

			const newBoard = JSON.parse(JSON.stringify(board))
			newBoard[peg][nextIndex] = -1

			value = Math.min(value, minimax(newBoard, depth - 1, alpha, beta, true))
			if (value < alpha) {
				break
			}
			beta = Math.min(beta, value)
		}

		return value
	}
}

function flipX(board) {
	const newBoard = []
	for (let i = 0; i < 4; i++) {
		newBoard.push(...board.slice(4 * i, 4 * i + 4).reverse())
	}
	return newBoard
}

function flipY(board) {
	const newBoard = []
	for (let i = 0; i < 16; i++) {
		newBoard[4 * (3 - parseInt(i / 4)) + (i % 4)] = board[i]
	}
	return newBoard
}

// Creates a 1 shot of the diff
function nextMove(first, second) {
	const result = []
	first.flat().forEach((move, i) => {
		result.push(Math.abs(move - second.flat()[i]))
	})
	// unflatten
	// const newResult = []
	// for (let i = 0; i < 16; i++) {
	//   newResult.push(result.slice(i * 4, i * 4 + 4))
	// }
	// return newResult.map((peg) => (peg.includes(1) ? 1 : 0))
	const newResult = []
	for (let i = 0; i < 4; i++) {
		newResult.push(result.slice(i * 4, i * 4 + 4))
	}
	return newResult.map((peg) => (peg.includes(1) ? 1 : 0))
}

function getMirrorMoves(moves) {
	const x = []
	const y = []
	// Make all the moves
	for (let i = 0; i < moves.length - 1; i++) {
		const theMove = nextMove(moves[i], moves[i + 1])
		// Normal move
		x.push(moves[i].flat())
		y.push(theMove.flat())

		// // Flipped X move
		// x.push(flipX(moves[i]).flat())
		// y.push(flipX(theMove).flat())

		// // Flipped Y move
		// x.push(flipY(moves[i]).flat())
		// y.push(flipY(theMove).flat())

		// // Inverted Move
		// x.push(moves[i].slice().reverse().flat())
		// y.push(theMove.slice().reverse().flat())
	}
	return { x, y }
}

export function movePlayed(flatBoard, whiteToMove) {
	const board = []
	for (let i = 0; i < 16; i++) {
		board.push(flatBoard.slice(i * 4, i * 4 + 4))
	}

	let winnerInfo = checkIfGameWon(board)
	console.log(winnerInfo)

	if (whiteToMove) {
		// return topMinimax()
		const move = moveFindWinWontLose(board)
		const peg = Math.floor(move / 4)
		const index = move % 4
		board[peg][index] = 1

		winnerInfo = checkIfGameWon(board)
	}

	return { board: board.flat(), winnerInfo }
}

function threatensVictory(board, whiteToMove) {
	const availablePegs = getAvailablePegs(board)
	for (const peg of availablePegs) {
		const newBoard = JSON.parse(JSON.stringify(board))
		const index = newBoard[peg].indexOf(0)
		newBoard[peg][index] = whiteToMove ? 1 : -1

		const winnerInfo = checkIfGameWon(newBoard)
		if (winnerInfo) {
			const winner = winnerInfo.winner
			if ((winner === 'W' && whiteToMove) || (winner === 'B' && !whiteToMove)) {
				return true
			}
		}
	}
	return false
}

function checkIfGameWon(board) {
	let winner = ''

	// same level
	winner = checkHorizontalPlanes(board)
	if (winner) return winner

	winner = checkVerticalPlanes(board)
	if (winner) return winner

	winner = checkDiagonalPlanes(board)
	if (winner) return winner

	// multi level
	winner = checkVerticalPegs(board)
	if (winner) return winner

	winner = checkHorizontalStairs(board)
	if (winner) return winner

	winner = checkVerticalStairs(board)
	if (winner) return winner

	winner = checkDiagonalStairs(board)
	if (winner) return winner

	if (isBoardFull(board)) {
		return {
			winner: 'draw',
			winningPegs: [],
			board,
		}
	}

	return winner
}

function isBoardFull(board) {
	for (let i = 0; i < 16; i++) {
		if (board[i].findIndex((x) => x === 0) > -1) {
			return false
		}
	}

	return true
}

function fourInARowHelper(currentBead, potentialWin, iteration) {
	if (currentBead === 0) {
		return false
	} else if (iteration === 0) {
		potentialWin.push(currentBead)
	} else {
		if (currentBead === potentialWin[iteration - 1]) {
			if (iteration === 3) {
				// game over
				return currentBead == 1 ? 'W' : 'B'
			}
			potentialWin.push(currentBead)
		} else {
			return false
		}
	}
}

function checkHorizontalPlanes(board) {
	let potentialWin = []

	// z axis
	for (let z = 0; z < 4; z++) {
		// y axis
		for (let y = 0; y < 4; y++) {
			// x axis
			for (let x = 0; x < 4; x++) {
				const currentPeg = y * 4 + x
				const currentBead = board[currentPeg][z]

				const winner = fourInARowHelper(currentBead, potentialWin, x)
				if (winner) {
					return {
						winner,
						winningPegs: [currentPeg, currentPeg - 1, currentPeg - 2, currentPeg - 3],
					}
				} else if (winner === false) {
					potentialWin = []
				}
			}
		}
	}
}

function checkVerticalPlanes(board) {
	let potentialWin = []

	// z axis
	for (let z = 0; z < 4; z++) {
		// x axis
		for (let x = 0; x < 4; x++) {
			// x axis
			for (let y = 0; y < 4; y++) {
				const currentPeg = y * 4 + x
				const currentBead = board[currentPeg][z]

				const winner = fourInARowHelper(currentBead, potentialWin, y)
				if (winner) {
					return {
						winner,
						winningPegs: [currentPeg, currentPeg - 4, currentPeg - 8, currentPeg - 12],
					}
				} else if (winner === false) {
					potentialWin = []
				}
			}
		}
	}
}

function checkDiagonalPlanes(board) {
	let potentialWin = []

	// z axis
	for (let z = 0; z < 4; z++) {
		// diagonal one
		for (let d1 = 0; d1 < 4; d1++) {
			const currentPeg = d1 * 5
			const currentBead = board[currentPeg][z]

			const winner = fourInARowHelper(currentBead, potentialWin, d1)
			if (winner) {
				return {
					winner,
					winningPegs: [0, 5, 10, 15],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}

		// diagonal two
		for (let d2 = 0; d2 < 4; d2++) {
			const currentPeg = d2 * 3 + 3
			const currentBead = board[currentPeg][z]

			const winner = fourInARowHelper(currentBead, potentialWin, d2)
			if (winner) {
				return {
					winner,
					winningPegs: [3, 6, 9, 12],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}
	}
}

function checkVerticalPegs(board) {
	let potentialWin = []

	// y axis
	for (let y = 0; y < 4; y++) {
		// x axis
		for (let x = 0; x < 4; x++) {
			// z axis
			for (let z = 0; z < 4; z++) {
				const currentPeg = y * 4 + x
				const currentBead = board[currentPeg][z]

				const winner = fourInARowHelper(currentBead, potentialWin, z)
				if (winner) {
					return {
						winner,
						winningPegs: [currentPeg],
					}
				} else if (winner === false) {
					potentialWin = []
				}
			}
		}
	}
}

function checkHorizontalStairs(board) {
	let potentialWin = []

	// y axis
	for (let y = 0; y < 4; y++) {
		// left to right
		for (let lr = 0; lr < 4; lr++) {
			const currentPeg = y * 4 + lr
			const currentBead = board[currentPeg][lr]

			const winner = fourInARowHelper(currentBead, potentialWin, lr)
			if (winner) {
				return {
					winner,
					winningPegs: [currentPeg, currentPeg - 1, currentPeg - 2, currentPeg - 3],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}

		// right to left
		for (let rl = 0; rl < 4; rl++) {
			const currentPeg = y * 4 + rl
			const currentBead = board[currentPeg][3 - rl]

			const winner = fourInARowHelper(currentBead, potentialWin, rl)
			if (winner) {
				return {
					winner,
					winningPegs: [currentPeg, currentPeg - 1, currentPeg - 2, currentPeg - 3],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}
	}
}

function checkVerticalStairs(board) {
	let potentialWin = []

	// x axis
	for (let x = 0; x < 4; x++) {
		// up to down
		for (let ud = 0; ud < 4; ud++) {
			const currentPeg = ud * 4 + x
			const currentBead = board[currentPeg][ud]

			const winner = fourInARowHelper(currentBead, potentialWin, ud)
			if (winner) {
				return {
					winner,
					winningPegs: [currentPeg, currentPeg - 4, currentPeg - 8, currentPeg - 12],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}

		// down to up
		for (let du = 0; du < 4; du++) {
			const currentPeg = du * 4 + x
			const currentBead = board[currentPeg][3 - du]

			const winner = fourInARowHelper(currentBead, potentialWin, du)
			if (winner) {
				return {
					winner,
					winningPegs: [currentPeg, currentPeg - 4, currentPeg - 8, currentPeg - 12],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}
	}
}

function checkDiagonalStairs(board) {
	let potentialWin = []

	// diagonal one
	for (let rl = 0; rl < 2; rl++) {
		for (let d1 = 0; d1 < 4; d1++) {
			const currentPeg = d1 * 5
			const currentBead = rl === 0 ? board[currentPeg][3 - d1] : board[currentPeg][d1]

			const winner = fourInARowHelper(currentBead, potentialWin, d1)
			if (winner) {
				return {
					winner,
					winningPegs: [0, 5, 10, 15],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}
	}

	// diagonal two
	for (let rl = 0; rl < 2; rl++) {
		for (let d2 = 0; d2 < 4; d2++) {
			const currentPeg = d2 * 3 + 3
			const currentBead = rl === 0 ? board[currentPeg][3 - d2] : board[currentPeg][d2]

			const winner = fourInARowHelper(currentBead, potentialWin, d2)
			if (winner) {
				return {
					winner,
					winningPegs: [3, 6, 9, 12],
				}
			} else if (winner === false) {
				potentialWin = []
			}
		}
	}
}
