import { getPermission } from '../../../lib/permission'

export default async function handler(req, res) {
  const data = req.body
  const permission = await getPermission(data._id)
  res.json(permission)
}
