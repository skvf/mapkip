import { allRoles } from '../../../lib/role'

export default async function handler(req, res) {
  const data = req.body
  const role = await allRoles(data.idCaseModel)
  res.json(role)
}
