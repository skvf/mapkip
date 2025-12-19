import { getAttribute } from '../../../lib/attribute'
import { allEvents } from '../../../lib/event'
import { getGoals } from '../../../lib/goal'
import { allMetrics, getMetric } from '../../../lib/metric'
import { createPlanner } from '../../../lib/planner'
import { getPostconditionsByStepId } from '../../../lib/postcondition'
import { getPreconditionsByTacticOrStepId } from '../../../lib/precondition'

const MAPPER_OPERATOR = {
  '=': 'Equal',
  '!=': 'Not-Equal',
  '>': 'Greater-than',
  '<': 'Less-than',
  '>=': 'Greater-than-or-equal',
  '<=': 'Less-than-or-equal',
}

export default async function handler(req, res) {
  const { body } = req

  const activityEffectsCache = {}

  //   get no db os effects das activities
  const populateActivityEffectsCache = async (activity) => {
    const effects = (await getPostconditionsByStepId(activity._id)).map((p) => ({
      // latest 8 characters of the id
      Id: String(p._id).slice(-8),
      Probability: p.probability,
      Response: p.updates || [],
    }))

    // set on cache
    activityEffectsCache[activity._id] = effects
  }

  await Promise.all(
    body.selectedActivities.map((activity) => populateActivityEffectsCache(activity))
  )

  const groupBy = (attribute) => (collection) => {
    const response = {}
    for (let item of collection) {
      const group = item[attribute]
      if (!response[group]) {
        response[group] = []
      }
      response[group].push(item)
    }
    return response
  }

  const activitiesByTacticId = groupBy('idTactic')(body.selectedActivities)

  /**
   * Generates an array of attribute objects with formatted properties based on the selected attributes.
   *
   * @param {Array<Object>} selectedAttributes - The list of selected attribute objects.
   * Each attribute object should have the following properties:
   *   - {string} code - The name/code of the attribute.
   *   - {string} type - The type of the attribute.
   *   - {any} rangeOfValues - The range of possible values for the attribute.
   *   - {any} normalRangeOfValues - The normal range of values for the attribute.
   *   - {any} criticalRangeOfValues - The critical range of values for the attribute.
   *   - {_id: string} - The unique identifier for the attribute.
   *
   * @returns {Array<Object>} An array of objects, each representing an attribute with the following properties:
   *   - {string} Name
   *   - {string} Type
   *   - {any} Range
   *   - {any} NormalRange
   *   - {any} CriticalRange
   *   - {any} CurrentState
   */
  function generateAttributes(selectedAttributes) {
    return selectedAttributes.map((attr) => ({
      Id: attr._id,
      Name: attr.code,
      Type: attr.type.charAt(0).toUpperCase() + attr.type.slice(1),
      Range: attr.rangeOfValues,
      NormalRange: attr.normalRangeOfValues,
      CriticalRange: attr.criticalRangeOfValues,
      CurrentState: body.values[attr._id],
    }))
  }

  function sanitizeString(str) {
    // remove special characters and replace spaces with underscores
    return str.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')
  }

  async function generateActivities(tactic) {
    if (!activitiesByTacticId[tactic._id]) {
      return []
    }

    const activities = []
    for (let index = 0; index < activitiesByTacticId[tactic._id].length; index++) {
      const activity = activitiesByTacticId[tactic._id][index]
      activities.push(await createActivityObject(activity, index))
    }
    return activities
  }

  async function createActivityObject(activity, index) {
    const preconditions = await getPreconditionsByTacticOrStepId({
      idTactic: null, // aui tem que ser null, não lembro porque. Mas sei que tem que ser null.
      idStep: activity._id,
    })

    const preconditionsFormatted = preconditions.map((p) => {
      return {
        Id: String(p._id).slice(-8), // last 8 characters of the id
        Attribute: p?.attribute?.code,
        Metric: p?.metric?.code,
        [MAPPER_OPERATOR[p.operator]]: p.value, // map operator to the correct format
        AttributeType: p?.attribute?.type,
        MetricType: p?.metric?.type,
      }
    })

    const objectCreated = {
      Id: `A${index + 1}-${activity._id}`, // A1_id
      Name: sanitizeString(activity.description),
      Preconditions: preconditionsFormatted,
      Effects: activityEffectsCache[activity._id],
      Cost: activity.cost,
    }

    return objectCreated
  }

  function findAttributeByIdOnBody(attr_id) {
    return body.selectedAttributes.find((attr) => attr._id === attr_id)
  }

  async function generateMetricsForTactic(tactic) {
    const metrics = await allMetrics(tactic._id)
    const formattedMetrics = metrics.map((metric) => ({
      Id: String(metric._id), // last 8 characters of the id
      Variable: metric.code,
      Definition: metric.name,
      Type: metric.type.charAt(0).toUpperCase() + metric.type.slice(1),
      Range: metric.rangeOfValues,
      NormalRange: metric.normalRangeOfValues,
      CriticalRange: metric.criticalRangeOfValues,
      CurrentState: body.values[metric._id],
    }))
    return formattedMetrics
  }

  async function generateTacticsForGoal(attr_id) {
    const tactics = []
    for (let index = 0; index < body.selectedTactics.length; index++) {
      const currentTactic = body.selectedTactics[index]
      // TODO: remover as tactics que não tem goal com esse attr_id
      const goalsForThisTactic = await getGoals(currentTactic._id)
      if (!goalsForThisTactic.find((g) => g.idAttribute.toString() === attr_id)) {
        continue
      }

      // push tactic

      tactics.push({
        Id: `T${index + 1}_${currentTactic._id}`,
        Name: currentTactic.name,
        Definition: currentTactic.description,
        Preconditions: [], // TODO: get no db
        Rules: [], // TODO: GET no db
        Metrics: await generateMetricsForTactic(currentTactic),
        Activities: await generateActivities(currentTactic, activityEffectsCache), // end Activities
      })
    }
    return tactics
  }

  async function generateGoals(goalAttributeId, index) {
    const attributeDetails = findAttributeByIdOnBody(goalAttributeId)
    return {
      Id: `G${index + 1}`,
      Attribute_reference: attributeDetails.code, // code do attribute
      Range: attributeDetails.normalRangeOfValues, // RANGE NORMAL DO ATTRIBUTE. TODO: Substituir por valor do usuário
      Tactics: await generateTacticsForGoal(goalAttributeId), // end Tactics
    }
  }

  async function formatResponses(updates) {
    const responsesFormatted = []
    for (let j = 0; j < updates.length; j++) {
      const u = updates[j]
      const attr = await getAttribute(u.idAttribute)
      const metric = await getMetric(u.idMetric)

      responsesFormatted.push({
        Id: String(u._id).slice(-8),
        Attribute: attr ? attr.code : null,
        Metric: metric ? metric.code : null,
        idAttribute: attr ? String(attr._id) : String(metric._id),
        value: u.value,
        operator: u.operator,
      })
    }
    return responsesFormatted
  }

  async function generateEvents(body) {
    const idCaseModel = body.instance?.caseModel?._id || body.instance.idCaseModel
    const events = await allEvents(idCaseModel)

    console.log(JSON.stringify(events, null, 2))

    const eventsFormatted = []
    for (let i = 0; i < events.length; i++) {
      const event = events[i]

      let effects
      if (event.effects && event.effects.length) {
        effects = []
        for (let j = 0; j < event.effects.length; j++) {
          const e = event.effects[j]
          const responsesFormatted = await formatResponses(e.updates)
          effects.push({
            Id: String(e._id).slice(-8),
            Probability: e.probability,
            Response: responsesFormatted,
          })
        }
      }

      let preconditions
      if (event.preconditions && event.preconditions.length) {
        preconditions = []
        for (let j = 0; j < event.preconditions.length; j++) {
          const p = event.preconditions[j]
          const attr = await getAttribute(p.idAttribute)
          const metric = await getMetric(p.idMetric)

          preconditions.push({
            Id: String(p._id).slice(-8),
            Attribute: attr ? attr.code : null,
            Metric: metric ? metric.code : null,
            [MAPPER_OPERATOR[p.operator]]: p.value,
            AttributeType: attr ? attr.type : null,
            MetricType: metric ? metric.type : null,
          })
        }
      }

      eventsFormatted.push({
        Id: 'E-' + String(event._id).slice(-8),
        Preconditions: preconditions,
        Effects: effects,
      })
    }

    return eventsFormatted

    // {
    //   "Id": "A1",
    //   "Preconditions": [
    //     {
    //       "Id": "86dfe8c4",
    //       "Attribute": "SC",
    //       "Equal": 3
    //     }
    //   ],
    //   "Effects": [
    //     {
    //       "Id": "86dfe8c6",
    //       "Probability": 0.6,
    //       "Response": [
    //         {
    //           "idAttribute": "68bce8c76edef539d554cfa3",
    //           "operator": "=",
    //           "value": 1,
    //           "_id": 1760150433838
    //         }
    //       ]
    //     },
    //     {
    //       "Id": "86dfe8c8",
    //       "Probability": 0.4,
    //       "Response": [
    //         {
    //           "idAttribute": "68bce8c76edef539d554cfa3",
    //           "operator": "=",
    //           "value": 3,
    //           "_id": 1760150454533
    //         }
    //       ]
    //     }
    //   ],
    //   "Cost": 0
    // }
  }

  const plannerCreationResult = {
    Situation: {
      Id: `S1`,
      Attributes: generateAttributes(body.selectedAttributes),
    },
    Goals: await Promise.all(
      body.goals
        .filter((goal) => goal.attribute._id)
        .map((goal, index) => generateGoals(goal.attribute._id, index))
    ), // end Goals
    Criterion: {
      TypeFunction: 'Min',
      Reward: 'Monetary Cost',
    },
    Events: await generateEvents(body),
    Formula: body.formula,
    Property: body.utilityFunction,
  }

  const planner = await createPlanner({
    idInstance: body.instance._id,
    content: plannerCreationResult,
  })

  res.status(200).json({
    ...plannerCreationResult,
    id: planner.insertedId,
  })
}
