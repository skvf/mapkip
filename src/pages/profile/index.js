import { getSession, signOut } from 'next-auth/react'

import UserProfile from '../../components/profile'
import Header from '../../components/Header'

function ProfilePage() {
  return (
    <>
      <Header />
      <UserProfile />
      <div
        onClick={() =>
          signOut({
            callbackUrl: '/',
          })
        }
      >
        Sair
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req })

  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    }
  }

  return {
    props: { session },
  }
}

export default ProfilePage
