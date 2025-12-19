import { useRouter } from 'next/router'

function ModelingPage(props) {
  const router = useRouter()
  const { id } = router.query
  return (
    <>
      <p>{JSON.stringify({ props, id })}</p>
      <iframe
        style={{ height: '100vh', overflow: 'hidden' }}
        src="/dragndrop/newdraggable.html"
        width="100%"
        height="100%"
      />
    </>
  )
}

export default ModelingPage
