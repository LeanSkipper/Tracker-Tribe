'use client';

interface ProfileCompletionBadgeProps {
    percentage: number;
    xpEarned: number;
}

export default function ProfileCompletionBadge({ percentage, xpEarned }: ProfileCompletionBadgeProps) {
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (percentage / 100) * circumference;

    // Gradient color based on completion
    const getColor = () => {
        if (percentage === 100) return 'text-green-600';
        if (percentage >= 66) return 'text-blue-600';
        if (percentage >= 33) return 'text-yellow-600';
        return 'text-gray-400';
    };

    const getStrokeColor = () => {
        if (percentage === 100) return '#10b981'; // green
        if (percentage >= 66) return '#2563eb'; // blue
        if (percentage >= 33) return '#eab308'; // yellow
        return '#9ca3af'; // gray
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Circular Progress */}
            <div className="relative w-28 h-28">
                <svg className="transform -rotate-90 w-28 h-28">
                    {/* Background circle */}
                    <circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke={getStrokeColor()}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                </svg>
                {/* Percentage text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-black ${getColor()}`}>
                        {percentage}%
                    </span>
                    <span className="text-xs text-gray-500">complete</span>
                </div>
            </div>

            {/* XP Earned */}
            {xpEarned > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <span>⭐</span>
                    <span>{xpEarned} XP earned</span>
                </div>
            )}

            {/* Call to action */}
            {percentage < 100 && (
                <p className="text-xs text-gray-500 text-center max-w-[120px]">
                    Complete your profile to earn up to {19 - xpEarned} more XP!
                </p>
            )}

            {percentage === 100 && (
                <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                    <span>✓</span>
                    <span>Profile Complete!</span>
                </div>
            )}
        </div>
    );
}
