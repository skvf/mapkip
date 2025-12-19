import { allCaseModel } from '../../../lib/caseModel'

export default async function handler(req, res) {
  try {
    const caseModel = await allCaseModel()
    res.json(caseModel)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch case models' })
  }
  // res.json(caseModel);
}
