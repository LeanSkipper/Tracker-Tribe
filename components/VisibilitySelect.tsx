'use client';

import { Lock, Users, Globe } from 'lucide-react';

interface VisibilitySelectProps {
    value: string;
    onChange: (value: string) => void;
    fieldName: string;
}

export default function VisibilitySelect({ value, onChange, fieldName }: VisibilitySelectProps) {
    const options = [
        { value: 'private', label: 'Private', icon: Lock, description: 'Only you' },
        { value: 'peers', label: 'Peers/Tribes', icon: Users, description: 'Your tribe members' },
        { value: 'public', label: 'Public', icon: Globe, description: 'Everyone' },
    ];

    return (
        <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500 font-medium">Visibility:</span>
            <div className="flex gap-1">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all ${isSelected
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                }`}
                            title={`${option.label}: ${option.description}`}
                            aria-label={`Set ${fieldName} visibility to ${option.label}`}
                        >
                            <Icon size={12} />
                            <span>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
