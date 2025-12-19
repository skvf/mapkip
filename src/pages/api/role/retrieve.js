import { getRole } from '../../../lib/role'

export default async function handler(req, res) {
  const data = req.body
  const role = await getRole(data._id)
  res.json(role)
}
