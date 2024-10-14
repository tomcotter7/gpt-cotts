import NextAuth from 'next-auth'
import { authOptions } from './authOptions'

// const GOOGLE_AUTHORIZATION_URL =
//   "https://accounts.google.com/o/oauth2/v2/auth?" +
//   new URLSearchParams({
//     prompt: "consent",
//     access_type: "offline",
//     response_type: "code",
//   })




const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

