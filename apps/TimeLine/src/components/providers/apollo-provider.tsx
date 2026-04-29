'use client'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
/////
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: '/api/graphql' }),
})

export function AppApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
