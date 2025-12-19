import { getArtifact } from '../../../lib/artifact'

export default async function handler(req, res) {
  const data = req.body
  const artifact = await getArtifact(data._id)
  res.json(artifact)
}
