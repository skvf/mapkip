import { createCaseModel } from '../../../lib/caseModel'

export default async function handler(req, res) {
  const newCaseModel = await createCaseModel()
  res.json(newCaseModel)
}
