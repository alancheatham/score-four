import { db, auth } from '../../../firebase'
import { collection, doc, arrayUnion, updateDoc, addDoc, setDoc } from 'firebase/firestore'
import { ref, set, onValue } from 'firebase/database'
import { generateGameId } from '@/lib/util'
import { AVAILABLE, IN_PROGRESS } from '@/lib/constants'
import { getGame } from './get-data'

// export async function playMove(id, lastMove, board) {
// 	const game = await getGame(id)
// 	console.log(game)
// 	const moves = JSON.parse(game.moves)
// 	moves.push({ move: lastMove, position: board })
// 	set(ref(db, `games/${id}/moves`), JSON.stringify(moves))
// }

// export async function createGame() {
// 	const gameId = generateGameId()
// 	await set(ref(db, `games/${gameId}`), {
// 		moves: JSON.stringify([{ move: '', position: Array(64).fill(0) }]),
// 		status: AVAILABLE,
// 		blackPlayer: {
// 			uid: auth.currentUser.uid,
// 			name: auth.currentUser.displayName,
// 		},
// 		whitePlayer: null,
// 	})

// 	return gameId
// }

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

export async function playMove(id, lastMove, board) {
	const docRef = collection(db, 'games')
	const gameDoc = doc(docRef, 'Vqyp6pOZpFOhG1czBTJM')
	updateDoc(gameDoc, {
		moves: arrayUnion({
			lastMove: lastMove,
			position: JSON.stringify(board),
		}),
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
		whiteToMove: false,
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
