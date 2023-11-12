import { db, auth } from '../../firebase'
import { collection, doc, arrayUnion, updateDoc, addDoc, setDoc } from 'firebase/firestore'
import { generateGameId } from '@/lib/util'
import { AVAILABLE, IN_PROGRESS, COMPLETED } from '@/lib/constants'
import { getGame } from './get-data'

export async function createUserInDb(id) {
	await setDoc(doc(db, 'users', id), {
		currentGame: '',
	})
}

export async function joinGame(id, userId, black) {
	await setDoc(
		doc(db, 'games', id),
		{
			...(black ? { blackPlayer: { uid: userId } } : { whitePlayer: { uid: userId } }),
			status: IN_PROGRESS,
		},
		{ merge: true }
	)
}

export async function playMove(id, lastMove, board, winner = '', winningPegs = []) {
	updateDoc(doc(db, 'games', id), {
		moves: arrayUnion({
			lastMove: lastMove,
			position: JSON.stringify(board),
		}),
		...(winner ? { winner: winner, winningPegs, status: COMPLETED } : {}),
	})
}

export async function setCurrentGame(id, gameId) {
	updateDoc(doc(db, 'users', id), {
		currentGame: gameId,
	})
}

export async function requestRematch(gameId, blackPlayer) {
	updateDoc(doc(db, 'games', gameId), {
		...(blackPlayer ? { 'blackPlayer.rematchRequested': true } : { 'whitePlayer.rematchRequested': true }),
	})
}

export async function unRequestRematch(gameId, blackPlayer) {
	updateDoc(doc(db, 'games', gameId), {
		...(blackPlayer ? { 'blackPlayer.rematchRequested': false } : { 'whitePlayer.rematchRequested': false }),
	})
}

export async function createGame(playerOne, playerTwo = '', blackFirst = true) {
	const oneIsBlack = blackFirst || Math.random() < 0.5

	const id = generateGameId()
	await setDoc(doc(db, 'games', id), {
		moves: [
			{
				move: null,
				position: JSON.stringify(Array(64).fill(0)),
			},
		],
		status: playerTwo ? IN_PROGRESS : AVAILABLE,
		blackPlayer: {
			uid: oneIsBlack ? playerOne : playerTwo,
			rematchRequested: false,
			connected: false,
		},
		whitePlayer: {
			uid: oneIsBlack ? playerTwo : playerOne,
			rematchRequested: false,
			connected: false,
		},
		winner: null,
		winningPegs: [],
	})

	await updateDoc(doc(db, 'users', playerOne), {
		currentGame: id,
	})

	if (playerTwo) {
		await updateDoc(doc(db, 'users', playerTwo), {
			currentGame: id,
		})
	}

	return id
}

export async function setUserConnectedGameStatus(gameId, blackPlayer, connected) {
	updateDoc(doc(db, 'games', gameId), {
		...(blackPlayer ? { 'blackPlayer.connected': connected } : { 'whitePlayer.connected': connected }),
	})
}
