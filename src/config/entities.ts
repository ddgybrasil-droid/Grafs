import {
  AtSign,
  BriefcaseBusiness,
  Building2,
  CircleUserRound,
  FileText,
  Fingerprint,
  GraduationCap,
  House,
  Mail,
  MapPin,
  Phone,
  Shapes,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { EntityType } from '../types/graph';

export interface EntityConfig {
  label: string;
  pluralLabel: string;
  color: string;
  icon: LucideIcon;
  description: string;
}

export const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  person: {
    label: 'Person',
    pluralLabel: 'People',
    color: '#a78bfa',
    icon: UserRound,
    description: 'A synthetic person profile',
  },
  company: {
    label: 'Company',
    pluralLabel: 'Companies',
    color: '#38bdf8',
    icon: Building2,
    description: 'An organization or legal entity',
  },
  phone: {
    label: 'Phone',
    pluralLabel: 'Phones',
    color: '#34d399',
    icon: Phone,
    description: 'A user-entered phone number',
  },
  email: {
    label: 'Email',
    pluralLabel: 'Emails',
    color: '#fb7185',
    icon: Mail,
    description: 'A user-entered email address',
  },
  username: {
    label: 'Username',
    pluralLabel: 'Usernames',
    color: '#fbbf24',
    icon: Fingerprint,
    description: 'An account handle or alias',
  },
  website: {
    label: 'Website',
    pluralLabel: 'Websites',
    color: '#22d3ee',
    icon: House,
    description: 'A website or web resource',
  },
  address: {
    label: 'Address',
    pluralLabel: 'Addresses',
    color: '#f97316',
    icon: MapPin,
    description: 'A user-provided location',
  },
  document: {
    label: 'Document',
    pluralLabel: 'Documents',
    color: '#c4b5fd',
    icon: FileText,
    description: 'A project file or reference',
  },
  education: {
    label: 'Education',
    pluralLabel: 'Education',
    color: '#60a5fa',
    icon: GraduationCap,
    description: 'A school or study program',
  },
  workplace: {
    label: 'Workplace',
    pluralLabel: 'Workplaces',
    color: '#2dd4bf',
    icon: BriefcaseBusiness,
    description: 'A workplace or team',
  },
  social: {
    label: 'Social account',
    pluralLabel: 'Social accounts',
    color: '#f472b6',
    icon: AtSign,
    description: 'A manually entered social profile',
  },
  custom: {
    label: 'Custom entity',
    pluralLabel: 'Custom entities',
    color: '#94a3b8',
    icon: Shapes,
    description: 'A project-specific entity',
  },
};

export const FALLBACK_ENTITY_ICON = CircleUserRound;
