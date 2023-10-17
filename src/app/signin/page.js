'use client'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../../firebase'

export default function SignUp() {
	const loginWithGoogle = () => {
		signInWithPopup(auth, provider).then((result) => {
			// const credential = GoogleAuthProvider.credentialFromResult(result)
			// const token = credential.accessToken
			// const user = result.user
			localStorage.setItem('signedIn', 'true')
			location.href = '/'
		})
	}
	return (
		<div>
			<button onClick={loginWithGoogle}>Login with Google</button>
		</div>
	)
}
