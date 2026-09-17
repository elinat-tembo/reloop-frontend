import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAnalytics } from '../../api/admin'
import Spinner from '../../components/Spinner'

const CHART_COLORS = [
  '#9381ff',
  '#9667e0',
  '#b8b8ff',
  '#d4bbfc',
  '#c4b5fd',
  '#7c3aed',
]

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-secondary/30 bg-white p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getAnalytics()
      .then((data) => {
        if (!cancelled) setAnalytics(data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load analytics.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (!analytics) {
    return <p className="text-gray-500">Analytics are unavailable.</p>
  }

  const availabilityData = [
    { name: 'Available', value: analytics.listingsByAvailability.available },
    {
      name: 'Unavailable',
      value: analytics.listingsByAvailability.unavailable,
    },
  ]

  const statusData = Object.entries(analytics.swapsByStatus).map(
    ([status, count]) => ({
      status: status.replaceAll('_', ' '),
      count,
    }),
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Users" value={analytics.totalUsers} />
        <SummaryCard label="Total Listings" value={analytics.totalListings} />
        <SummaryCard
          label="Available / Unavailable"
          value={`${analytics.listingsByAvailability.available} / ${analytics.listingsByAvailability.unavailable}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-secondary/30 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Listings by Availability
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={availabilityData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {availabilityData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-secondary/30 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Swaps by Status
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData}>
              <XAxis
                dataKey="status"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Top Active Users
        </h3>
        {analytics.topActiveUsers.length === 0 ? (
          <p className="text-gray-500">No active users yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-secondary/30 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/30 text-left text-xs text-gray-500">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Listings</th>
                  <th className="px-4 py-2 font-medium">Swaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/20">
                {analytics.topActiveUsers.map((entry) => (
                  <tr key={entry.userId}>
                    <td className="px-4 py-2 text-gray-900">{entry.name}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {entry.listingsCount}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {entry.swapsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsTab
