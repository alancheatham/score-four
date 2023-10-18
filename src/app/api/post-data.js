import { db, auth } from '../../../firebase'
import { collection, doc, arrayUnion, updateDoc, addDoc, setDoc } from 'firebase/firestore'
import { generateGameId } from '@/lib/util'
import { AVAILABLE, IN_PROGRESS, COMPLETED } from '@/lib/constants'
import { getGame } from './get-data'

export async function joinGame(id) {
	await setDoc(
		doc(db, 'games', id),
		{
			whitePlayer: {
				uid: auth.currentUser.uid,
				displayName: auth.currentUser.displayName,
			},
			status: IN_PROGRESS,
		},
		{ merge: true }
	)
}

export async function playMove(id, lastMove, board, winner = '', winningPegs = []) {
	console.log(winner, winningPegs)
	updateDoc(doc(db, 'games', id), {
		moves: arrayUnion({
			lastMove: lastMove,
			position: JSON.stringify(board),
		}),
		...(winner ? { winner: winner, winningPegs, status: COMPLETED } : {}),
	})
}

export async function createGame() {
	const id = generateGameId()
	const gameDoc = await setDoc(doc(db, 'games', id), {
		moves: [
			{
				move: null,
				position: JSON.stringify(Array(64).fill(0)),
			},
		],
		status: AVAILABLE,
		blackPlayer: {
			uid: auth.currentUser.uid,
			displayName: auth.currentUser.displayName,
		},
		whitePlayer: null,
		winner: null,
		winningPegs: [],
	})

	console.log(gameDoc)
	return id
	// updateDoc(gameDoc, {
	// 	moves: arrayUnion({
	// 		lastMove: lastMove,
	// 		position: JSON.stringify(board),
	// 	}),
	// })
}
