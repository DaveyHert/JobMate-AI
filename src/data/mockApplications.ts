export interface Application {
  id: number;
  title: string;
  company: string;
  url?: string;
  source: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'offer' | 'ghosted';
  dateApplied: string;
  notes?: string;
  jobType?: 'fulltime' | 'contract' | 'gig';
  jobBrief?: string;
}

export const mockApplications: Application[] = [
  {
    id: 1,
    title: 'Director of Engineering',
    company: 'Narvar',
    url: 'https://jobs.lever.co/narvar/director-engineering',
    source: 'lever',
    status: 'applied',
    dateApplied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Great company culture, excited about the role. Really impressed with their engineering blog and technical challenges.',
    jobType: 'fulltime',
    jobBrief: 'Lead engineering team of 15+ engineers, drive technical strategy and architecture decisions. Focus on scaling infrastructure and building world-class products.'
  },
  {
    id: 2,
    title: 'Senior Software Engineer',
    company: 'Stripe',
    url: 'https://stripe.com/jobs',
    source: 'linkedin',
    status: 'applied',
    dateApplied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Applied through company website. Strong technical team and great compensation package.',
    jobType: 'fulltime',
    jobBrief: 'Build scalable payment infrastructure, work with React and Node.js. Focus on API design and developer experience.'
  },
  {
    id: 3,
    title: 'Product Manager',
    company: 'Spotify',
    url: 'https://jobs.spotify.com',
    source: 'greenhouse',
    status: 'interviewing',
    dateApplied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'First round interview scheduled for next week. Really excited about working on music discovery features.',
    jobType: 'fulltime',
    jobBrief: 'Drive product strategy for music discovery features, work with cross-functional teams. Focus on user engagement and personalization algorithms.'
  },
  {
    id: 4,
    title: 'Frontend Engineer',
    company: 'Airbnb',
    url: 'https://careers.airbnb.com',
    source: 'linkedin',
    status: 'rejected',
    dateApplied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Not a good fit for the role. They were looking for more React Native experience.',
    jobType: 'contract',
    jobBrief: '6-month contract to rebuild host dashboard using React and TypeScript. Focus on performance optimization and mobile responsiveness.'
  },
  {
    id: 5,
    title: 'Technical Writer',
    company: 'Glean',
    url: 'https://glean.com/careers',
    source: 'greenhouse',
    status: 'applied',
    dateApplied: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Interesting AI company with great growth potential. Love their approach to enterprise search.',
    jobType: 'fulltime',
    jobBrief: 'Create technical documentation for AI/ML products, work with engineering teams. Focus on developer docs and API references.'
  },
  {
    id: 6,
    title: 'AI Outcomes Manager',
    company: 'Glean',
    url: 'https://glean.com/careers',
    source: 'indeed',
    status: 'applied',
    dateApplied: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Perfect fit for my background in AI and product management. Really excited about this opportunity.',
    jobType: 'fulltime',
    jobBrief: 'Drive AI product outcomes, analyze user behavior and improve ML models. Focus on customer success and product adoption metrics.'
  },
  {
    id: 7,
    title: 'Senior Product Manager',
    company: 'Meta',
    url: 'https://careers.meta.com',
    source: 'linkedin',
    status: 'applied',
    dateApplied: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Applied for AR/VR team. Dream job working on cutting-edge technology.',
    jobType: 'fulltime',
    jobBrief: 'Lead AR/VR product development, define roadmap for next-gen experiences. Focus on consumer products and platform strategy.'
  },
  {
    id: 8,
    title: 'Staff Engineer',
    company: 'Google',
    url: 'https://careers.google.com',
    source: 'other',
    status: 'ghosted',
    dateApplied: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Dream job opportunity but no response yet. Will follow up next week.',
    jobType: 'fulltime',
    jobBrief: 'Technical leadership role, drive architecture decisions across multiple teams. Focus on distributed systems and infrastructure.'
  },
  {
    id: 9,
    title: 'UX Consultant',
    company: 'Apple',
    url: 'https://jobs.apple.com',
    source: 'workable',
    status: 'applied',
    dateApplied: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Applied directly through website. Excited about working on design systems.',
    jobType: 'gig',
    jobBrief: '3-month consulting project to redesign internal design tools. Focus on improving designer productivity and workflow.'
  }
];