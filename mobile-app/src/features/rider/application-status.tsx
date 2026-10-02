// Where the rider's application stands, with the admin's note when it was rejected or suspended.
import { Text } from 'react-native';
import { Notice } from '@/components/ui';
import { dateTime } from '@/lib/format';
import type { Rider } from '@/types/delivery';
import type { Tone } from '@/theme/theme';
import type { IconName } from '@/components/ui';

const LOOK: Record<Rider['status'], { tone: Tone; icon: IconName; title: string; body: string }> = {
  draft: { tone: 'primary', icon: 'edit-3', title: 'Finish your application', body: 'Add your details, location and documents, then send it for review.' },
  pending: { tone: 'warning', icon: 'clock', title: 'Application in review', body: 'An admin is checking your documents. You can go online as soon as you are approved.' },
  approved: { tone: 'success', icon: 'check-circle', title: 'You are approved', body: 'Go online from Home to start getting orders.' },
  rejected: { tone: 'danger', icon: 'x-circle', title: 'Changes needed', body: 'Fix what the admin asked for, then send your application again.' },
  suspended: { tone: 'danger', icon: 'slash', title: 'Account suspended', body: 'You cannot take orders right now. Contact support if this is a mistake.' }
};

export function ApplicationStatus({ rider }: { rider: Rider }) {
  const look = LOOK[rider.status];
  return (
    <Notice tone={look.tone} icon={look.icon}>
      <Text style={{ fontWeight: '700' }}>{look.title}. </Text>{look.body}
      {rider.review_note && (rider.status === 'rejected' || rider.status === 'suspended') ? `\nAdmin note: ${rider.review_note}` : ''}
      {rider.status === 'pending' && rider.submitted_at ? `\nSent ${dateTime(rider.submitted_at)}` : ''}
    </Notice>
  );
}

