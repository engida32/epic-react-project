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
import {server, rest} from 'test/server'
const apiURL = process.env.REACT_APP_URL

// const fakeTimerUserEvent = userEvent.setup({
//   advanceTimers: () => jest.runOnlyPendingTimers(),
// })
async function renderBookScreen({user, book, listItem} = {}) {
  if (user === undefined) {
    user = await loginAsUser()
  }
  if (book === undefined) {
    book = await booksDB.create(buildBook())
  }
  if (listItem === undefined) {
    listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  }
  const route = `/book/${book.id}`
  const utils = await render(<App />, {route, user})
  return {...utils, user, book, listItem}
}
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
  const {book} = await renderBookScreen({listItem: null})
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

test('can create a list item for the book', async () => {
  await renderBookScreen({listItem: null})
  const addToListButton = screen.getByRole('button', {name: /add to list/i})
  await fireEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLaodingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: /notes/i})).toBeInTheDocument()

  const startDateNode = screen.getByLabelText(/start date/i)
  expect(startDateNode).toHaveTextContent(formatDate(Date.now()))

  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})

//testing removing from the list

test('can remove a list for the book ', async () => {
  // await loginAsUser()
  // window.history.pushState({}, 'Test page', `/book/${book.id}`)

  await renderBookScreen()

  const removeFromListButton = screen.getByRole('button', {
    name: /Remove from list/i,
  })
  fireEvent.click(removeFromListButton)
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

  const {listItem} = await renderBookScreen()
  await listItemsDB.update(listItem.id, {finishDate: null})
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

// editing note

test('can edit text area  ', async () => {
  // const event = userEvent.setup()
  jest.useFakeTimers()
  // await loginAsUser()
  // window.history.pushState({}, 'Test page', `/book/${book.id}`)

  // const book = await booksDB.create(buildBook())
  // const route = `/book/${book.id}`
  // const user = await loginAsUser()
  // const listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  // await render(<App />, {route, user})

  const {listItem} = await renderBookScreen()

  const newNote = faker.lorem.words()
  const notesTextarea = screen.getByRole('textbox', {name: /notes/i})
  await userEvent.clear(notesTextarea)
  await userEvent.type(notesTextarea, newNote)

  await screen.findByLabelText(/loading/i)
  await waitForLaodingToFinish()

  expect(notesTextarea).toHaveValue(newNote)
  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: newNote,
  })
  // screen.debug()
})
// CONSOLE ERROR RESTING
describe('console error', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').getMockImplementation(() => {})
  })
  afterAll(() => {
    console.error.mockRestore()
  })
  test('show an error message when the book fails to load ', async () => {
    const book = {id: 'BAD ID'}
    await renderBookScreen({listItem: null, book})
    expect(
      (await screen.findByRole('alert')).textContent,
    ).toMatchInlineSnapshot(`"There was an error: Book not found"`)
  })

  test('note update failures are displayed', async () => {
    jest.useFakeTimers()

    const {listItem} = await renderBookScreen()

    const newNote = faker.lorem.words()
    const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

    server.use(
      rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctxt) => {
        return res(
          ctxt.status(400),
          ctxt.json({status: 400, message: 'THERE IS AN ERROR'}),
        )
      }),
    )
    await userEvent.clear(notesTextarea)
    await userEvent.type(notesTextarea, newNote)

    await screen.findByLabelText(/loading/i)
    await waitForLaodingToFinish()
    expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot()
    expect(await listItemsDB.read(listItem.id)).toMatchObject({
      notes: newNote,
    })
  })
})
