import Game from '@/components/Game'
import { getGame, listenToGame } from '@/firestore/get-data'
import { auth } from '../../../firebase'

export default async function Page({ params }) {
	const game = await getGame(params.id)

	return (
		<div>
			<Game id={params.id} game={game}></Game>
		</div>
	)
}
