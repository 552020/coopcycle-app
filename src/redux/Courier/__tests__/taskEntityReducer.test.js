import { omit } from 'lodash'
import { tasksEntityReducer } from '../taskEntityReducer'
import {
  loadTasksRequest, loadTasksFailure, loadTasksSuccess,
  markTaskDoneRequest, markTaskDoneFailure, markTaskDoneSuccess,
  markTaskFailedRequest, markTaskFailedFailure, markTaskFailedSuccess,
} from '../taskActions'
import {
  selectIsTasksLoading, selectIsTasksLoadingFailure, selectIsTaskCompleteFailure,
  selectTasksList,
} from '../taskSelectors';
import { message } from '../../middlewares/WebSocketMiddleware'

// As we may be using setTimeout(), we need to mock timers
// @see https://jestjs.io/docs/en/timer-mocks.html
jest.useFakeTimers();

describe('Redux | Tasks | Reducers', () => {
  const initialState = tasksEntityReducer()

  describe('tasksEntityReducer', () => {
    [
      loadTasksRequest,
      markTaskDoneRequest,
      markTaskFailedRequest,
    ]
      .forEach((actionCreator) => {
        test(`${actionCreator}`, () => {
          const prevState = {
            ...initialState,
            fetchError: true,
          }
          const newState = tasksEntityReducer(prevState, actionCreator())
          const fullState = { entities: { tasks: newState } }

          const restOldState = omit(prevState, ['fetchError', 'isFetching'])
          const restNewState = omit(newState, ['fetchError', 'isFetching'])

          expect(restOldState).toEqual(restNewState)
          expect(selectIsTasksLoading(fullState)).toEqual(true)
          expect(selectIsTasksLoadingFailure(fullState)).toEqual(false)
        })
      });

    test(`${loadTasksFailure}`, () => {
      const error = new Error('test error')
      const prevState = {
        ...initialState,
        isFetching: true,
      }
      const newState = tasksEntityReducer(prevState, loadTasksFailure(error))
      const fullState = { entities: { tasks: newState } }

      const restOldState = omit(prevState, ['loadTasksFetchError', 'isFetching'])
      const restNewState = omit(newState, ['loadTasksFetchError', 'isFetching'])

      expect(restOldState).toEqual(restNewState)
      expect(selectIsTasksLoading(fullState)).toEqual(false)
      expect(selectIsTasksLoadingFailure(fullState)).toEqual(error)
    });

    [
      markTaskDoneFailure,
      markTaskFailedFailure,
    ]
      .forEach((actionCreator) => {
        test(`${actionCreator}`, () => {
          const error = new Error('test error')
          const prevState = {
            ...initialState,
            isFetching: true,
          }
          const newState = tasksEntityReducer(prevState, actionCreator(error))
          const fullState = { entities: { tasks: newState } }

          const restOldState = omit(prevState, ['completeTaskFetchError', 'isFetching'])
          const restNewState = omit(newState, ['completeTaskFetchError', 'isFetching'])

          expect(restOldState).toEqual(restNewState)
          expect(selectIsTasksLoading(fullState)).toEqual(false)
          expect(selectIsTaskCompleteFailure(fullState)).toEqual(error)
        })
      })

    test(`${loadTasksSuccess}`, () => {
      const tasks = [{ id: 1, assignedTo: 'bob' }, { id: 2, assignedTo: 'bob' }]
      const prevState = {
        ...initialState,
        loadTasksFetchError: true,
        isFetching: true,
      }
      const newState = tasksEntityReducer(prevState, loadTasksSuccess(tasks))
      const fullState = { entities: { tasks: newState } }

      const restOldState = omit(prevState, ['loadTasksFetchError', 'isFetching', 'items', 'order'])
      const restNewState = omit(newState, ['loadTasksFetchError', 'isFetching', 'items', 'order'])

      expect(selectIsTasksLoading(fullState)).toBe(false)
      expect(selectIsTasksLoadingFailure(fullState)).toBe(false)
      expect(selectTasksList(fullState)).toEqual(tasks)

      expect(restOldState).toEqual(restNewState)
    });

    [
      markTaskDoneSuccess,
      markTaskFailedSuccess,
    ]
      .forEach((actionCreator) => {
        test(`${actionCreator}`, () => {
          const task = { id: 1, foo: 'bar' }
          const prevState = {
            ...initialState,
            items: { 1: task },
            order: [1],
          }

          const newState = tasksEntityReducer(prevState, actionCreator({ ...task, foo: 'foo' }))
          const fullState = { entities: { tasks: newState } }

          const restOldState = omit(prevState, ['items'])
          const restNewState = omit(newState, ['items'])
          const { isFetching } = newState

          expect(selectTasksList(fullState)).toEqual([{ ...task, foo: 'foo' }]);

          expect(restOldState).toEqual(restNewState)
          expect(isFetching).toBeFalsy()
        })
      })

    test(`${message} | tasks:changed`, () => {
      const tasks = [{ id: 1, position: 1 }, { id: 2, position: 0 }]
      const wsMsg = { type: 'tasks:changed', tasks }

      const prevState = {
        ...initialState,
      }

      const newState = tasksEntityReducer(prevState, message(wsMsg))
      const fullState = { entities: { tasks: newState } }

      const restOldState = omit(prevState, ['items', 'order'])
      const restNewState = omit(newState, ['items', 'order'])

      expect(selectTasksList(fullState)).toEqual([tasks[1], tasks[0]])
      expect(restOldState).toEqual(restNewState)
    })

    test(`${message} | task:changed`, () => {
      const oldTasks = [{ id: 1, position: 0 }, { id: 2, position: 1 }]
      const newTasks = [{ id: 1, position: 0 }, { id: 3, position: 1 }, { id: 2, position: 2 }]
      const wsMsg = { type: 'tasks:changed', tasks: newTasks }

      const prevState = {
        ...initialState,
        items: { 1: oldTasks[0], 2: oldTasks[1] },
        order: [1, 2],
      }

      const newState = tasksEntityReducer(prevState, message(wsMsg))
      const fullState = { entities: { tasks: newState } }

      const restOldState = omit(prevState, ['items', 'order'])
      const restNewState = omit(newState, ['items', 'order'])

      expect(selectTasksList(fullState)).toEqual(newTasks);
      expect(restOldState).toEqual(restNewState)
    })

    test(`${message} | unrecognized message type`, () => {
      const prevState = { ...initialState }
      const newState = tasksEntityReducer(prevState, message({ type: 'fake' }))

      expect(newState).toEqual(prevState)
    })
  })
})
