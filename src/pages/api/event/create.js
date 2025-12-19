import { createEvent } from '../../../lib/event'

export default async function handler(req, res) {
  const data = req.body
  const newEvent = await createEvent(data.idCaseModel)
  res.json(newEvent)
}
