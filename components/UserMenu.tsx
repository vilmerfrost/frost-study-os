'use client';

import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { LogOut, User } from 'lucide-react';

interface UserMenuProps {
    user: any | null;
}

export default function UserMenu({ user }: UserMenuProps) {
    if (!user) {
        return (
            <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                Logga in
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.email}</span>
            </div>
            <button
                onClick={() => signOut()}
                className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logga ut</span>
            </button>
        </div>
    );
}
