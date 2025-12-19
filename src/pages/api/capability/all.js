import { allCapabilities } from '../../../lib/capability'

export default async function handler(req, res) {
  const data = req.body
  const capabilities = await allCapabilities(data.idRole)
  res.json(capabilities)
}
