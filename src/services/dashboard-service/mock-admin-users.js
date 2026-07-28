const now = new Date();

function ago(days = 0, hours = 0, minutes = 0) {
  return new Date(now.getTime() - days * 86400000 - hours * 3600000 - minutes * 60000).toISOString();
}

const FIRST_NAMES = [
  'Sarah', 'Michael', 'Emily', 'James', 'Lisa', 'David', 'Anna', 'Robert',
  'Jessica', 'William', 'Olivia', 'Daniel', 'Sophia', 'Matthew', 'Isabella',
  'Christopher', 'Mia', 'Andrew', 'Charlotte', 'Ryan', 'Amelia', 'Nathan',
  'Harper', 'Tyler', 'Evelyn', 'Brandon', 'Abigail', 'Jacob', 'Ella', 'Samuel',
  'Avery', 'Dylan', 'Scarlett', 'Jason', 'Grace', 'Ethan', 'Chloe', 'Noah',
  'Victoria', 'Lucas', 'Riley', 'Mason', 'Aria', 'Logan', 'Lily', 'Alexander',
  'Zoey', 'Benjamin', 'Nora', 'Caleb', 'Hannah', 'Owen', 'Layla', 'Gabriel',
  'Maya', 'Isaac', 'Elena', 'Julian', 'Aurora', 'Henry',
];

const LAST_NAMES = [
  'Johnson', 'Chen', 'Davis', 'Wilson', 'Brown', 'Miller', 'Garcia', 'Martinez',
  'Robinson', 'Thompson', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White',
  'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill',
];

const EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'proton.me', 'aol.com'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const USERS = Array.from({ length: 65 }, (_, i) => {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[i % LAST_NAMES.length];
  const name = `${firstName} ${lastName}`;
  const isActive = i < 58;
  const roleIdx = i % 15;
  const daysAgo = Math.floor(Math.random() * 180);
  const hoursAgo = Math.floor(Math.random() * 24);

  return {
    _id: `usr_${String(i + 1).padStart(4, '0')}`,
    name,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${pick(EMAIL_DOMAINS)}`,
    role: roleIdx === 0 ? 'admin' : roleIdx < 3 ? 'moderator' : 'user',
    status: isActive ? 'active' : 'suspended',
    provider: pick(['email', 'google', 'apple']),
    isEmailVerified: i < 60,
    avatar: null,
    loginCount: Math.floor(Math.random() * 200) + 1,
    createdAt: ago(daysAgo, hoursAgo),
    lastActive: ago(Math.floor(Math.random() * 7), Math.floor(Math.random() * 24)),
  };
});

export const MOCK_ADMIN_USERS = USERS;

export const MOCK_USERS_STATS = {
  totalUsers: 1248,
  activeUsers: 1083,
  suspendedUsers: 82,
  newToday: 14,
  adminCount: 3,
  moderatorCount: 8,
};
