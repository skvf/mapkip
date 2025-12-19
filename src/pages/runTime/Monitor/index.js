import { useRouter } from 'next/router'
import { FiEye } from 'react-icons/fi'
import Header from '../../../components/Header'
import Instances from '../../../components/Instances'

export const fetcher = (url) => fetch(url).then((res) => res.json())

export default function CaseInstancesPage() {
  const router = useRouter()

  return (
    <>
      <Header env="runtime"> </Header>
      <div className="container">
        <Instances
          title="Monitor"
          subtitle="Executing instances"
          router={router}
          actions={[
            {
              key: 'details',
              href: (i) => `/runTime/Instance/${i._id}/view`,
              icon: () => <FiEye size={22} />,
              title: 'View Details',
            },
          ]}
        />
      </div>
    </>
  )
}
