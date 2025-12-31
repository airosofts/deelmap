'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, MessageCircle, LogOut, User, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function BuyerSidebar({ mobileOpen, onClose }) {
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();

      // Poll for unread count every 10 seconds
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/buyer/chat?action=get_conversations', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const totalUnread = (data.conversations || []).reduce(
          (sum, conv) => sum + (conv.unread_count || 0),
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
      router.push('/');
    }
  };

  const menuItems = [
    {
      href: '/buyer/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      href: '/buyer/financerequests',
      icon: FileText,
      label: 'My Applications'
    },
    {
      href: '/buyer/inbox',
      icon: MessageCircle,
      label: 'Messages',
      badge: unreadCount
    },
    {
      href: '/buyer/profile',
      icon: User,
      label: 'Profile'
    }
  ];

  const getUserDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    } else if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    } else if (user?.user_metadata?.name) {
      const nameParts = user.user_metadata.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-64 bg-white
        border-r border-neutral-200
        flex flex-col h-screen
        transform transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="px-6 pt-6 pb-5">
          {/* Top Row: Back Button and Close Button */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#002B45] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Marketplace</span>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-[#F3F4F6] transition-colors duration-200"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Logo Container */}
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/ableman123.png"
              alt="Logo"
              className="h-8 w-auto object-contain"
            />
            {/* Buyer Portal Badge - Bottom Right */}
            <div className="w-full flex justify-end mt-2">
              <span className="inline-block px-2.5 py-0.5 bg-[#002B45] text-white text-[12px] font-medium tracking-wide rounded-md">
                Buyer Portal
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="px-4 pb-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#002B45] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-[#6B7280] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-[#002B45] text-white'
                      : 'text-neutral-700 hover:bg-[#F3F4F6]'
                    }
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span className="text-[14px] font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-[#002B45]'
                        : 'bg-[#002B45] text-white'
                    }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout - Bottom */}
        <div className="mt-auto px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-neutral-500 hover:bg-[#F3F4F6] hover:text-neutral-700 transition-colors duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="text-[13px] font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
