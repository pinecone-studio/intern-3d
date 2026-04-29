export const navItems = [
  'How it works',
  'Features',
  'Prototype',
  'Roles',
] as const;

export const decisionSteps = [
  {
    number: '1',
    title: 'Browse clubs',
    description: 'Students explore clubs, schedules, teachers, and open seats.',
  },
  {
    number: '2',
    title: 'Send a request',
    description: 'A student submits one clear request to join the club they want.',
  },
  {
    number: '3',
    title: 'Review and approve',
    description: 'Teachers and admins review requests and keep capacity balanced.',
  },
] as const;

export const chatReplies = [
  'Robotics Lab has 2 seats left',
  'Teacher review is pending',
  'Creative Writing is open',
  'Room changed to Hall B',
] as const;

export const featureColumns = [
  {
    title: 'Student requests',
    description:
      'Students can compare clubs and send one focused request with confidence.',
  },
  {
    title: 'Teacher review',
    description:
      'Teachers approve the right students and keep their rosters organized.',
  },
  {
    title: 'Admin control',
    description:
      'Admins create clubs, assign teachers, and monitor the whole system.',
  },
] as const;

export const useCases = [
  {
    title: 'Students',
    description: 'See club choices, check schedules, and apply to the best fit.',
    tone: 'peach',
  },
  {
    title: 'Teachers',
    description: 'Review requests, watch capacity, and manage club membership.',
    tone: 'blue',
  },
  {
    title: 'Admins',
    description: 'Open new clubs, assign staff, and keep the full program moving.',
    tone: 'ivory',
  },
] as const;

export const footerColumns = [
  {
    title: 'Features',
    links: [
      'Student dashboard',
      'Teacher dashboard',
      'Admin dashboard',
    ],
  },
  {
    title: 'Resources',
    links: ['Club schedule', 'Seat tracking', 'CSV prototype'],
  },
  {
    title: 'School system',
    links: [
      'Club management',
      'Teacher assignment',
      'Student requests',
      'Approval process',
      'Capacity control',
    ],
  },
  {
    title: 'Team 2 project',
    links: [
      'Open landing page',
      'Browse clubs',
      'Review requests',
      'Create a club',
    ],
  },
] as const;
