import { useRouter } from 'next/router'
import Header from '../../../components/Header'

import { useEffect, useState } from 'react'
import usePlanner from '../../../hooks/usePlanner'
import CodeEditor from '../../../components/CodeEditor'

function PageEditor() {
  const [file, setFile] = useState('model')

  const [modelContent, updateModelContent] = useState(null)
  const [propertiesContent, updatePropertiesContent] = useState(null)

  const handleInput = (e) => {
    if ('model' === file) {
      updateModelContent(e.target.value)
    } else {
      updatePropertiesContent(e.target.value)
    }
  }
  const router = useRouter()
  const { id } = router.query
  const { planner, isLoading, isError } = usePlanner(id)

  useEffect(() => {
    if (planner) {
      updateModelContent(planner.model)
      updatePropertiesContent(planner.properties)
    }
  }, [planner])

  return (
    <>
      <Header env="runtime" />
      <div className="container mt-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error: {JSON.stringify(isError)}</p>}

        <CodeEditor />
      </div>
    </>
  )
}

export default PageEditor
