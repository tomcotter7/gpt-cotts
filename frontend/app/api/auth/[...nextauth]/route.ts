import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

// const GOOGLE_AUTHORIZATION_URL =
//   "https://accounts.google.com/o/oauth2/v2/auth?" +
//   new URLSearchParams({
//     prompt: "consent",
//     access_type: "offline",
//     response_type: "code",
//   })

function validateProcessEnv(): {clientId: string, clientSecret: string} {
    var clientId: string;
    if (process.env.GOOGLE_CLIENT_ID) {
        clientId = process.env.GOOGLE_CLIENT_ID;
    } else {
        throw new Error('GOOGLE_CLIENT_ID is not defined');
    }

    var clientSecret: string;
    if (process.env.GOOGLE_CLIENT_SECRET) {
        clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    } else {
        throw new Error('GOOGLE_CLIENT_SECRET is not defined');
    }

    return {clientId, clientSecret}
}

async function refreshAccessToken(token: any) {
  try {
    
    var {clientId, clientSecret} = validateProcessEnv()
     
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
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

var {clientId, clientSecret} = validateProcessEnv()

export const authOptions = {
    providers: [
        Google({
            clientId: clientId,
            clientSecret: clientSecret,
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
        async jwt({ token, user, account }: any) {
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
        async session({ session, token }: any) {
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
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

