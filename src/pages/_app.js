import '../../styles/globals.scss'

import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'
import { SWRConfig } from 'swr'
import { SWRDevTools } from 'swr-devtools'

import { Toast, ToastProvider } from '../components/Toast'

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css"
        ></link>
        <link
          rel="stylesheet"
          href="//cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css"
        ></link>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/bs-stepper/dist/css/bs-stepper.min.css"
        ></link>
      </Head>
      <SWRConfig>
        <SWRDevTools>
          <ToastProvider>
            <Component {...pageProps} />
            <Toast />
          </ToastProvider>
        </SWRDevTools>
      </SWRConfig>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-JEW9xMcG8R+pH31jmWH6WWP0WintQrMb4s7ZOdauHnUtxwoG2vI5DkLtS3qm9Ekf"
        crossOrigin="anonymous"
        async
      ></script>
      <script src="//cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js" async></script>
      <script
        src="https://cdn.jsdelivr.net/npm/bs-stepper/dist/js/bs-stepper.min.js"
        async
      ></script>
    </SessionProvider>
  )
}

export default MyApp
