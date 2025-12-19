import { getRunningInstanceById } from '../../../lib/runningInstance'

export default async function handler(req, res) {
  const {
    query: { id },
  } = req

  try {
    const instance = await getRunningInstanceById(id)
    res.status(200).json(instance)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
