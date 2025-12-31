'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FileText, MessageCircle, DollarSign, Clock, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    totalConversations: 0,
    unreadMessages: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch financing requests
      const requestsResponse = await fetch('/api/buyer/financing-requests', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      const requestsData = await requestsResponse.json();

      if (requestsData.success) {
        const requests = requestsData.requests || [];
        setRecentApplications(requests.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalApplications: requests.length,
          pendingApplications: requests.length
        }));
      }

      // Fetch conversations
      const conversationsResponse = await fetch('/api/buyer/chat?action=get_conversations', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      const conversationsData = await conversationsResponse.json();

      if (conversationsData.success) {
        const conversations = conversationsData.conversations || [];
        setStats(prev => ({
          ...prev,
          totalConversations: conversations.length
        }));
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 border-t-[#002B45] mx-auto mb-4"></div>
          <p className="text-neutral-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                Welcome back, {user?.first_name || 'User'}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {getCurrentDate()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                System Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Applications */}
          <div className="relative bg-gradient-to-br from-white to-neutral-50/80 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-5 transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Applications</p>
                <p className="text-2xl font-semibold text-neutral-900 mt-2">{stats.totalApplications}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    Active
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="relative bg-gradient-to-br from-white to-neutral-50/80 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-5 transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Pending Review</p>
                <p className="text-2xl font-semibold text-neutral-900 mt-2">{stats.pendingApplications}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    In Progress
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Conversations */}
          <div className="relative bg-gradient-to-br from-white to-neutral-50/80 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-5 transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Conversations</p>
                <p className="text-2xl font-semibold text-neutral-900 mt-2">{stats.totalConversations}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
                    Active Chats
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Unread Messages */}
          <div className="relative bg-gradient-to-br from-white to-neutral-50/80 rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] p-5 transition-all duration-200 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Unread Messages</p>
                <p className="text-2xl font-semibold text-neutral-900 mt-2">{stats.unreadMessages}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600">
                    New
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
            <div className="p-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900">Recent Applications</h2>
                <Link
                  href="/buyer/financerequests"
                  className="text-xs font-medium text-[#002B45] hover:text-[#003d5c] transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>

            {recentApplications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="text-sm font-medium text-neutral-700 mb-1">No applications yet</p>
                <p className="text-xs text-neutral-500 mb-4">Start by submitting a financing request</p>
                <Link
                  href="/financing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#002B45] hover:bg-[#003d5c] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Apply for Financing
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentApplications.map((app) => (
                  <div key={app.id} className="p-4 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#002B45]/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-[#002B45]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{app.property_type || 'N/A'}</p>
                          <p className="text-xs text-neutral-500">{app.transaction_type || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">{formatCurrency(app.loan_amount)}</p>
                        <p className="text-xs text-neutral-500">{formatDate(app.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900 px-1">Quick Actions</h2>

            <Link
              href="/buyer/inbox"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#002B45] flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Check Messages</p>
                <p className="text-xs text-neutral-500">View lender conversations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/financing"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#b29578] flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">New Application</p>
                <p className="text-xs text-neutral-500">Apply for financing</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/buyer/profile"
              className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">Update Profile</p>
                <p className="text-xs text-neutral-500">Manage your account</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
