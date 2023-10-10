import Game from '@/components/Game'
import { getGame } from '@/app/api/get-data'

export default async function Page({ params }) {
	const game = await getGame(params.id)
	return (
		<div>
			<Game game={game}></Game>
		</div>
	)
}
