'use client'
import './globals.css'
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth'
import { auth } from '../../firebase'
import { redirect, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Odibee_Sans } from 'next/font/google'

const odibee = Odibee_Sans({ subsets: ['latin'], weight: ['400'] })
export default function RootLayout({ children }) {
	const path = usePathname()
	// if (localStorage && !localStorage.getItem('signedIn') && path !== '/signin') {
	// 	location.href = '/signin'
	// }

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const unsubscribe = onAuthStateChanged(auth, (user) => {
				if (user) {
					// signOut(auth)
					// User is signed in, see docs for a list of available properties
					// https://firebase.google.com/docs/reference/js/auth.user
					localStorage.setItem('user', user.uid)
				} else {
					signInAnonymously(auth).then((res) => {
						localStorage.setItem('user', res.user.uid)
					})
					// if (path !== '/signin') {
					// 	location.href = '/signin'
					// }
					// User is signed out
					// ...
				}
			})
			return unsubscribe
		}
	}, [])

	return (
		<html lang="en">
			<body className={odibee.className}>{children}</body>
		</html>
	)
}
