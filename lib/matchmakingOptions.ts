// Matchmaking Criteria Options for Tribe Creation and User Profiles

export const MATCHMAKING_OPTIONS = {
    ageRange: [
        '18-25',
        '26-35',
        '36-45',
        '46-55',
        '56-65',
        '65+',
        'Other'
    ],
    lifeFocus: [
        'Career Growth',
        'Business Building',
        'Health & Fitness',
        'Relationships',
        'Financial Freedom',
        'Personal Development',
        'Creative Pursuits',
        'Family & Parenting',
        'Spiritual Growth',
        'Other'
    ],
    professional: [
        'Entrepreneur',
        'Founder/CEO',
        'Executive/C-Suite',
        'Manager/Director',
        'Individual Contributor',
        'Freelancer/Consultant',
        'Student',
        'Career Transition',
        'Retired',
        'Other'
    ],
    wealth: [
        'Building Foundation ($0-$50K net worth)',
        'Growing ($50K-$250K)',
        'Established ($250K-$1M)',
        'Affluent ($1M-$5M)',
        'High Net Worth ($5M+)',
        'Prefer not to say',
        'Other'
    ],
    execution: [
        'Strategic Planner',
        'Action-Oriented Doer',
        'Analytical Thinker',
        'Creative Innovator',
        'Systematic Executor',
        'Agile Adapter',
        'Other'
    ],
    personality: [
        'Introverted',
        'Extroverted',
        'Ambivert',
        'Analytical',
        'Creative',
        'Empathetic',
        'Competitive',
        'Collaborative',
        'Other'
    ],
    health: [
        'Very Active (5+ workouts/week)',
        'Active (3-4 workouts/week)',
        'Moderate (1-2 workouts/week)',
        'Starting Fitness Journey',
        'Health Focused',
        'Wellness Enthusiast',
        'Other'
    ],
    skills: [
        'Marketing & Sales',
        'Technology & Engineering',
        'Finance & Accounting',
        'Operations & Logistics',
        'Product & Design',
        'Leadership & Management',
        'Communication & Writing',
        'Data & Analytics',
        'Legal & Compliance',
        'Other'
    ],
    values: [
        'Integrity & Honesty',
        'Growth & Learning',
        'Family & Relationships',
        'Achievement & Success',
        'Service & Contribution',
        'Freedom & Independence',
        'Innovation & Creativity',
        'Stability & Security',
        'Other'
    ],
    social: [
        'Very Active on Social Media',
        'Moderate Social Presence',
        'Minimal Social Media',
        'Professional Networks Only',
        'Privacy Focused',
        'Building Personal Brand',
        'Other'
    ],
    intent: [
        'Accountability & Support',
        'Networking & Connections',
        'Learning & Growth',
        'Business Opportunities',
        'Mastermind Collaboration',
        'Skill Development',
        'Finding Mentors',
        'Giving Back',
        'Other'
    ]
} as const;

export type MatchmakingCriteriaKey = keyof typeof MATCHMAKING_OPTIONS;
