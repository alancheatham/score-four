'use client'
import './globals.css'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { redirect, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function RootLayout({ children }) {
	const path = usePathname()
	// if (localStorage && !localStorage.getItem('signedIn') && path !== '/signin') {
	// 	location.href = '/signin'
	// }

	if (typeof window !== 'undefined') {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/auth.user
				localStorage.setItem('user', user.uid)
			} else {
				localStorage.setItem('user', '')
				// if (path !== '/signin') {
				// 	location.href = '/signin'
				// }
				// User is signed out
				// ...
			}
		})
	}

	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
