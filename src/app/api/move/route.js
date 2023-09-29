import { movePlayed } from '@/util/game'
import Pusher from 'pusher'

let board = Array(64).fill(0)
export const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID,
	key: process.env.NEXT_PUBLIC_PUSHER_KEY,
	secret: process.env.PUSHER_SECRET,
	cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
	useTLS: true,
})

export async function POST(req, res) {
	const { message, sender } = await req.json()

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
