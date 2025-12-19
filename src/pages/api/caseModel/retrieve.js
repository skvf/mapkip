import { getCaseModel } from '../../../lib/caseModel'

export default async function handler(req, res) {
  const data = req.body
  const caseModel = await getCaseModel(data._id)
  res.json(caseModel)
}
