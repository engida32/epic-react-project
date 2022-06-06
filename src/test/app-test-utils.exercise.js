import {render as rtlRender, screen} from '@testing-library/react'
import {buildUser} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {waitForElementToBeRemoved} from '@testing-library/react'
import * as usersDB from 'test/data/users'
import {userEvent} from '@testing-library/user-event'

async function loginAsUser(userProperties) {
  const user = buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
  return authUser
}
async function render(ui, {route = './list', user, ...renderOptions} = {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user

  window.history.pushState({}, 'Test page', route)

  const returnValue = {
    ...rtlRender(ui, {wrapper: AppProviders, ...renderOptions}),
    user,
  }
  await waitForLaodingToFinish()
  return returnValue
}
const waitForLaodingToFinish = () =>
  waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
export * from '@testing-library/react'
export {render, waitForLaodingToFinish, loginAsUser}
