import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import moment from 'moment'
import RNFetchBlob from 'rn-fetch-blob'

import {
  LOAD_TASKS_REQUEST, LOAD_TASKS_SUCCESS, LOAD_TASKS_FAILURE,
  MARK_TASK_DONE_REQUEST, MARK_TASK_DONE_SUCCESS, MARK_TASK_DONE_FAILURE,
  MARK_TASK_FAILED_REQUEST, MARK_TASK_FAILED_SUCCESS, MARK_TASK_FAILED_FAILURE,
  DONT_TRIGGER_TASKS_NOTIFICATION,

  loadTasksRequest, loadTasksSuccess, loadTasksFailure,
  markTaskDoneRequest, markTaskDoneSuccess, markTaskDoneFailure,
  markTaskFailedRequest, markTaskFailedSuccess, markTaskFailedFailure,
  dontTriggerTasksNotification,
  clearFiles,

  loadTasks, markTaskDone, markTaskFailed,
} from '../taskActions'

// As we may be using setTimeout(), we need to mock timers
// @see https://jestjs.io/docs/en/timer-mocks.html
jest.useFakeTimers();

// https://github.com/dmitry-zaets/redux-mock-store#asynchronous-actions
const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('Redux | Tasks | Actions', () => {
  [
    {
      actionCreator: loadTasksRequest,
      actionType: LOAD_TASKS_REQUEST,
    },

    {
      actionCreator: loadTasksFailure,
      actionType: LOAD_TASKS_FAILURE,
    },

    {
      actionCreator: loadTasksSuccess,
      actionType: LOAD_TASKS_SUCCESS,
    },

    {
      actionCreator: markTaskDoneRequest,
      actionType: MARK_TASK_DONE_REQUEST,
    },

    {
      actionCreator: markTaskDoneFailure,
      actionType: MARK_TASK_DONE_FAILURE,
    },

    {
      actionCreator: markTaskDoneSuccess,
      actionType: MARK_TASK_DONE_SUCCESS,
    },

    {
      actionCreator: markTaskFailedRequest,
      actionType: MARK_TASK_FAILED_REQUEST,
    },

    {
      actionCreator: markTaskFailedFailure,
      actionType: MARK_TASK_FAILED_FAILURE,
    },

    {
      actionCreator: markTaskFailedSuccess,
      actionType: MARK_TASK_FAILED_SUCCESS,
    },

    {
      actionCreator: dontTriggerTasksNotification,
      actionType: DONT_TRIGGER_TASKS_NOTIFICATION,
    },
  ]
    .forEach(({ actionCreator, actionType }) => {
      test(`${actionType}`, () => {
        expect(actionCreator()).toEqual({ type: actionType })
      })
    })

  test('loadTasks | Successful request', () => {
    const date = moment()
    const client = { get: jest.fn() }
    const dispatch = jest.fn()
    const resolveValue = { 'hydra:member': 'foo' }

    client.get.mockResolvedValue(resolveValue)

    const thunk = loadTasks(client, date)
    const promise = thunk(dispatch)

    expect(thunk).toBeInstanceOf(Function)
    expect(client.get).toHaveBeenCalledTimes(1)
    expect(client.get).toHaveBeenLastCalledWith(`/api/me/tasks/${date.format('YYYY-MM-DD')}`)

    return promise.then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith({ type: LOAD_TASKS_REQUEST, payload: date })
      expect(dispatch).toHaveBeenLastCalledWith({ type: LOAD_TASKS_SUCCESS, payload: resolveValue['hydra:member'] })
    })
  })

  test('loadTasks | Failed request', () => {
    const date = moment()
    const client = { get: jest.fn() }
    const dispatch = jest.fn()
    const rejectValue = new Error('test error')

    client.get.mockReturnValue(Promise.reject(rejectValue))

    const thunk = loadTasks(client, date)
    const promise = thunk(dispatch)

    expect(thunk).toBeInstanceOf(Function)
    expect(client.get).toHaveBeenCalledTimes(1)
    expect(client.get).toHaveBeenLastCalledWith(`/api/me/tasks/${date.format('YYYY-MM-DD')}`)

    return promise.catch(() => {
      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith({ type: LOAD_TASKS_REQUEST, payload: date })
      expect(dispatch).toHaveBeenLastCalledWith({ type: LOAD_TASKS_FAILURE, payload: rejectValue })
    })
  })

  test('markTaskDone | Successful request', () => {
    const task = { '@id': '/api/tasks/1' }
    const notes = 'notes'
    const resolveValue = { ...task }

    const client = {
      put: jest.fn(),
    }
    client.put.mockResolvedValue(resolveValue)
    client.put.mockResolvedValue(resolveValue)

    const store = mockStore({
      app: { httpClient: client },
      entities: {
        tasks: {
          signatures: [],
          pictures: [],
        },
      },
    })

    // Make sure to return the promise
    return store.dispatch(markTaskDone(client, task, notes))
      .then(() => {
        const actions = store.getActions()

        expect(actions).toContainEqual(markTaskDoneRequest(task))
        expect(actions).toContainEqual(clearFiles())
        expect(actions).toContainEqual(markTaskDoneSuccess(resolveValue))

        expect(client.put).toHaveBeenCalledTimes(1)
        expect(client.put).not.toHaveBeenCalledWith(task['@id'], { images: [] })
        expect(client.put).toHaveBeenCalledWith(`${task['@id']}/done`, { reason: notes })
      })
  })

  test('markTaskDone with PoDs | Successful request', () => {
    const task = { '@id': '/api/tasks/1' }
    const notes = 'notes'
    const resolveValue = { ...task }

    const client = {
      put: jest.fn(),
      getToken: () => '123456',
      getBaseURL: () => 'https://test.coopcycle.org',
    }
    client.put.mockResolvedValue(resolveValue)
    client.put.mockResolvedValue(resolveValue)

    const store = mockStore({
      app: { httpClient: client },
      entities: {
        tasks: {
          signatures: [
            '123456',
          ],
          pictures: [],
        },
      },
    })

    RNFetchBlob.fetch = jest.fn()
    RNFetchBlob.fetch.mockResolvedValue({
      info: () => ({ status: 201 }),
      json: () => ({ '@id': '/api/task_images/1' }),
    })

    // Make sure to return the promise
    return store.dispatch(markTaskDone(client, task, notes))
      .then(() => {
        const actions = store.getActions()

        expect(actions).toContainEqual(markTaskDoneRequest(task))
        expect(actions).toContainEqual(clearFiles())
        expect(actions).toContainEqual(markTaskDoneSuccess(resolveValue))

        expect(client.put).toHaveBeenCalledTimes(2)
        expect(client.put).toHaveBeenCalledWith(task['@id'], { images: [
          '/api/task_images/1',
        ] })
        expect(client.put).toHaveBeenCalledWith(`${task['@id']}/done`, { reason: notes })
      })
  })

  test('markTaskDone | Failed request', () => {
    const task = { '@id': 1 }
    const notes = 'notes'
    const rejectValue = new Error('test error')

    const client = {
      put: jest.fn(),
    }
    client.put.mockRejectedValue(rejectValue)

    const store = mockStore({
      app: { httpClient: client },
      entities: {
        tasks: {
          signatures: [],
          pictures: [],
        },
      },
    })

    // Make sure to return the promise
    return store.dispatch(markTaskDone(client, task, notes))
      .then(() => {
        const actions = store.getActions()

        expect(actions).toContainEqual(markTaskDoneRequest(task))
        expect(actions).toContainEqual(markTaskDoneFailure(rejectValue))

        expect(client.put).toHaveBeenCalledTimes(1)
        expect(client.put).not.toHaveBeenCalledWith(task['@id'], { images: [] })
        expect(client.put).toHaveBeenCalledWith(`${task['@id']}/done`, { reason: notes })
      })
  })

  test('markTaskFailed | Successful request', () => {
    const task = { '@id': '/api/tasks/1' }
    const notes = 'notes'
    const resolveValue = { ...task }

    const client = {
      put: jest.fn(),
    }
    client.put.mockResolvedValue(resolveValue)
    client.put.mockResolvedValue(resolveValue)

    const store = mockStore({
      app: { httpClient: client },
      entities: {
        tasks: {
          signatures: [],
          pictures: [],
        },
      },
    })

    // Make sure to return the promise
    return store.dispatch(markTaskFailed(client, task, notes))
      .then(() => {
        const actions = store.getActions()

        expect(actions).toContainEqual(markTaskFailedRequest(task))
        expect(actions).toContainEqual(clearFiles())
        expect(actions).toContainEqual(markTaskFailedSuccess(resolveValue))

        expect(client.put).toHaveBeenCalledTimes(1)
        expect(client.put).not.toHaveBeenCalledWith(task['@id'], { images: [] })
        expect(client.put).toHaveBeenCalledWith(`${task['@id']}/failed`, { reason: notes })
      })
  })

  test('markTaskFailed | Failed request', () => {
    const task = { '@id': 1 }
    const notes = 'notes'
    const rejectValue = new Error('test error')

    const client = {
      put: jest.fn(),
    }
    client.put.mockRejectedValue(rejectValue)

    const store = mockStore({
      app: { httpClient: client },
      entities: {
        tasks: {
          signatures: [],
          pictures: [],
        },
      },
    })

    // Make sure to return the promise
    return store.dispatch(markTaskFailed(client, task, notes))
      .then(() => {
        const actions = store.getActions()

        expect(actions).toContainEqual(markTaskFailedRequest(task))
        expect(actions).toContainEqual(markTaskFailedFailure(rejectValue))

        expect(client.put).toHaveBeenCalledTimes(1)
        expect(client.put).not.toHaveBeenCalledWith(task['@id'], { images: [] })
        expect(client.put).toHaveBeenCalledWith(`${task['@id']}/failed`, { reason: notes })
      })
  })
})
