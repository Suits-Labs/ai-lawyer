import 'rsuite/dist/rsuite.min.css';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { CustomProvider } from 'rsuite';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CustomProvider theme="light">
      <Component {...pageProps} />
    </CustomProvider>
  )
}
