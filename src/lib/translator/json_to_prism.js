import { allAttributesByCaseModel, getAttribute } from '../attribute'
import { getMetric } from '../metric'

export function getModule(json) {
  let moduleName = json?.Situation?.Id || ''
  return moduleName
}

function transform_type(data) {
  if (data.Type === 'Decimal') {
    return {
      name: data.Name,
      values: `[${data.Range[0] * 10}..${data.Range[1] * 10}]`,
      current: data.CurrentState * 10,
    }
  } else if (data.Type === 'Integer') {
    return {
      name: data.Name,
      values: `[${data.Range[0]}..${data.Range[1]}]`,
      current: data.CurrentState,
    }
  } else if (data.Type === 'Boolean') {
    return {
      name: data.Name,
      values: 'bool',
      current: Boolean(data.CurrentState),
    }
  }
}

//TODO: mudar nome para variable_states
export function getState(json) {
  let attributes = json?.Situation?.Attributes
  if (!attributes) {
    throw new TypeError('Field json.Situation.Attributes not found.')
  }

  return attributes.map(transform_type)
}

//TODO: mudar nome para metricsVariableStates
function getMetrics(json) {
  let metrics = json.Goals.flatMap((g) => g.Tactics.flatMap((t) => t.Metrics)).map((m) =>
    transform_type({
      Name: m.Variable,
      Range: m.Range,
      CurrentState: 0,
      Type: m.Type,
    })
  )
  return metrics
}

async function getAttributeByName(json, name) {
  const attribute = json?.Situation?.Attributes.filter((a) => a.Name.trim() === name.trim())[0]

  if (attribute === undefined) {
    // BUSCAR NO CASE MODEL. Mas para isso tem que ir planner -> instance -> case model -> attributes

    const instance = await getPlanner(json.id)
    const caseModelId = instance.idCaseModel
    const attributes = await allAttributesByCaseModel(caseModelId)

    const attributeFromCaseModel = attributes.filter((a) => a.name.trim() === name.trim())[0]

    if (attributeFromCaseModel !== undefined) {
      return attributeFromCaseModel
    }

    throw TypeError("Attribute '" + name + "' not found.")
  }

  return attribute
}

async function formatEffect(json, responses) {
  const parts = []
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i]

    const attributeOrMetric = await getAttributeOrMetric(json, response.idAttribute)

    let value = response.value
    if (attributeOrMetric.Type === 'Decimal') {
      // procurar na string
      value = findNumbersOnStringAndScale(value)
    }

    if (response.operator === '=') {
      value = attributeOrMetric.Type === 'Boolean' ? Boolean(value) : value
      parts.push(
        `(${attributeOrMetric.Name || attributeOrMetric.Variable}'${response.operator}${value})`
      )
    } else {
      parts.push(generateEffectExpression(response, attributeOrMetric, value))
    }
  }
  return parts.join(' & ')
}

async function getAttributeOrMetric(json, id) {
  const attribute = await getAttributeOrThrowById(json, id, false)
  if (attribute) {
    return attribute
  }

  return await getMetricOrThrowById(json, id)
}

function generateEffectExpression(response, attributeOrMetric, value) {
  const mapper = {
    '+': 'min',
    '-': 'max',
    '/': 'max',
    '*': 'min',
  }
  const fnMinOrMax = mapper[response.operator]
  const minOrMaxValue =
    fnMinOrMax === 'max' ? attributeOrMetric.Range[0] : attributeOrMetric.Range[1]

  return `(${attributeOrMetric.Name || attributeOrMetric.Variable}'=${fnMinOrMax}(${minOrMaxValue},${attributeOrMetric.Name || attributeOrMetric.Variable}${response.operator}${value}))`
}

function findNumbersOnStringAndScale(value) {
  console.log('Procurando números na string:', value)
  const _numbers = String(value).match(/\d+(?:\.\d+)?/)

  // se não encontrar números, retorna o valor original
  if (_numbers == undefined) {
    return value
  }

  let numbers = _numbers
    .map((n) => ({
      original: n,
      new: n * 10,
    }))
    .reduce((acc, cur) => {
      if (cur == undefined) {
        return acc
      }
      return String(acc).split(cur.original).join(String(cur.new))
    }, value)
  return numbers
}

async function getAttributeOrThrowById(json, id, throwIfNotFound = true) {
  let attribute = json?.Situation?.Attributes.filter((a) => a.Id.trim() === id.trim())[0]

  if (attribute !== undefined) {
    console.log('Atributo encontrado no JSON:', attribute)
    return attribute
  }

  // Buscar no Banco de dados se não encontrar no JSON
  attribute = await getAttribute(id)

  if (attribute === undefined && throwIfNotFound) {
    throw TypeError("Attribute with id '" + id + "' not found.")
  }

  if (attribute === undefined || attribute === null) {
    return undefined
  }

  // formatar attribute para o formato esperado
  attribute = {
    Id: attribute._id.toString(),
    Name: attribute.code,
    Type: attribute.type,
    Range: attribute.rangeOfValues,
    NormalRange: attribute.normalRangeOfValues,
    // "CurrentState": ??? <- não sabemos se é necessário
  }
  return attribute
}

