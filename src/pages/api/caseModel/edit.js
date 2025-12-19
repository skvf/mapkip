import { editCaseModel } from '../../../lib/caseModel'

export default async function handler(req, res) {
  const data = req.body
  const caseModel = await editCaseModel(data)
  res.json(caseModel)
}
