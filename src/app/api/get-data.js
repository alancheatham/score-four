import { db, auth } from '../../../firebase'
import { collection, getDoc, doc, onSnapshot, query, where } from 'firebase/firestore'

// import { ref, get, child, onValue } from 'firebase/database'
import { AVAILABLE } from '@/lib/constants'

export function listenAvailableGames(cb) {
	const q = query(collection(db, 'games'), where('status', '==', AVAILABLE))
	const unsubscribe = onSnapshot(q, (snapshot) => {
		const games = []
		snapshot.forEach((doc) => {
			games.push({ id: doc.id, ...doc.data() })
		})
		cb(games)
	})
}

export function listenGameStarted(cb) {
	const userId = auth.currentUser.uid
	const unsubscribe = onSnapshot(doc(db, 'users', userId), (snapshot) => {
		const currentGame = snapshot.data()?.currentGame
		if (currentGame) {
			cb(currentGame)
		}
	})
}

export function listenToGame(id, cb) {
	const unsubscribe = onSnapshot(doc(db, 'games', id), (snapshot) => {
		cb({ id: snapshot.id, ...snapshot.data() })
	})
}

export async function getGame(id) {
	const snapshot = await getDoc(doc(db, 'games', id))

	return snapshot.data()
}
