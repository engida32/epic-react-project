// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import {
  fireEvent,
  render,
  screen,
  loginAsUser,
  userEvent,
  waitForLaodingToFinish,
} from 'test/app-test-utils'
import {buildBook, buildListItem} from 'test/generate'
import {App} from 'app'
import * as booksDB from 'test/data/books'
import {formatDate} from 'utils/misc'
import * as listItemsDB from 'test/data/list-items'
import faker from 'faker'
// const fakeTimerUserEvent = userEvent.setup({
//   advanceTimers: () => jest.runOnlyPendingTimers(),
// })
test('renders all the book information', async () => {
  //   const originalFetch = window.fetch
  //   window.fetch = async (url, config) => {
  //     if (url.endsWith('/bootstrap')) {
  //       return {
  //         ok: true,
  //         json: async () => ({
  //           user: {...user, token: 'SOME_FAKE_TOKEN'},
  //           listItems: [],
  //         }),
  //       }
  //     } else if (url.endsWith(`/books/${book.id}`)) {
  //       return {ok: true, json: async () => ({book})}
  //     }
  //     return originalFetch(url, config)
  //   }
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`

  await render(<App />, {route})
  // waiting loading to be reomved form dom
  //   await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))
  // await waitForLaodingToFinish()
  //   screen.debug()
  //   screen.getByRole('bla')
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove form list /i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read /i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textarea', {name: /notes/i}),
  ).not.toBeInTheDocument()
})
test('renders all the book information', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`

  await render(<App />, {route})

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()

  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

//testing removing from the list

test('can remove a list for the book ', async () => {
  // await loginAsUser()
  // window.history.pushState({}, 'Test page', `/book/${book.id}`)
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  const user = await loginAsUser()
  await listItemsDB.create(buildListItem({owner: user, book}))

  await render(<App />, {route, user})
  const removeFromListButton = screen.getByRole('button', {
    name: /remove from list/i,
  })
  fireEvent.click(removeFromListButton)
  expect(removeFromListButton).toBeDisabled()
  expect(removeFromListButton).toBeDisabled()
  await waitForLaodingToFinish()

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()

  // screen.debug()
})

test('can mark as a read  ', async () => {
  // await loginAsUser()
  // window.history.pushState({}, 'Test page', `/book/${book.id}`)

  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  const user = await loginAsUser()
  const listItem = await listItemsDB.create(
    buildListItem({
      owner: user,
      book,
      finishDate: null,
    }),
  )

  await render(<App />, {route, user})
  const markAsRead = screen.getByRole('button', {
    name: /mark as read/i,
  })
  fireEvent.click(markAsRead)
  expect(markAsRead).toBeDisabled()
  expect(markAsRead).toBeDisabled()
  await waitForLaodingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
  const startDateAndFinishNode = screen.getByLabelText(/start and finish date/i)
  // screen.debug(startDateAndFinishNode)
  expect(startDateAndFinishNode).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(Date.now())}`,
  )
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()

  // screen.debug()
})

// //editing note

test('can mark as a read  ', async () => {
  jest.fakeTimerUserEvent()
  // await loginAsUser()
  // window.history.pushState({}, 'Test page', `/book/${book.id}`)

  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  const user = await loginAsUser()
  const listItem = await listItemsDB.create(buildListItem({owner: user, book}))

  await render(<App />, {route, user})

  const newNote = faker.lorem.word()
  const notesTextArea = screen.getByRole('textbox', {name: /notes/i})
  userEvent.clear(notesTextArea)
  userEvent.type(notesTextArea, newNote)

  await screen.findByLabelText(/loading/i)
  // await waitForLaodingToFinish()

  expect(notesTextArea).toHaveTextContent(newNote)
  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: newNote,
  })
  // screen.debug()
})
