import Google from "next-auth/providers/google";
import { TokenSet } from "next-auth";

function validateProcessEnv(): { clientId: string, clientSecret: string } {
  let clientId: string;
  if (process.env.GOOGLE_CLIENT_ID) {
    clientId = process.env.GOOGLE_CLIENT_ID;
  } else {
    throw new Error('GOOGLE_CLIENT_ID is not defined');
  }

  let clientSecret: string;
  if (process.env.GOOGLE_CLIENT_SECRET) {
    clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  } else {
    throw new Error('GOOGLE_CLIENT_SECRET is not defined');
  }

  return { clientId, clientSecret }
}

async function refreshAccessToken(token: TokenSet): Promise<TokenSet> {

  if (!token.refresh_token) {
    return {
      ...token,
      error: "NoRefreshToken",
    }
  }

  try {

    const { clientId, clientSecret } = validateProcessEnv()
    console.log(clientId, clientSecret)
    console.log("old access token:", token.access_token)
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

    console.log("new access token:", token.access_token)
    token.expires_at = Math.floor(
      Date.now() + tokensOrError.expires_in
    )

    if (tokensOrError.refresh_token) {
      token.refresh_token = tokensOrError.refresh_token
    }
    return token
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

const { clientId, clientSecret } = validateProcessEnv()


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
    async jwt(
      // @ts-expect-error, this should be the any type. https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/types.ts
      { token, user, account }
    ) {

      if (!token) {
        return {
          id_token: "",
          access_token: "",
          expires_at: 0,
          error: "NoToken",
          user: user
        }
      }

      if (account && user) {
        return {
          id_token: account.id_token,
          access_token: account.access_token,
          expires_at: account.expires_at * 1000,
          refresh_token: account.refresh_token,
          error: "NoError",
          user: user,
        }
      }

      if (Date.now() < (token.expires_at)) {
        token.error = "NoError"
        token.expires_at = Date.now()
        return token
      }

      const refreshedToken = await refreshAccessToken(token)
      return {
        ...refreshedToken,
        user: refreshedToken.user
      }


    },
    // @ts-expect-error, this should be the any type. https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/types.ts
    async session({ session, token }) {

      console.log(token)

      if (token) {
        session.user.name = token.user.name
        session.user.email = token.user.email
        session.access_token = token.access_token
        session.id_token = token.id_token
        session.error = token.error
        session.expires_at = token.expires_at
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  }
}

