"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CalendarIcon as CalendarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  RocketLaunchIcon as RocketLaunchIconSolid,
  TrophyIcon as TrophyIconSolid,
} from '@heroicons/react/24/solid';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Today', href: '/today', icon: CalendarIcon, iconSolid: CalendarIconSolid },
  { name: 'Projects', href: '/projects', icon: RocketLaunchIcon, iconSolid: RocketLaunchIconSolid },
  { name: 'Session', href: '/session', icon: AcademicCapIcon, iconSolid: AcademicCapIconSolid },
  { name: 'Checkpoints', href: '/checkpoints', icon: TrophyIcon, iconSolid: TrophyIconSolid },
  { name: 'Analytics', href: '/history', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
  { name: '🎉 Achievements Demo', href: '/achievements-demo', icon: TrophyIcon, iconSolid: TrophyIconSolid },
];

export function StudySidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#5B7CFF] to-[#B24BF3] bg-clip-text text-transparent">
          Study OS
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors duration-150
                ${isActive 
                  ? 'bg-[#F0F4FF] text-[#5B7CFF]' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            V
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Vilmer</p>
            <p className="text-xs text-gray-500">Dag 47 / 365</p>
          </div>
        </div>
      </div>
    </div>
  );
}

