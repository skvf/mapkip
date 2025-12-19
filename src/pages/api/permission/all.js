import { allPermissions } from '../../../lib/permission'

export default async function handler(req, res) {
  const data = req.body
  const permissions = await allPermissions(data.idRole)
  res.json(permissions)
}
