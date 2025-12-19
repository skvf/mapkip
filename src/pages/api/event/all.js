import { allEvents } from '../../../lib/event'

export default async function handler(req, res) {
  const data = req.body
  const events = await allEvents(data.idCaseModel)
  res.json(events)
}
