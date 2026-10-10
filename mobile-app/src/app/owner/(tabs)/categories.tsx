// Product categories: add one, remove one.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Button, Card, EmptyState, Field, Loading, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { useConfirm } from '@/components/confirm';
import { manageCalls, useOwnCategories, useRefreshingAction } from '@/features/owner/owner-api';
import { errorMessage } from '@/lib/api';
import { colors, radius, space } from '@/theme/theme';

export default function OwnerCategories() {
  const { data, isLoading, refetch, isRefetching } = useOwnCategories();
  const create = useRefreshingAction(manageCalls.createCategory, ['categories']);
  const remove = useRefreshingAction(manageCalls.deleteCategory, ['categories']);
  const toast = useToast();
  const [name, setName] = useState('');
  const askConfirm = useConfirm();
  if (isLoading) return <Loading />;

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(trimmed, { onSuccess: () => { setName(''); toast('Category added', 'success'); }, onError: (e) => toast(errorMessage(e), 'error') });
  }

  async function askOrDelete(id: string, name: string) {
    const yes = await askConfirm({ title: `Remove "${name}"?`, message: 'Products in this category are kept, but lose the category.', confirmLabel: 'Remove', cancelLabel: 'Keep it', icon: 'trash-2' });
    if (!yes) return;
    remove.mutate(id, { onSuccess: () => toast('Category removed', 'success'), onError: (e) => toast(errorMessage(e), 'error') });
  }

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Card title="New category" icon="tags">
        <Field value={name} onChangeText={setName} placeholder="e.g. Snacks" onSubmitEditing={add} returnKeyType="done" />
        <Button icon="plus" label="Add category" onPress={add} loading={create.isPending} disabled={!name.trim()} />
      </Card>

      {(data?.length ?? 0) === 0 ? <EmptyState icon="tags" message="No categories yet." /> : data!.map((category) => (
        <View key={category.id} style={styles.row}>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text }} numberOfLines={1}>{category.name}</Text>
          <Button small variant="danger" icon="trash-2" label="Remove" onPress={() => void askOrDelete(category.id, category.name)} loading={remove.isPending && remove.variables === category.id} />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', padding: space.md, paddingLeft: space.lg }
});
