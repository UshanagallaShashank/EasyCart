// Add or edit one product: photo, name, price, description, stock, category and whether shoppers can see it.
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Button, Card, Field, Loading, Notice, Pills, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { productCalls, useOwnCategories, useOwnerProducts, useRefreshingAction, type ProductForm } from '@/features/owner/owner-api';
import { pickPhotos } from '@/lib/device';
import { errorMessage, fileUrl } from '@/lib/api';
import { colors, radius, space, text } from '@/theme/theme';

export default function OwnerProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const products = useOwnerProducts();
  const categories = useOwnCategories();
  const toast = useToast();
  const create = useRefreshingAction(productCalls.create, ['products']);
  const update = useRefreshingAction(productCalls.update, ['products']);
  const remove = useRefreshingAction(productCalls.remove, ['products']);
  const existing = isNew ? undefined : products.data?.find((product) => product.id === id);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: string;
    sku: string;
    stock: string;
    threshold: string;
    categoryId: string;
    active: boolean;
    images: string[];
  }>({
    name: '',
    description: '',
    price: '',
    sku: '',
    stock: '0',
    threshold: '5',
    categoryId: '',
    active: true,
    images: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      description: existing.description ?? '',
      price: String(existing.price),
      sku: '',
      stock: String(existing.stock_quantity),
      threshold: String(existing.low_stock_threshold),
      categoryId: existing.category_id ?? '',
      active: existing.is_active,
      images: existing.images ?? []
    });
  }, [existing]);

  if (!isNew && products.isLoading) return <Loading />;
  if (!isNew && !existing) return <Screen><Notice tone="warning" icon="alert-circle">This product could not be found. It may have been removed.</Notice></Screen>;

  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function pickImage(source: 'camera' | 'library') {
    try {
      const photos = await pickPhotos(source);
      if (!photos.length) return;
      setIsUploading(true);
      const newUrls: string[] = [];
      for (const photo of photos) {
        try {
          const { url } = await productCalls.uploadImage(photo);
          newUrls.push(url);
        } catch (err) {
          console.error('Failed to upload image', err);
        }
      }
      if (newUrls.length > 0) {
        setForm((current) => ({ ...current, images: [...current.images, ...newUrls] }));
        toast(`${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} added`, 'success');
      }
    } catch (error) {
      toast(errorMessage(error, 'Could not add the photo'), 'error');
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(indexToRemove: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, idx) => idx !== indexToRemove)
    }));
  }

  function setCoverImage(indexToPromote: number) {
    if (indexToPromote === 0) return;
    setForm((current) => {
      const target = current.images[indexToPromote];
      const rest = current.images.filter((_, idx) => idx !== indexToPromote);
      return { ...current, images: [target, ...rest] };
    });
    toast('Cover photo updated', 'success');
  }

  function buildPayload(): ProductForm | null {
    const price = Number(form.price);
    const stock = Number(form.stock);
    const threshold = Number(form.threshold);
    if (form.name.trim().length < 2) { toast('Give the product a name', 'error'); return null; }
    if (Number.isNaN(price) || price <= 0) { toast('Enter a price above 0', 'error'); return null; }
    if (!Number.isInteger(stock) || stock < 0) { toast('Stock must be a whole number, 0 or more', 'error'); return null; }
    if (!Number.isInteger(threshold) || threshold < 0) { toast('Low-stock alert must be a whole number, 0 or more', 'error'); return null; }
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      ...(isNew && form.sku.trim() ? { sku: form.sku.trim() } : {}),
      images: form.images,
      ...(form.categoryId ? { category_id: form.categoryId } : {}),
      stock_quantity: stock,
      low_stock_threshold: threshold,
      is_active: form.active
    };
  }

  function save() {
    const payload = buildPayload();
    if (!payload) return;
    const done = { onSuccess: () => { toast(isNew ? 'Product added' : 'Product saved', 'success'); router.back(); }, onError: (e: unknown) => toast(errorMessage(e), 'error') };
    if (isNew) create.mutate(payload, done);
    else update.mutate({ id: id!, payload }, done);
  }

  function askOrDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    remove.mutate(id!, { onSuccess: () => { toast('Product removed', 'success'); router.back(); }, onError: (e) => toast(errorMessage(e), 'error') });
  }

  const busy = create.isPending || update.isPending;

  return (
    <Screen footer={<Button icon="save" label={isNew ? 'Add product' : 'Save changes'} onPress={save} loading={busy} />}>
      <Stack.Screen options={{ title: isNew ? 'New product' : 'Edit product' }} />

      <Card title={`Photos (${form.images.length})`} icon="image">
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: -4 }}>
          First photo is the cover photo on the home page. Customers will see all photos like in Flipkart.
        </Text>

        {form.images.length > 0 ? (
          <View style={{ gap: space.sm }}>
            <View style={styles.imageGrid}>
              {form.images.map((imgUri, index) => {
                const uri = fileUrl(imgUri);
                const isCover = index === 0;
                return (
                  <View
                    key={`${imgUri}-${index}`}
                    style={[
                      styles.imageItem,
                      isCover && { borderColor: colors.primary, borderWidth: 2 }
                    ]}
                  >
                    {uri ? (
                      <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                    ) : (
                      <Icon name="image" size={24} color={colors.textFaint} />
                    )}

                    {isCover && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverBadgeText}>Cover</Text>
                      </View>
                    )}

                    <Pressable
                      onPress={() => removeImage(index)}
                      hitSlop={8}
                      style={styles.deleteBtn}
                      accessibilityLabel="Remove photo"
                    >
                      <Icon name="trash-2" size={13} color="#ffffff" />
                    </Pressable>

                    {!isCover && (
                      <Pressable
                        onPress={() => setCoverImage(index)}
                        style={styles.setCoverBtn}
                        accessibilityLabel="Set as cover photo"
                      >
                        <Text style={styles.setCoverText}>Set cover</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyPhoto}>
            <Icon name="image" size={32} color={colors.textFaint} />
            <Text style={text.small}>No photos yet</Text>
            <Text style={{ fontSize: 11, color: colors.textFaint }}>Add multiple photos for your product</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              icon="image"
              label={isUploading ? 'Uploading…' : 'Add photos'}
              loading={isUploading}
              onPress={() => void pickImage('library')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant="outline"
              icon="camera"
              label="Take photo"
              disabled={isUploading}
              onPress={() => void pickImage('camera')}
            />
          </View>
        </View>
      </Card>

      <Card title="Details" icon="package">
        <Field label="Product name" value={form.name} onChangeText={set('name')} placeholder="e.g. Dove Beauty Moisture Bar" />
        <Field label="Price (Rs.)" value={form.price} onChangeText={set('price')} keyboardType="decimal-pad" placeholder="0.00" />
        <Field label="Description (optional)" value={form.description} onChangeText={set('description')} multiline placeholder="What makes it special?" />
        {isNew && <Field label="SKU (optional)" hint="Your own product code" value={form.sku} onChangeText={set('sku')} autoCapitalize="characters" placeholder="e.g. SOAP-100" />}
      </Card>

      <Card title="Stock" icon="box">
        <Field label="In stock" value={form.stock} onChangeText={set('stock')} keyboardType="number-pad" placeholder="0" />
        <Field label="Low-stock alert at" hint="You are warned when stock falls to this number" value={form.threshold} onChangeText={set('threshold')} keyboardType="number-pad" placeholder="5" />
      </Card>

      {(categories.data?.length ?? 0) > 0 && (
        <Card title="Category" icon="tags">
          <Pills options={[{ value: '', label: 'None' }, ...categories.data!.map((category) => ({ value: category.id, label: category.name }))]} value={form.categoryId} onChange={set('categoryId')} />
        </Card>
      )}

      <Card title="Visibility" icon="eye">
        <Pills<'on' | 'off'> options={[{ value: 'on', label: 'Visible to shoppers' }, { value: 'off', label: 'Hidden' }]} value={form.active ? 'on' : 'off'} onChange={(value) => setForm((current) => ({ ...current, active: value === 'on' }))} />
      </Card>

      {!isNew && <Button variant={confirmDelete ? 'danger' : 'outline'} icon="trash-2" label={confirmDelete ? 'Tap again to remove this product' : 'Remove product'} onPress={askOrDelete} loading={remove.isPending} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyPhoto: { height: 130, borderRadius: radius.md, backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageItem: { width: 96, height: 96, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.white, borderWidth: 1, borderColor: '#e2e8f0', position: 'relative' },
  thumbImage: { width: '100%', height: '100%' },
  coverBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  coverBadgeText: { fontSize: 9, fontWeight: '800', color: colors.white },
  deleteBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(239, 68, 68, 0.9)', alignItems: 'center', justifyContent: 'center' },
  setCoverBtn: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingVertical: 3, alignItems: 'center' },
  setCoverText: { fontSize: 9, fontWeight: '700', color: colors.white }
});
