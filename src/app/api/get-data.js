import { db } from '../../../firebase'
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

export function listenToGame(id, cb) {
	const unsubscribe = onSnapshot(doc(db, 'games', id), (snapshot) => {
		console.log('update!!!')
		cb({ id: snapshot.id, ...snapshot.data() })
	})
}
// export async function getGame(id) {
// 	const snapshot = await get(child(ref(db), `games/${id}`))
// 	let game
// 	if (snapshot.exists()) {
// 		game = snapshot.val()
// 	} else {
// 		console.log('No data available')
// 	}

// 	return game
// }

export async function getGame(id) {
	const snapshot = await getDoc(doc(db, 'games', id))

	return snapshot.data()
}
