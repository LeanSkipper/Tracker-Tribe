// Goal inspiration templates organized by life areas with absolute metrics
export interface GoalTemplate {
    id: string;
    area: string;
    title: string;
    metric: string;
    startValue: number;
    targetValue: number;
    kpis: string[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
    // Health
    { id: 'h1', area: 'Health', title: 'Exercise regularly', metric: 'Workout sessions per week', startValue: 0, targetValue: 156, kpis: ['Workout sessions logged', 'Total hours exercised'] },
    { id: 'h2', area: 'Health', title: 'Lose weight (Y kg)', metric: 'Weight loss (kg)', startValue: 0, targetValue: 10, kpis: ['Weight (kg)', 'Waist circumference (cm)'] },
    { id: 'h3', area: 'Health', title: 'Eat a balanced diet', metric: 'Balanced meals per week', startValue: 0, targetValue: 260, kpis: ['Balanced meals logged', 'Fruits/vegetables portions per day'] },
    { id: 'h4', area: 'Health', title: 'Quit smoking', metric: 'Smoke-free days', startValue: 0, targetValue: 365, kpis: ['Cigarettes per day', 'Nicotine-free weeks'] },
    { id: 'h5', area: 'Health', title: 'Improve mental health', metric: 'Meditation sessions per week', startValue: 0, targetValue: 104, kpis: ['Sleep hours per night', 'Meditation sessions logged'] },

    // Family
    { id: 'f1', area: 'Family', title: 'Spend more time with family', metric: 'Hours spent with family per week', startValue: 0, targetValue: 520, kpis: ['Family activities per month', 'Shared meals per week'] },
    { id: 'f2', area: 'Family', title: 'Balance work and family', metric: 'Work-free evenings per week', startValue: 0, targetValue: 156, kpis: ['No-weekend-work days', 'Evening presence logs'] },
    { id: 'f3', area: 'Family', title: 'Monthly family activity', metric: 'Family activities per month', startValue: 0, targetValue: 12, kpis: ['Planned events', 'Shared calendar events'] },
    { id: 'f4', area: 'Family', title: 'Start or grow a family', metric: 'Preparation milestones achieved', startValue: 0, targetValue: 10, kpis: ['Savings for family project (€)', 'Legal/admin steps done'] },
    { id: 'f5', area: 'Family', title: 'Improve family communication', metric: 'Screen-free family evenings', startValue: 0, targetValue: 52, kpis: ['Family meetings logged', 'Meaningful conversations per week'] },

    // Business/Career
    { id: 'c1', area: 'Business/Career', title: 'Get a promotion', metric: 'Key milestones achieved', startValue: 0, targetValue: 5, kpis: ['Annual goals hit (count)', 'Projects led'] },
    { id: 'c2', area: 'Business/Career', title: 'Change job', metric: 'Job applications sent', startValue: 0, targetValue: 20, kpis: ['Interviews completed', 'Offers received'] },
    { id: 'c3', area: 'Business/Career', title: 'Launch entrepreneurial project', metric: 'Hours invested in business', startValue: 0, targetValue: 300, kpis: ['Monthly revenue (€)', 'Tasks completed'] },
    { id: 'c4', area: 'Business/Career', title: 'Build new professional skill', metric: 'Training hours completed', startValue: 0, targetValue: 100, kpis: ['Certifications earned', 'Modules completed'] },
    { id: 'c5', area: 'Business/Career', title: 'Improve work organization', metric: 'Focus days (no procrastination)', startValue: 0, targetValue: 100, kpis: ['Tasks completed per day', 'Pomodoro blocks done'] },

    // Finance (Wealth)
    { id: 'w1', area: 'Wealth', title: 'Save money monthly', metric: 'Amount saved (€)', startValue: 0, targetValue: 3000, kpis: ['Monthly savings log', '% income saved'] },
    { id: 'w2', area: 'Wealth', title: 'Pay off debts', metric: 'Amount repaid (€)', startValue: 0, targetValue: 5000, kpis: ['Debt balance log', 'Installments completed'] },
    { id: 'w3', area: 'Wealth', title: 'Reduce unnecessary spending', metric: 'Spending reduction (€)', startValue: 0, targetValue: 2000, kpis: ['Budget respected (months)', 'Expense logs'] },
    { id: 'w4', area: 'Wealth', title: 'Increase income', metric: 'Extra income earned (€)', startValue: 0, targetValue: 5000, kpis: ['Side hustle revenue', 'Raises received'] },
    { id: 'w5', area: 'Wealth', title: 'Invest or buy major asset', metric: 'Amount invested (€)', startValue: 0, targetValue: 10000, kpis: ['Project savings progress', 'Property visits done'] },

    // Leisure
    { id: 'l1', area: 'Leisure', title: 'Travel more', metric: 'Trips completed', startValue: 0, targetValue: 6, kpis: ['Vacation days used', 'Destinations explored'] },
    { id: 'l2', area: 'Leisure', title: 'Take more vacations', metric: 'Days off taken', startValue: 0, targetValue: 20, kpis: ['Long weekends taken', 'PTO planned'] },
    { id: 'l3', area: 'Leisure', title: 'Dedicate time to a hobby', metric: 'Hours spent on hobby', startValue: 0, targetValue: 150, kpis: ['Weekly hobby time', 'Hobby sessions'] },
    { id: 'l4', area: 'Leisure', title: 'Reduce screen time', metric: 'Average daily screen time (hours)', startValue: 8, targetValue: 2, kpis: ['Screen time logs', 'Low-screen days per week'] },
    { id: 'l5', area: 'Leisure', title: 'Try new activities', metric: 'New activities tried', startValue: 0, targetValue: 12, kpis: ['Event logs', 'Experience reports'] },

    // Intellectual
    { id: 'i1', area: 'Intellectual', title: 'Read 12 books in the year', metric: 'Books read', startValue: 0, targetValue: 12, kpis: ['Reading hours', 'Book summaries'] },
    { id: 'i2', area: 'Intellectual', title: 'Learn a new language', metric: 'Lessons completed', startValue: 0, targetValue: 100, kpis: ['Study hours', 'Vocabulary mastered'] },
    { id: 'i3', area: 'Intellectual', title: 'Get a certification', metric: 'Modules completed', startValue: 0, targetValue: 10, kpis: ['Hours of study', 'Exams passed'] },
    { id: 'i4', area: 'Intellectual', title: 'Learn a musical instrument', metric: 'Practice hours', startValue: 0, targetValue: 120, kpis: ['Songs learned', 'Lessons taken'] },
    { id: 'i5', area: 'Intellectual', title: 'Boost general knowledge', metric: 'Educational content consumed', startValue: 0, targetValue: 52, kpis: ['Quiz scores', 'Podcasts/documents completed'] },

    // Social
    { id: 's1', area: 'Social', title: 'See friends weekly', metric: 'Friend meetups', startValue: 0, targetValue: 52, kpis: ['Calls/messages per week', 'Group events joined'] },
    { id: 's2', area: 'Social', title: 'Expand social circle', metric: 'New social contacts', startValue: 0, targetValue: 12, kpis: ['Networking events joined', 'Social apps used'] },
    { id: 's3', area: 'Social', title: 'Volunteer regularly', metric: 'Volunteer hours', startValue: 0, targetValue: 50, kpis: ['Projects contributed to', 'Organizations supported'] },
    { id: 's4', area: 'Social', title: 'Improve social skills', metric: 'Intentional conversations per week', startValue: 0, targetValue: 100, kpis: ['Resources studied', 'Feedback rounds done'] },
    { id: 's5', area: 'Social', title: 'Join a group activity', metric: 'Group sessions attended', startValue: 0, targetValue: 24, kpis: ['Group retention rate', 'Sessions logged'] },
];

export const LIFE_AREAS = ['Health', 'Family', 'Business/Career', 'Wealth', 'Leisure', 'Intellectual', 'Social'];
