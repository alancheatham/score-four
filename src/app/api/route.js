import { NextResponse } from 'next/server'
import { movePlayed } from '@/lib/game'
import { generateGameId, pegToNotation } from '@/lib/util'
import { checkIfGameWon } from '@/lib/game'
import {
	createGame,
	playMove,
	setCurrentGame,
	requestRematch,
	setUserConnectedGameStatus,
} from '../../firestore/post-data'
import { getGame } from '../../firestore/get-data'
// import Pusher from 'pusher'

// export const pusher = new Pusher({
// 	appId: process.env.PUSHER_APP_ID,
// 	key: process.env.NEXT_PUBLIC_PUSHER_KEY,
// 	secret: process.env.PUSHER_SECRET,
// 	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
// 	useTLS: true,
// })

const pool = []

const createGames = () => {
	while (pool.length > 1) {
		const player1 = pool.pop()
		const player2 = pool.pop()
		createGame(player1, player2)
	}
}

let interval
if (!interval) {
	interval = setInterval(createGames, 1000)
}

const handleMove = async (message, sender) => {
	const pegIndex = message.peg
	const game = await getGame(message.gameId)
	const board = JSON.parse(game.moves.slice(-1)[0].position)
	const peg = board.slice(pegIndex * 4, pegIndex * 4 + 4)
	const emptySlot = peg.findIndex((x) => x === 0)
	const isBlack = game.blackPlayer.uid === sender

	board[pegIndex * 4 + emptySlot] = isBlack ? -1 : 1
	const winner = checkIfGameWon(board)

	await playMove(message.gameId, pegToNotation(pegIndex), board, winner?.winner, winner?.winningPegs)

	if (winner) {
		await setCurrentGame(game.blackPlayer.uid, '')
		await setCurrentGame(game.whitePlayer.uid, '')
	}

	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

const handleNewGame = async () => {
	const gameId = generateGameId()
	games[gameId] = {
		board: Array(64).fill(0),
		winner: '',
		winningPegs: [],
		whiteToMove: true,
	}

	return NextResponse.json(
		{
			gameId,
		},
		{
			status: 200,
		}
	)
}

const handleFindGame = async (message) => {
	pool.push(message.uid)
	return new Promise((resolve, reject) => {
		resolve(
			NextResponse.json(
				{},
				{
					status: 200,
				}
			)
		)
	})
}

const handleRematchRequested = async (message, sender) => {
	const game = await getGame(message.gameId)
	const isBlack = game.blackPlayer.uid === sender

	await requestRematch(message.gameId, isBlack)
	if ((isBlack && game.whitePlayer.rematchRequested) || (!isBlack && game.blackPlayer.rematchRequested)) {
		await createGame(game.whitePlayer.uid, game.blackPlayer.uid, true)
	}
	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

const handleUserConnectedGameStatus = async (message, sender, { connected = false } = {}) => {
	const game = await getGame(message.gameId)
	const isBlack = game.blackPlayer.uid === sender

	await setUserConnectedGameStatus(message.gameId, isBlack, connected)
	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

export async function POST(req, res) {
	const { message, sender } = await req.json()

	switch (message.type) {
		case 'new-game':
			return await handleNewGame(message, sender)
		case 'move':
			return await handleMove(message, sender)
		case 'find-game':
			return await handleFindGame(message, sender)
		case 'request-rematch':
			return await handleRematchRequested(message, sender)
		case 'disconnected-game':
			return await handleUserConnectedGameStatus(message, sender, { connected: false })
		case 'connected-game':
			return await handleUserConnectedGameStatus(message, sender, { connected: true })
		default:
			return new Response('Invalid request', {
				status: 400,
			})
	}
}
