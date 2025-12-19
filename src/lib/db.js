import { MongoClient } from 'mongodb'

export async function connectToDatabase() {
  const client = await MongoClient.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  return client
}

export const ARTIFACT_COLLECTION = 'artifacts'
export const ATTRIBUTE_COLLECTION = 'attributes'
export const CAPABILITY_COLLECTION = 'capabilities'
export const CASE_MODEL_COLLECTION = 'case_models'
export const COMMENT_COLLECTION = 'comments'
export const EVENT_COLLECTION = 'events'
export const GOAL_COLLECTION = 'goals'
export const ITEM_COLLECTION = 'items'
export const METRIC_COLLECTION = 'metrics'
export const PERMISSION_COLLECTION = 'permissions'
export const PLANNER_COLLECTION = 'planners'
export const POSTCONDITION_COLLECTION = 'postconditions'
export const PRECONDITION_COLLECTION = 'preconditions'
export const RESPONSABILITY_COLLECTION = 'responsabilities'
export const ROLE_COLLECTION = 'roles'
export const RUNNING_INSTANCE_COLLECTION = 'running_instances'
export const STEP_COLLECTION = 'steps'
export const TACTIC_COLLECTION = 'tactics'
export const TASK_COLLECTION = 'tasks'
