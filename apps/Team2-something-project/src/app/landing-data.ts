export const navItems = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Resources', href: '#resources' },
  { label: 'Roles', href: '#roles' },
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
    href: '/students',
    action: 'Open student page',
  },
  {
    title: 'Teachers',
    description: 'Review requests, watch capacity, and manage club membership.',
    tone: 'blue',
    href: '/teacher',
    action: 'Open teacher page',
  },
  {
    title: 'Admins',
    description: 'Open new clubs, assign staff, and keep the full program moving.',
    tone: 'ivory',
    href: '/admin',
    action: 'Open admin page',
  },
] as const;

export const footerColumns = [
  {
    title: 'Features',
    links: [
      { label: 'Student dashboard', href: '/students' },
      { label: 'Teacher dashboard', href: '/teacher' },
      { label: 'Admin dashboard', href: '/admin' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Club schedule', href: '#resources' },
      { label: 'Seat tracking', href: '#resources' },
      { label: 'Request flow', href: '#how-it-works' },
    ],
  },
  {
    title: 'School system',
    links: [
      { label: 'Club management', href: '/admin' },
      { label: 'Teacher assignment', href: '/admin' },
      { label: 'Student requests', href: '/students' },
      { label: 'Approval process', href: '/teacher' },
      { label: 'Capacity control', href: '/teacher' },
    ],
  },
  {
    title: 'Team 2 project',
    links: [
      { label: 'Open landing page', href: '/' },
      { label: 'Browse clubs', href: '/students' },
      { label: 'Review requests', href: '/teacher' },
      { label: 'Create a club', href: '/admin' },
    ],
  },
] as const;
