export const GITHUB_USERNAME = 'your-username';

export const STATS_DATA = [
    { value: '5+', label: 'Years Experience', sub: 'Full Stack' },
    { value: '20+', label: 'Projects Completed', sub: 'Across 5+ Tech Stacks' },
    { value: '10+', label: 'Happy Clients', sub: 'Worldwide' },
];

export const TECH_STACK = [
    { name: 'React', accent: 'blue' },
    { name: 'TypeScript', accent: 'blue' },
    { name: 'Node.js', accent: 'green' },
    { name: 'Python', accent: 'green' },
    { name: 'Tailwind', accent: 'purple' },
    { name: 'Framer Motion', accent: 'purple' },
    { name: 'PostgreSQL', accent: 'pink' },
    { name: 'MongoDB', accent: 'pink' },
];

export const PROJECTS = [
    {
        id: 1,
        title: 'Project Alpha',
        description: 'A modern web application for team collaboration.',
        tags: ['React', 'Node.js', 'PostgreSQL'],
        accent: 'blue' as const,
    },
    {
        id: 2,
        title: 'Project Beta',
        description: 'Real-time analytics dashboard with beautiful visualizations.',
        tags: ['Vue', 'D3.js', 'Express'],
        accent: 'green' as const,
    },
    {
        id: 3,
        title: 'Project Gamma',
        description: 'Mobile-first e-commerce platform with seamless checkout.',
        tags: ['React Native', 'Stripe', 'Firebase'],
        accent: 'pink' as const,
    },
];