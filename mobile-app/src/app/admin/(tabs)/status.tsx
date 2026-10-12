// System status for the admin: is the server up, since when, how fast it answers, which optional features are on,
// and the outages this phone has seen (with how long each lasted). Checks again every 15 seconds.
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/text';
import { Badge, Card, HeroHeader, InfoRow, Notice, Screen, StatCard } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDuration, useConnection } from '@/lib/connection';
import { useFeatures } from '@/lib/features';
import { REMOTE_LOGS_ON } from '@/lib/remote-log';
import { OFFLINE_CACHE_ON } from '@/lib/local-cache';
import { accents, space, text } from '@/theme/theme';

interface Health {
  status: string;
  started_at?: string;
  uptime_seconds?: number;
}

async function checkHealth() {
  const started = Date.now();
  const health = await api<Health>('/health');
  return { ...health, answeredInMs: Date.now() - started };
}

function onOff(on: boolean) {
  return <Badge label={on ? 'On' : 'Off'} tone={on ? 'success' : 'neutral'} />;
}

export default function AdminStatus() {
  const health = useQuery({ queryKey: ['admin-status'], queryFn: checkHealth, refetchInterval: 15_000, retry: 0 });
  const { data: features } = useFeatures();
  const { downSince, outages } = useConnection();
  const up = health.isSuccess && downSince === null;
  const uptime = health.data?.uptime_seconds ?? 0;
  return (
    <Screen onRefresh={() => void health.refetch()} refreshing={health.isRefetching}>
      <HeroHeader title={up ? 'All systems running' : 'Server not answering'} subtitle={up ? `Up for ${formatDuration(uptime * 1000)}` : 'The app keeps checking by itself'} icon="activity" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        <StatCard label="Answer time" value={health.data ? `${health.data.answeredInMs} ms` : '—'} icon="zap" fg={accents.amber.fg} bg={accents.amber.bg} />
        <StatCard label="Outages seen" value={String(outages.length)} icon="wifi-off" fg={accents.rose.fg} bg={accents.rose.bg} hint="On this phone" />
      </View>
      <Card title="Server" icon="server">
        <InfoRow label="State" value={up ? 'Running' : 'Away'} tone={up ? 'success' : 'danger'} strong />
        <InfoRow label="Started" value={health.data?.started_at ? new Date(health.data.started_at).toLocaleString() : '—'} />
      </Card>
      <Card title="Optional features" icon="settings">
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={text.body}>AI help for owners</Text>{onOff(Boolean(features?.ai))}</View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={text.body}>Outside app logs</Text>{onOff(REMOTE_LOGS_ON)}</View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={text.body}>Offline copy on phone</Text>{onOff(OFFLINE_CACHE_ON)}</View>
        </View>
      </Card>
      <Card title="Outages" icon="clock">
        {outages.length === 0 ? <Text style={text.muted}>No outages seen on this phone.</Text> : outages.map((outage) => (
          <InfoRow key={outage.startedAt} label={new Date(outage.startedAt).toLocaleTimeString()} value={formatDuration(outage.endedAt - outage.startedAt)} tone="danger" />
        ))}
      </Card>
      <Notice>For a full outage history (even when no phone is open), point a free uptime monitor at /api/health. The README explains how.</Notice>
    </Screen>
  );
}
