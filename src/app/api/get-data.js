import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase'

export async function getGame(id) {
	const snapshot = await getDocs(collection(db, 'games'))
	const data = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}))

	const game = data.find((x) => x.id === id)
	return game
}
