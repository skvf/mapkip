import { updatePlanner } from '../../../lib/planner'
import transformer from '../../../lib/translator/json_to_prism'

export default async function handler(req, res) {
  const { body } = req
  try {
    const result = await transformer(body)
    await updatePlanner({
      _id: body.id,
      mdpText: result,
    })
    res.status(200).send(result)
  } catch (e) {
    console.error('Error processing request:', e)
    res.status(500).json({
      error: e.message,
    })
  }
}
