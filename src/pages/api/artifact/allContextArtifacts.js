import { allContextArtifacts } from '../../../lib/artifact'

export default async function handler(req, res) {
  const data = req.body
  const artifact = await allContextArtifacts(data.idCaseModel)
  res.json(artifact)
}
