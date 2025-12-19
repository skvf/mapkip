import { allAttributesByCaseModel } from '../../../lib/attribute'

export default async function handler(req, res) {
  const data = req.body
  const attributes = await allAttributesByCaseModel(data.idCaseModel)
  res.json(attributes)
}