async function getMetricOrThrowById(json, id) {
  // buscar na métrica da tatica atual
  let metric = json?.Goals.flatMap((g) => g.Tactics.flatMap((t) => t.Metrics)).filter(
    (m) => m.Id === id
  )[0]

  if (metric) {
    console.log('Métrica encontrada no JSON:', metric)
    return metric
  }

  // buscar na base de dados
  metric = await getMetric(id)

  if (metric) {
    console.log('Métrica encontrada pelo id:', metric)

    // TODO: converter para o formato esperado
    return metric
  }

  throw new TypeError("Attribute or Metric with id '" + id + "' not found.")
}

function transformarIntegerEmLetra(num) {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (num < 0 || num >= letras.length) return ''
  return letras[num]
}

//TODO: mudar getCommandsForAction
export async function getCommands(json) {
  let activities = json?.Goals.flatMap((g, indexGoal) =>
    g.Tactics.flatMap((t, indexTactic) => {
      return t.Activities.map((a, indexActivity) => ({
        ...a,
        idGoal: g.Id,
        idTactic: t.Id,
        fakeNome: `${transformarIntegerEmLetra(indexTactic)}${indexActivity + 1}_${a.Name.toLocaleLowerCase().replaceAll(' ', '_')}`,
      }))
    })
  )

  // remove activities duplicadas
  activities = activities.filter(
    (activity, index, self) => index === self.findIndex((a) => a.Id === activity.Id)
  )

  if (!activities) {
    throw new TypeError('Field json.Goals not found.')
  }

  const arr = []

  for (let index = 0; index < activities.length; index++) {
    const currentActivity = activities[index]
    const preconditions = await getPreconditionsFromActivity(currentActivity, json)

    const sumEffectsProbs =
      currentActivity.Effects.map((e) => e.Probability).reduce((acc, p) => acc + p * 1000, 0.0) /
      1000

    if (sumEffectsProbs !== 1.0) {
      throw new TypeError(
        'Probability ' +
          sumEffectsProbs +
          " is not equal to 1 in activity '" +
          currentActivity.Name +
          "'."
      )
    }

    const sortedEffects = (currentActivity.Effects || []).sort(
      (a, b) => b.Probability - a.Probability
    )
    const prismEffectParts = []
    for (let i = 0; i < sortedEffects.length; i++) {
      const currentEffect = sortedEffects[i]
      const resp = await formatEffect(json, currentEffect.Response)
      prismEffectParts.push(currentEffect.Probability + ':' + resp)
    }
    let effects = prismEffectParts.join(' + ')

    let action =
      currentActivity.idGoal +
      '_' +
      currentActivity.idTactic +
      '_' +
      currentActivity.Name.toLocaleLowerCase().replaceAll(' ', '_') +
      '_' +
      currentActivity.Id
    action = currentActivity.fakeNome

    // limit to 32 characters
    const MAX_LENGTH = 32
    if (action.length > MAX_LENGTH) {
      action = action.substring(0, MAX_LENGTH)
    }

    // check if action already exists in arr
    if (arr.find((a) => a.action === action)) {
      console.info(`Action '${action}' already exists. Please use a different name.`)
      action = action + '_' + index
    }

    arr.push({
      action,
      guard: preconditions,
      effect: effects,
      cost: currentActivity.Cost || 0,
    })
  }

  return arr
}

export async function getPreconditionsFromActivity(currentActivity, json) {
  let preconditions = ''
  if (currentActivity.Preconditions && currentActivity.Preconditions.length) {
    const preconds = []
    for (let i = 0; i < currentActivity.Preconditions.length; i++) {
      const precondition = currentActivity.Preconditions[i]
      const COMMANDS = {
        'Greater-than': '>',
        'Greater-than-or-equal': '>=',
        'Less-than': '<',
        'Less-than-or-equal': '<=',
        Equal: '=',
      }
      let commands = Object.keys(precondition)
      let commandsPosition = Object.keys(COMMANDS)
        .map((c) => ({
          command: c,
          str: COMMANDS[c],
          index: commands.indexOf(c),
          value: precondition[c],
        }))
        .filter((c) => c.index > 0)[0]

      let value
      let attribute
      let metric
      try {
        attribute = await getAttributeByName(json, precondition.Attribute)

        value = commandsPosition.value
        if (attribute.Type === 'Decimal') {
          value = commandsPosition.value * 10
        }
      } catch (e) {
        if (e instanceof TypeError) {
          metric = json?.Goals.flatMap((g) => g.Tactics.flatMap((t) => t.Metrics)).filter(
            (m) => m.Variable === precondition.Metric
          )[0]
          if (metric) {
            value = commandsPosition?.value
            if (metric.Type === 'Decimal') {
              value = commandsPosition?.value * 10
            } else if (metric.Type === 'boolean' || metric.Type === 'Boolean') {
              value = Boolean(commandsPosition?.value)
            }
          } else {
            throw new TypeError(
              `Neither attribute '${precondition.Attribute}' nor metric '${precondition.Metric}' was found.`
            )
          }
        }
      } finally {
        // Only apply AttributeType conversion if we didn't find an attribute/metric with a Type
        if (!attribute && !metric) {
          if (precondition.AttributeType === 'boolean' || precondition.MetricType === 'boolean') {
            value = Boolean(commandsPosition.value)
          }
          if (precondition.AttributeType === 'integer') {
            value = parseInt(commandsPosition.value)
          }
        }
      }

      preconds.push(
        `${precondition.Attribute || precondition.Metric}${commandsPosition.str}${value}`
      )
    }
    preconditions = preconds.join(' & ')
  } else {
    preconditions = ''
  }
  return preconditions
}

