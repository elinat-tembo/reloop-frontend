import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import {
  ChartBarIcon,
  UsersIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'
import IconTab from '../components/IconTab'
import AnalyticsTab from './admin/AnalyticsTab'
import UsersTab from './admin/UsersTab'
import ListingsTab from './admin/ListingsTab'
import SwapsTab from './admin/SwapsTab'

function Admin() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

        <TabGroup>
          <TabList className="flex flex-wrap gap-2 mb-6">
            <Tab className="focus:outline-none">
              {({ selected }) => (
                <IconTab icon={ChartBarIcon} label="Analytics" selected={selected} />
              )}
            </Tab>
            <Tab className="focus:outline-none">
              {({ selected }) => (
                <IconTab icon={UsersIcon} label="Users" selected={selected} />
              )}
            </Tab>
            <Tab className="focus:outline-none">
              {({ selected }) => (
                <IconTab
                  icon={ArchiveBoxIcon}
                  label="Listings"
                  selected={selected}
                />
              )}
            </Tab>
            <Tab className="focus:outline-none">
              {({ selected }) => (
                <IconTab
                  icon={ArrowsRightLeftIcon}
                  label="Swaps"
                  selected={selected}
                />
              )}
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <AnalyticsTab />
            </TabPanel>
            <TabPanel>
              <UsersTab />
            </TabPanel>
            <TabPanel>
              <ListingsTab />
            </TabPanel>
            <TabPanel>
              <SwapsTab />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}

export default Admin
