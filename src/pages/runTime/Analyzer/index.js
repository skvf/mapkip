import { useRouter } from 'next/router'
import Header from '../../../components/Header'
import Instances from '../../../components/Instances'

import { TbAnalyze } from 'react-icons/tb'

export const fetcher = (url) => fetch(url).then((res) => res.json())

export default function CaseInstancesPage() {
  const router = useRouter()

  return (
    <>
      <Header env="runtime"> </Header>
      <div className="container">
        <Instances
          title="Analyzer"
          subtitle="Executing instances"
          router={router}
          actions={[
            {
              key: 'analyze',
              href: (i) => `/runTime/Analyzer/${i._id}`,
              icon: () => <TbAnalyze size={22} />,
              title: 'Analyze',
            },
          ]}
        />
      </div>
    </>
  )
}
