import { getPostconditionsByEventId, getPostconditionsByStepId } from '../../../lib/postcondition'

export default async function handler(req, res) {
  if (req.body.idEvent) {
    const postconditions = await getPostconditionsByEventId(req.body.idEvent)
    return res.status(200).json(postconditions)
  }
  const postconditions = await getPostconditionsByStepId(req.body.idStep)
  return res.status(200).json(postconditions)
}
