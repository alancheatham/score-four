import { db, auth } from '../../firebase'
import { collection, doc, arrayUnion, updateDoc, addDoc, setDoc } from 'firebase/firestore'
import { generateGameId } from '@/lib/util'
import { AVAILABLE, IN_PROGRESS, COMPLETED, COMPUTER } from '@/lib/constants'

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
	const blackUid = oneIsBlack ? playerOne : playerTwo
	const whiteUid = oneIsBlack ? playerTwo : playerOne

	const moves = [
		{
			lastMove: null,
			position: JSON.stringify(Array(64).fill(0)),
		},
	]

	const blackPlayer = {
		uid: blackUid,
		rematchRequested: blackUid === COMPUTER,
		connected: blackUid === COMPUTER,
	}

	const whitePlayer = {
		uid: whiteUid,
		rematchRequested: whiteUid === COMPUTER,
		connected: whiteUid === COMPUTER,
	}

	await setDoc(doc(db, 'games', id), {
		moves,
		blackPlayer,
		whitePlayer,
		status: playerTwo ? IN_PROGRESS : AVAILABLE,
		winner: null,
		winningPegs: [],
	})

	if (playerOne && playerOne !== COMPUTER) {
		await updateDoc(doc(db, 'users', playerOne), {
			currentGame: id,
		})
	}

	if (playerTwo && playerTwo !== COMPUTER) {
		await updateDoc(doc(db, 'users', playerTwo), {
			currentGame: id,
		})
	}

	return { id, whitePlayer, blackPlayer, moves }
}

export async function setUserConnectedGameStatus(gameId, blackPlayer, connected) {
	updateDoc(doc(db, 'games', gameId), {
		...(blackPlayer ? { 'blackPlayer.connected': connected } : { 'whitePlayer.connected': connected }),
	})
}
