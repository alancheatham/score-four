'use client'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../../firebase'

export default function SignUp() {
	const loginWithGoogle = () => {
		signInWithPopup(auth, provider)
	}
	return (
		<div>
			<button onClick={loginWithGoogle}>Login with Google</button>
		</div>
	)
}
