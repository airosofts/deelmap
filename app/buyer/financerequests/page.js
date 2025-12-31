'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Search, DollarSign, Calendar, Home, Briefcase, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function FinanceRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = requests.filter(req => {
        const propertyType = req.property_type?.toLowerCase() || '';
        const transactionType = req.transaction_type?.toLowerCase() || '';
        const loanAmount = req.loan_amount?.toString() || '';
        const query = searchQuery.toLowerCase();

        return propertyType.includes(query) ||
               transactionType.includes(query) ||
               loanAmount.includes(query);
      });
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/buyer/financing-requests', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests || []);
        setFilteredRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch financing requests:', err);
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              My Applications
            </h1>
            <p className="text-gray-600">
              View and track all your financing applications
            </p>
          </div>
          <Link
            href="/financing"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#022b41] hover:bg-[#033a56] text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <FileText className="w-5 h-5 mr-2" />
            New Application
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022b41] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No applications found' : 'No applications yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'Start by submitting a financing request'}
          </p>
          {!searchQuery && (
            <Link
              href="/financing"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#022b41] hover:bg-[#033a56] text-white rounded-lg font-medium transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Apply for Financing
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-[#022b41] hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#022b41] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {request.property_type || 'Property'} Financing
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.first_name} {request.last_name}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Loan Amount</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(request.loan_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Property Type</p>
                        <p className="font-medium text-gray-900">
                          {request.property_type || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Transaction</p>
                        <p className="font-medium text-gray-900">
                          {request.transaction_type || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Credit Score</p>
                        <p className="font-medium text-gray-900">
                          {request.credit_score || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  {request.comments && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Comments</p>
                      <p className="text-sm text-gray-700">{request.comments}</p>
                    </div>
                  )}
                </div>

                {/* Right Side - Status & Date */}
                <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-start gap-4">
                  <div className="flex items-center gap-2 lg:order-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(request.created_at)}
                    </span>
                  </div>
                  <div className="lg:order-1">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Email:</span>
                  <span>{request.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Phone:</span>
                  <span>{request.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
