import { NextResponse } from 'next/server'
import { generateGameId, pegToNotation } from '@/lib/util'
import { checkIfGameWon, movePlayed, topMinimax, flatToPegs } from '@/lib/game'
import {
	createGame,
	playMove,
	setCurrentGame,
	requestRematch,
	unRequestRematch,
	setUserConnectedGameStatus,
	createUserInDb,
	joinGame,
} from '../../firestore/post-data'
import { getGame } from '../../firestore/get-data'
import { COMPUTER } from '@/lib/constants'
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

const createUser = async (message, sender) => {
	await createUserInDb(sender)

	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

const handleJoinGame = async (message, sender) => {
	const game = await getGame(message.gameId)

	await joinGame(message.gameId, sender)
	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

const calculateMove = async ({ gameId, pegIndex, board, sender, whitePlayerUid, blackPlayerUid }) => {
	const newBoard = [...board]
	const peg = newBoard.slice(pegIndex * 4, pegIndex * 4 + 4)
	const emptySlot = peg.findIndex((x) => x === 0)
	const isBlack = blackPlayerUid === sender

	newBoard[pegIndex * 4 + emptySlot] = isBlack ? -1 : 1
	const winner = checkIfGameWon(newBoard)

	await playMove(gameId, pegToNotation(pegIndex), newBoard, winner?.winner, winner?.winningPegs)

	if (winner) {
		if (blackPlayerUid !== COMPUTER) {
			await setCurrentGame(blackPlayerUid, '')
		}

		if (whitePlayerUid !== COMPUTER) {
			await setCurrentGame(whitePlayerUid, '')
		}
	} else {
		if (sender !== COMPUTER && (blackPlayerUid === COMPUTER || whitePlayerUid === COMPUTER)) {
			// computer's turn
			await playComputerMove({ gameId, board: newBoard, whitePlayerUid, blackPlayerUid })
		}
	}
}

const handleMove = async (message, sender) => {
	const { moves, blackPlayer, whitePlayer } = await getGame(message.gameId)
	await calculateMove({
		gameId: message.gameId,
		pegIndex: message.peg,
		board: JSON.parse(moves.slice(-1)[0].position),
		sender,
		blackPlayerUid: blackPlayer.uid,
		whitePlayerUid: whitePlayer.uid,
	})

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

const handlePlayFriend = async (message) => {
	await createGame(message.uid)
	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

const playComputerMove = async ({ gameId, board, whitePlayerUid, blackPlayerUid }) => {
	const move = topMinimax(flatToPegs(board), whitePlayerUid === COMPUTER)
	await calculateMove({ pegIndex: move, gameId, board, sender: COMPUTER, whitePlayerUid, blackPlayerUid })
}

const handlePlayComputer = async (message) => {
	const { blackPlayer, whitePlayer, moves, id } = await createGame(message.uid, COMPUTER)
	if (blackPlayer.uid === COMPUTER) {
		await playComputerMove({
			gameId: id,
			board: JSON.parse(moves.slice(-1)[0].position),
			blackPlayerUid: blackPlayer.uid,
			whitePlayerUid: whitePlayer.uid,
		})
	}

	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

const handleRematchRequested = async (message, sender) => {
	const game = await getGame(message.gameId)
	const isBlack = game.blackPlayer.uid === sender

	await requestRematch(message.gameId, isBlack)
	if ((isBlack && game.whitePlayer.rematchRequested) || (!isBlack && game.blackPlayer.rematchRequested)) {
		const { id, blackPlayer, whitePlayer, moves } = await createGame(game.whitePlayer.uid, game.blackPlayer.uid, true)
		if (blackPlayer.uid === COMPUTER) {
			await playComputerMove({
				gameId: id,
				board: JSON.parse(moves.slice(-1)[0].position),
				blackPlayerUid: blackPlayer.uid,
				whitePlayerUid: whitePlayer.uid,
			})
		}
	}
	return NextResponse.json(
		{},
		{
			status: 200,
		}
	)
}

const handleRematchUnRequested = async (message, sender) => {
	const game = await getGame(message.gameId)
	const isBlack = game.blackPlayer.uid === sender

	await unRequestRematch(message.gameId, isBlack)
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
		case 'create-user':
			return await createUser(message, sender)
		case 'join-game':
			return await handleJoinGame(message, sender)
		case 'new-game':
			return await handleNewGame(message, sender)
		case 'move':
			return await handleMove(message, sender)
		case 'find-game':
			return await handleFindGame(message, sender)
		case 'play-friend':
			return await handlePlayFriend(message, sender)
		case 'play-computer':
			return await handlePlayComputer(message, sender)
		case 'request-rematch':
			return await handleRematchRequested(message, sender)
		case 'unrequest-rematch':
			return await handleRematchUnRequested(message, sender)
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
