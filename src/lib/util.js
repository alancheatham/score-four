export const generateGameId = () => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
	return Array.from({ length: 10 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('')
}

export const pegToNotation = (peg) => {
	const row = 4 - Math.floor(peg / 4)
	const col = ['a', 'b', 'c', 'd'][peg % 4]
	return `${col}${row}`
}
