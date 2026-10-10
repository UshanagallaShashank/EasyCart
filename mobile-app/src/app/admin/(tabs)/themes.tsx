// The platform admin decides which colour themes shop owners may pick, and which one shops use by default.
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/text';
import { Badge, Button, Card, Loading, Notice, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';
import { useThemeSettings } from '@/lib/brand';
import { BRANDS, THEME_IDS, type ThemeId } from '@/theme/brands';
import { colors, radius, space, text } from '@/theme/theme';

export default function AdminThemes() {
  const settings = useThemeSettings();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [enabled, setEnabled] = useState<ThemeId[]>([]);
  const [chosenDefault, setChosenDefault] = useState<ThemeId>('sky');

  useEffect(() => {
    if (!settings.data) return;
    setEnabled(settings.data.enabled);
    setChosenDefault(settings.data.default);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => api('/admin/themes', { method: 'PUT', body: { enabled, default: chosenDefault } }),
    onSuccess: () => { toast('Themes saved', 'success'); void queryClient.invalidateQueries({ queryKey: ['themes'] }); },
    onError: (err) => toast(errorMessage(err), 'error')
  });

  if (settings.isLoading) return <Loading />;

  function toggle(id: ThemeId, on: boolean) {
    if (!on && enabled.length === 1) { toast('Keep at least one theme switched on', 'error'); return; }
    const next = on ? [...enabled, id] : enabled.filter((item) => item !== id);
    setEnabled(next);
    // The default must stay one of the switched-on themes.
    if (!next.includes(chosenDefault)) setChosenDefault(next[0]);
  }

  return (
    <Screen footer={<Button icon="save" label="Save themes" onPress={() => save.mutate()} loading={save.isPending} />}>
      <Notice icon="info">Owners pick their shop's colours from the themes switched on here. Shops that have not picked one use the default.</Notice>
      <Card>
        {THEME_IDS.map((id) => {
          const brand = BRANDS[id];
          const on = enabled.includes(id);
          return (
            <View key={id} style={styles.row}>
              <LinearGradient colors={brand.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.swatch} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={text.heading}>{brand.name}</Text>
                {chosenDefault === id ? <Badge tone="primary" label="Default" /> : on ? <Button small variant="ghost" label="Make default" onPress={() => setChosenDefault(id)} /> : <Text style={text.small}>Off</Text>}
              </View>
              <Switch value={on} onValueChange={(value) => toggle(id, value)} trackColor={{ true: brand.primary, false: colors.border }} />
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  swatch: { width: 40, height: 40, borderRadius: radius.md }
});
