import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`
      relative overflow-hidden
      bg-white/5 backdrop-blur-xl 
      border border-white/10 
      rounded-3xl 
      shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
      p-6
      ${className}
    `}>
            {/* Inner Glow Effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {title && (
                <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4 relative z-10">
                    {title}
                </h3>
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
