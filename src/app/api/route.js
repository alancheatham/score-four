import { NextResponse } from 'next/server'
import { movePlayed } from '@/lib/game'
import { generateGameId } from '@/lib/util'
// import Pusher from 'pusher'

// export const pusher = new Pusher({
// 	appId: process.env.PUSHER_APP_ID,
// 	key: process.env.NEXT_PUBLIC_PUSHER_KEY,
// 	secret: process.env.PUSHER_SECRET,
// 	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
// 	useTLS: true,
// })

let board = Array(64).fill(0)
const games = {}

const handleMove = async (message, sender) => {
	board[message.slot] = -1
	const result = movePlayed(board, true)
	board = result.board
	const response = await pusher.trigger('score-four', 'move', {
		message: {
			...result,
		},
		sender: 'computer',
	})

	return new Response('success', {
		status: 200,
	})
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

export async function POST(req, res) {
	const { message, sender } = await req.json()

	switch (message.type) {
		case 'new-game':
			return await handleNewGame(message, sender)
		case 'move':
			return await handleMove(message, sender)
		default:
			return new Response('Invalid request', {
				status: 400,
			})
	}
}
