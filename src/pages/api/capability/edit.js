import { editCapability } from '../../../lib/capability'

export default async function handler(req, res) {
  const data = req.body
  const capability = await editCapability(data)
  res.json(capability)
}
