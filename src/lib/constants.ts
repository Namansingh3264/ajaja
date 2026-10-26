import { User } from '@/types';

export const SEED_USERS: User[] = [
  {
    id: 'usr_alice',
    name: 'Alice Chen',
    email: 'alice@ajaia.internal',
    avatar: 'AC',
    role: 'Product Lead',
    color: '#4F46E5', // Indigo
  },
  {
    id: 'usr_bob',
    name: 'Bob Martin',
    email: 'bob@ajaia.internal',
    avatar: 'BM',
    role: 'Staff Engineer',
    color: '#059669', // Emerald
  },
  {
    id: 'usr_charlie',
    name: 'Charlie Patel',
    email: 'charlie@ajaia.internal',
    avatar: 'CP',
    role: 'Lead Designer',
    color: '#D97706', // Amber
  },
];
