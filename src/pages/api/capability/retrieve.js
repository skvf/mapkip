import { getCapability } from '../../../lib/capability'

export default async function handler(req, res) {
  const data = req.body
  const capability = await getCapability(data._id)
  res.json(capability)
}
