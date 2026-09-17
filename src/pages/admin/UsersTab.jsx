import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getUsers, activateUser, deactivateUser } from '../../api/admin'
import Spinner from '../../components/Spinner'
import Pagination from '../../components/Pagination'

const PAGE_LIMIT = 10

function StatusPill({ isActive }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getUsers(page, PAGE_LIMIT)
      .then(({ users: data, pagination: paginationData }) => {
        if (!cancelled) {
          setUsers(data)
          setPagination(paginationData)
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load users.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page])

  async function handleToggle(user) {
    setActioningId(user.id)
    try {
      const updated = user.isActive
        ? await deactivateUser(user.id)
        : await activateUser(user.id)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)),
      )
      toast.success(
        updated.isActive ? 'User activated' : 'User deactivated',
      )
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.')
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (users.length === 0) {
    return <p className="text-gray-500">No users found.</p>
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-secondary/30 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary/30 text-left text-xs text-gray-500">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/20">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 text-gray-900">{user.name}</td>
                <td className="px-4 py-2 text-gray-700">{user.email}</td>
                <td className="px-4 py-2 text-gray-700 capitalize">
                  {user.role}
                </td>
                <td className="px-4 py-2">
                  <StatusPill isActive={user.isActive} />
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  {user.role === 'admin' ? (
                    <span className="text-xs text-gray-400">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggle(user)}
                      disabled={actioningId === user.id}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer ${
                        user.isActive
                          ? 'border border-red-300 text-red-600 hover:bg-red-50'
                          : 'border border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasPrev={pagination.hasPrev}
          hasNext={pagination.hasNext}
          onChange={setPage}
        />
      )}
    </div>
  )
}

export default UsersTab
