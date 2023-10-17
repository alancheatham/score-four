'use client'
import './globals.css'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { redirect, usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
	const path = usePathname()
	// if (localStorage && !localStorage.getItem('signedIn') && path !== '/signin') {
	// 	location.href = '/signin'
	// }

	onAuthStateChanged(auth, (user) => {
		if (user) {
			// User is signed in, see docs for a list of available properties
			// https://firebase.google.com/docs/reference/js/auth.user
			const uid = user.uid
		} else {
			// if (path !== '/signin') {
			// 	location.href = '/signin'
			// }
			// User is signed out
			// ...
		}
	})
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
