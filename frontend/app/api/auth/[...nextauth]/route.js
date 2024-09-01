import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const GOOGLE_AUTHORIZATION_URL =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
  })

async function refreshAccessToken(token) {
  try {

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
        }),
    })

    const tokensOrError = await response.json()
    if (!response.ok) throw tokensOrError

    token.access_token = tokensOrError.access_token
    token.expires_at = Math.floor(
        Date.now() + tokensOrError.expires_in
    )

      if (tokensOrError.refresh_token) {
          token.refresh_token = tokensOrError.refresh_token
      }
        console.log("Token refreshed")
      return token
  } catch (error) {
      console.log(error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

const handler = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                }
            }
        }),
      ],
      callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                return {
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    error: "NoError",
                    user,
                }
            }
            if (Date.now() < (token.expires_at * 1000)) {
                token.error = "NoError"
                return token
            }
            console.log("Attempting to refresh token")
            return refreshAccessToken(token)
        },
        async session({ session, token }) {
            if (token) {
                session.user = token.user
                session.access_token = token.access_token
                session.error = token.error
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
    }
})

export { handler as GET, handler as POST }

