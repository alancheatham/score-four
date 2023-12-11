import Game from '@/components/Game'
import { getGame } from '@/firestore/get-data'

export default async function Page({ params }) {
	const game = await getGame(params.id)

	if (!game) {
		return <div>Game not found</div>
	}

	return <Game id={params.id} game={game}></Game>
}
