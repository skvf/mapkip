import { editArtifact } from '../../../lib/artifact'

export default async function handler(req, res) {
  const data = req.body
  const artifact = await editArtifact(data)
  res.json(artifact)
}
