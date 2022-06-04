import {renderHook, act} from '@testing-library/react'
// 🐨 Here's the thing you'll be testing:
// import {useAsync} from '../hooks'
import {useAsync} from 'utils/hooks'
beforeAll(() => {
  jest.spyOn(console, 'error')
})
afterAll(() => {
  console.error.mockRestore()
})
const defualtState = {
  isIdle: true,
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  status: 'idle',
  data: null,
  setData: expect.any(Function),
  setError: expect.any(Function),
  run: expect.any(Function),
  reset: expect.any(Function),
}
const pendingState = {
  ...defualtState,
  status: 'pending',
  isIdle: false,
  isLoading: true,
}
const resolvedState = {
  ...defualtState,
  status: 'resolved',
  isIdle: false,
  isSuccess: true,
}
const rejectedState = {
  ...defualtState,
  status: 'rejected',
  isIdle: false,
  isError: true,
}

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

// Use it like this:
// const {promise, res  olve} = deferred()
// promise.then(() => console.log('resolved'))
// do stuff/make assertions you want to before calling resolve
// resolve()
// await promise
// do stuff/make assertions you want to after the promise has resolved

// 🐨 flesh out these tests
test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(defualtState)
  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(pendingState)
  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    resolve(resolvedValue)
    await p
  })

  expect(result.current).toEqual({
    ...resolvedState,
    data: resolvedValue,
  })
  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(defualtState)
})
/////////////////
test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(defualtState)
  let p
  act(() => {
    p = result.current.run(promise)
  })
  expect(result.current).toEqual(pendingState)
  const rejectedValue = Symbol('rejected value')
  await act(async () => {
    reject(rejectedValue)
    await p.catch(() => {
      // do nothing
    })
  })

  expect(result.current).toEqual({
    ...rejectedState,
    error: rejectedValue,
  })
  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(defualtState)
})
test('can specify an initial state', async () => {
  const mockData = Symbol('resolved status')
  const customInitialState = {status: 'resolved', data: mockData}
  const {result} = renderHook(() => useAsync(customInitialState))
  expect(result.current).toEqual({
    ...resolvedState,
    data: mockData,
  })
})

test('can set the data', () => {
  const mockData = Symbol('resolved value')
  const {result} = renderHook(() => useAsync())
  act(() => {
    result.current.setData(mockData)
  })
  expect(result.current).toEqual({
    ...resolvedState,
    data: mockData,
  })
})

test('can set the error', () => {
  const errorData = Symbol('rejected value')
  const {result} = renderHook(() => useAsync())
  act(() => {
    result.current.setError(errorData)
  })
  expect(result.current).toEqual({
    ...rejectedState,
    error: errorData,
  })
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync(promise))

  let p
  act(() => {
    p = result.current.run(promise)
  })
  unmount()
  await act(async () => {
    resolve()
    await p
  })
  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())
  expect(() => result.current.run()).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
