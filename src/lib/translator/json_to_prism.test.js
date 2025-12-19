import jsonEx1 from './jsonEx1.json'
import jsonEx2 from './jsonEx2.json'
import jsonEx3 from './jsonEx3.json'
import jsonEx4 from './jsonEx4.json'
import jsonEx5 from './jsonEx5.json'
import {
  getCommands,
  getModule,
  getPreconditionsFromActivity,
  getRewards,
  getState,
  groupBy,
} from './json_to_prism'

describe('getModule function', () => {
  test("get module name from json to equal 'Test'", () => {
    const result = getModule({ Situation: { Id: 'Test' } })
    expect(result).toBe('Test')
  })

  test("passing undefined to be ''", () => {
    expect(getModule(undefined)).toBe('')
  })
})

describe('getState function', () => {
  test('passing undefined to throw error', () => {
    expect(() => getState(undefined)).toThrow(TypeError)
    expect(() => getState(undefined)).toThrow('Field json.Situation.Attributes not found.')
  })

  test('passing json1 to be 8', () => {
    let state = getState(jsonEx1)
    expect(state.length).toBe(8)
    expect(state).toMatchSnapshot()
  })

  test('passing json2 to be 8', () => {
    let state = getState(jsonEx2)
    expect(state.length).toBe(14)
    expect(state).toMatchSnapshot()
  })
})

describe('getCommands function', () => {
  test('passing undefined to throw error', () => {
    expect(() => getCommands(undefined)).toThrow(TypeError)
    expect(() => getCommands(undefined)).toThrow('Field json.Goals not found.')
  })

  test('passing json1 to be 9', () => {
    let tactics = getCommands(jsonEx1)
    expect(tactics.length).toBe(9)
    expect(tactics).toMatchSnapshot()
  })

  test('passing json2 to be 17', () => {
    let tactics = getCommands(jsonEx2)
    expect(tactics.length).toBe(17)
    expect(tactics).toMatchSnapshot()
  })

  test('passing json3 to be xxx', () => {
    let tactics = getCommands(jsonEx3)
    expect(tactics.length).toBe(0)
    expect(tactics).toMatchSnapshot()
  })

  test('passing json4 to be xxx', () => {
    expect(() => getCommands(jsonEx4)).toThrow(TypeError)
    expect(() => getCommands(jsonEx4)).toThrow(
      "Neither attribute 'N' nor metric 'undefined' was found."
    )
  })

  test('json5', () => {
    expect(() => getCommands(jsonEx5)).toBe('')
  })
})

describe('getRewards function', () => {
  test('passing undefined to throw error', () => {
    expect(() => getRewards(undefined)).toThrow(TypeError)
    expect(() => getRewards(undefined)).toThrow('Field json not found.')
  })

  test('passing json1 to be 2', () => {
    let rewards = getRewards(jsonEx1)
    expect(rewards.length).toBe(2)
    expect(rewards).toMatchSnapshot()
  })

  test('passing json2 to be 1', () => {
    let rewards = getRewards(jsonEx2)
    expect(rewards.length).toBe(1)
    expect(rewards).toMatchSnapshot()
  })
})

describe('groupBy function', () => {
  test('passing undefined to be {}', () => {
    expect(groupBy(undefined, undefined)).toStrictEqual({})
  })

  test('groupBy empty array', () => {
    expect(groupBy([], 'k')).toStrictEqual({})
  })

  test('groupBy array length', () => {
    expect(groupBy(['Sheila', 'Mateus', 'Venero', 'Moreira'], 'length')).toStrictEqual({
      6: ['Sheila', 'Mateus', 'Venero'],
      7: ['Moreira'],
    })
  })
})

describe('getPreconditionsFromActivity function', () => {
  test('Activity with no preconditions', () => {
    const currentActivity = { Preconditions: [] }
    const json = {}
    const result = getPreconditionsFromActivity(currentActivity, json)
    expect(result).toBe('')
  })

  test('Activity with preconditions', () => {
    const currentActivity = jsonEx4.Goals[0].Tactics[1].Activities[0]
    const json = jsonEx4
    expect(() => getPreconditionsFromActivity(currentActivity, json)).toThrow(TypeError)
    expect(() => getPreconditionsFromActivity(currentActivity, json)).toThrow(
      "Neither attribute 'N' nor metric 'undefined' was found."
    )
  })
})
