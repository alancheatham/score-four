import { collection, doc, arrayUnion, updateDoc, addDoc } from 'firebase/firestore'
import { db, auth } from '../../../firebase'

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
	const docRef = collection(db, 'games')
	const gameDoc = await addDoc(docRef, {
		moves: `${Array(64).fill(0)}`,
		status: 'AVAILABLE',
		blackPlayer: auth.currentUser.uid,
	})

	console.log(gameDoc)
	// updateDoc(gameDoc, {
	// 	moves: arrayUnion({
	// 		lastMove: lastMove,
	// 		position: JSON.stringify(board),
	// 	}),
	// })
}
