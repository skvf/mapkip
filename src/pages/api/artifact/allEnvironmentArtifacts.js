import { allEnvironmentArtifacts } from '../../../lib/artifact'

export default async function handler(req, res) {
  const data = req.body
  const artifact = await allEnvironmentArtifacts(data.idCaseModel)
  res.json(artifact)
}
