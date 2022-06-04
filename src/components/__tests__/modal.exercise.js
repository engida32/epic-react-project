import React from 'react'
import {render, within} from '@testing-library/react'
import {screen} from '@testing-library/dom'

import {Modal, ModalContents, ModalOpenButton} from '../modal'
import userEvent from '@testing-library/user-event'

test('can be opened and closed', async () => {
  const label = 'Modal Label'
  const title = 'Modal Title'
  const modalContent = 'Modal content'
  render(
    <Modal>
      <ModalOpenButton>
        <button>open</button>
      </ModalOpenButton>
      <ModalContents aria-label={label} title={title}>
        <div>{modalContent}</div>
      </ModalContents>
    </Modal>,
  )
  await userEvent.click(screen.getByRole('button', {name: /open/i}))
  const modal = screen.getByRole('dialog')
  expect(modal).toHaveAttribute('aria-label', label)
  const inModal = within(modal)
  expect(inModal.getByRole('heading', {name: title})).toBeInTheDocument()
  expect(inModal.getByText(modalContent)).toBeInTheDocument()
  await userEvent.click(inModal.getByRole('button', {name: /close/i}))

  //   screen.debug()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
