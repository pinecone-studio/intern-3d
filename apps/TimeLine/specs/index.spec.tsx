import { render, waitFor } from '@testing-library/react'
import Page from '../src/app/page'
import { RoleProvider } from '../src/lib/role-context'

const push = jest.fn()
const replace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}))

describe('Page', () => {
  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    global.fetch = jest.fn(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)

      if (url === '/api/session') {
        return {
          ok: true,
          json: async () => ({ user: null }),
        } as Response
      }

      if (url === '/api/users') {
        return {
          ok: true,
          json: async () => ({
            users: [
              {
                id: 'admin-1',
                name: 'Ariun Admin',
                email: 'admin@school.local',
                role: 'admin',
                assignedDevice: null,
              },
            ],
          }),
        } as Response
      }

      return {
        ok: true,
        json: async () => ({}),
      } as Response
    }) as unknown as typeof fetch
  })

  it('should redirect to the dashboard', async () => {
    render(
      <RoleProvider>
        <Page />
      </RoleProvider>
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/dashboard')
    })
  })
})
