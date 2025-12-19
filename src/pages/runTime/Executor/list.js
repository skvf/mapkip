import { IoDocumentTextOutline } from 'react-icons/io5'
import { MdOutlineEditNote } from 'react-icons/md'
import Header from '../../../components/Header'
import Instances from '../../../components/Instances'

import { useRouter } from 'next/router'

export const fetcher = (url) => fetch(url).then((res) => res.json())

export default function CaseInstancesPage() {
  const router = useRouter()

  return (
    <>
      <Header env="runtime"> </Header>
      <div className="container">
        <Instances
          title="Executor"
          subtitle="Executing instances"
          router={router}
          actions={[
            {
              key: 'update',
              href: (i) => `/runTime/Instance/${i._id}/update`,
              icon: () => <MdOutlineEditNote size={24} />,
              title: 'Update Values',
            },
            {
              key: 'plans',
              href: (i) => `/runTime/Planner?idInstance=${i._id}`,
              icon: () => <IoDocumentTextOutline size={22} />,
              title: 'View Plans',
            },
          ]}
        />
      </div>
    </>
  )
}
