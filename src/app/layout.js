'use client'
import './globals.css'
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth'
import { auth } from '../../firebase'
import { redirect, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Odibee_Sans } from 'next/font/google'

const odibee = Odibee_Sans({ subsets: ['latin'], weight: ['400'] })

export default function RootLayout({ children }) {
	const path = usePathname()
	const [userId, setUserId] = useState('')

	const mounted = useRef(false)

	// if (localStorage && !localStorage.getItem('signedIn') && path !== '/signin') {
	// 	location.href = '/signin'
	// }

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			if (typeof window !== 'undefined') {
				setUserId(localStorage.getItem('user'))
			}
		}
	}, [mounted])

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const unsubscribe = onAuthStateChanged(auth, (user) => {
				if (user) {
					// signOut(auth)
					// User is signed in, see docs for a list of available properties
					// https://firebase.google.com/docs/reference/js/auth.user
					localStorage.setItem('user', user.uid)
					setUserId(user.uid)
				} else {
					signInAnonymously(auth).then((res) => {
						localStorage.setItem('user', res.user.uid)
						setUserId(res.user.uid)

						fetch('/api', {
							method: 'POST',
							body: JSON.stringify({ message: { type: 'create-user' }, sender: res.user.uid }),
						})
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
	}, [userId])

	return (
		<html lang="en">
			<body className={`h-screen flex flex-col ${odibee.className}`}>
				<header className="p-3">
					<a href="/" className="text-4xl text-white">
						SCORE FOUR
					</a>
				</header>
				{userId && children}
			</body>
		</html>
	)
}
