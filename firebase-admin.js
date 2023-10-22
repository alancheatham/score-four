const admin = require('firebase-admin')
const { getAuth } = require('firebase-admin/auth')

const serviceAccount = require('./score-four-firebase-adminsdk-n0sko-1163530d2e.json')

const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const auth = getAuth(app)

// delete all users
auth.listUsers().then((userRecords) => {
	userRecords.users.forEach((user) => {
		auth.deleteUser(user.uid)
	})
})