export function groupBy(xs, key) {
  if (!xs || !key) {
    return {}
  }

  return xs.reduce(function (rv, x) {
    ;(rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
}

export function getRewards(json) {
  if (!json) {
    throw new TypeError('Field json not found.')
  }
  let activities = groupBy(
    json.Goals.flatMap((g) =>
      g.Tactics.flatMap((t) =>
        t.Activities.flatMap((a) => ({
          Activity_Id: a.Id,
          Activity_Name: a.Name,
          Activity_Cost: a.Cost,
        }))
      )
    ),
    'Name'
  )
  let rewards = Object.keys(activities)
  return rewards.map((r) => ({
    Name: r,
    Items: activities[r],
  }))
}

function print_variable(str) {
  return `${str.name}: ${str.values} init ${str.current};`
}

function uniqueBy(arr, prop) {
  return arr.filter((obj, index, self) => index === self.findIndex((o) => o[prop] === obj[prop]))
}

function preconditionToExpression(pre) {
  const key = Object.keys(pre).find((k) =>
    ['Greater-than', 'Less-than', 'Greater-than-or-equal', 'Less-than-or-equal', 'Equal'].includes(
      k
    )
  )

  const operatorMap = {
    'Greater-than': '>',
    'Less-than': '<',
    'Greater-than-or-equal': '>=',
    'Less-than-or-equal': '<=',
    Equal: '=',
  }

  const operator = operatorMap[key] || '='
  const attribute = pre.Attribute
  const value = pre[key]

  if (pre.AttributeType === 'boolean') {
    return `${attribute}${operator}${Boolean(value)}`
  }

  return `${attribute}${operator}${value}`
}

// Função que converte um evento em PRISM
async function eventToPrism(json, event) {
  // monta condição (preconditions)
  const preconditions = event.Preconditions?.map((p) => {
    return preconditionToExpression(p)
  }).join(' & ')

  let sortedEventEffects = event.Effects?.sort((a, b) => b.Probability - a.Probability)

  const effects = []
  for (let i = 0; i < sortedEventEffects.length; i++) {
    const currentEffect = sortedEventEffects[i]
    const responseStr = await formatEffect(json, currentEffect.Response)
    effects.push(`${currentEffect.Probability}:${responseStr}`)
  }

  const effectsString = effects.join(' + ')

  return `\t[] ${preconditions || '__error_preconditions_required__'} -> ${effectsString || '__error_blank_effects__'};`
}

async function main(json) {
  const response = []
  response.push('mdp')

  response.push(json.Formula ? `formula ${json.Formula};\n` : '')

  response.push('module ' + getModule(json))
  response.push('\n\t// variables')

  let attributes = getState(json)
  // sort by name
  attributes.sort((a, b) => a.name.localeCompare(b.name))
  attributes.forEach((attribute) => {
    response.push('\t' + print_variable(attribute))
  })

  let metrics = getMetrics(json)
  metrics.sort((a, b) => a.name.localeCompare(b.name))
  uniqueBy(metrics, 'name').forEach((metric) => {
    response.push(`\t${print_variable(metric)}`)
  })

  response.push('\n\t// commands')

  const commands = await getCommands(json)
  const uniqueCommands = uniqueBy(commands, 'action')

  uniqueCommands.forEach((t) => {
    response.push(`\t[${t.action}] ${t.guard} -> ${t.effect};`)
  })

  response.push('\n\t// events')

  const eventStrings = json.Events
  for (let i = 0; i < eventStrings.length; i++) {
    const event = eventStrings[i]
    const eventPrism = await eventToPrism(json, event)
    response.push(eventPrism)
  }

  response.push('endmodule')

  response.push('\n\t// rewards')

  response.push('rewards "cost"')
  uniqueCommands.forEach((a) => {
    if (a.cost && a.cost > 0) {
      response.push(`\t[${a.action}] true : ${a.cost};`)
    }
  })

  response.push('endrewards')

  return response.join('\n')
}

// if (require.main === module) {
//   let file = require("./jsonEx1.json");
//   main(file);
// }

export default main
