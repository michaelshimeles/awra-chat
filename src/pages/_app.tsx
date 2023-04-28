import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useState } from "react";
import type { AppProps } from "next/app";
import theme from "../../theme";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a client
const queryClient = new QueryClient()

export default function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode="dark" />
          <Component {...pageProps} />
        </ChakraProvider>
      </SessionContextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
