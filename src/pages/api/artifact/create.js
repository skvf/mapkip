import { createArtifact } from '../../../lib/artifact'

export default async function handler(req, res) {
  const data = req.body
  const newArtifact = await createArtifact(data.idCaseModel)
  res.json(newArtifact)
}
