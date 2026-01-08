import React, { useState, useEffect } from 'react';
import { useDashboardStats, useOrders } from '../api/queries';
import { Badge, Spinner, Button } from '@3asoftwares/ui-library';
import { OrderStatus } from '@3asoftwares/types';
import { formatIndianCompact } from '@3asoftwares/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faShoppingCart,
  faClock,
  faExclamationTriangle,
  faBell,
  faTimes,
  faSync,
} from '@fortawesome/free-solid-svg-icons';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardStats();
  const { data: recentOrders } = useOrders(1, 5);
  const [alerts, setAlerts] = useState<string[]>([]);

  const stats = data?.dashboardStats;
  const pendingOrders = stats?.pendingOrders ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;

  useEffect(() => {
    const newAlerts: string[] = [];
    if (pendingOrders > 10) {
      newAlerts.push(`${pendingOrders} pending orders require attention`);
    }
    if (recentOrders?.orders.orders.some((o: any) => o.orderStatus === OrderStatus.PENDING)) {
      newAlerts.push('New orders received');
    }
    setAlerts(newAlerts);
  }, [pendingOrders, recentOrders]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-red-800 dark:text-red-200 font-semibold">Error loading dashboard</h3>
        <p className="text-red-600 dark:text-red-300 text-sm mt-1">
          {error instanceof Error ? error.message : 'Failed to fetch data'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="!w-auto">
          <FontAwesomeIcon icon={faSync} className="mr-1" />
          Refresh
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={alert.includes('pending') ? faExclamationTriangle : faBell}
                  className="text-yellow-600 dark:text-yellow-400"
                />
                <span className="text-yellow-800 dark:text-yellow-200">{alert}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="!w-auto p-1"
                onClick={() => setAlerts(alerts.filter((_, i) => i !== index))}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
            <FontAwesomeIcon icon={faUsers} className="text-2xl text-blue-600" />
          </div>
          <p className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
            {totalUsers}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Registered customers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
            <FontAwesomeIcon icon={faShoppingCart} className="text-2xl text-green-600" />
          </div>
          <p className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
            {totalOrders}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All time orders</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
            <span className="text-2xl text-purple-600">₹</span>
          </div>
          <p className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
            {formatIndianCompact(Number(totalRevenue))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total earnings</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</h3>
            <FontAwesomeIcon icon={faClock} className="text-2xl text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingOrders}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Requires attention</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        </div>
        <div className="p-6">
          {recentOrders && recentOrders.orders.orders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.orders.orders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Order #{order.orderNumber || order.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatIndianCompact(order.total || 0)}
                    </p>
                    <Badge
                      variant={
                        order.orderStatus === OrderStatus.DELIVERED
                          ? 'success'
                          : order.orderStatus === OrderStatus.CANCELLED
                          ? 'error'
                          : order.orderStatus === OrderStatus.PENDING
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
};
