import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Badge, Button, Card, Field, Loading, Notice, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';
import { colors, radius, space, text } from '@/theme/theme';

interface StoreRequestData {
  id: string;
  name: string;
  slug: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  store_description?: string;
  business_address?: string;
}

export default function StoreRequestScreen() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery<{ request: StoreRequestData | null }>({
    queryKey: ['my-store-request'],
    queryFn: () => api<{ request: StoreRequestData | null }>('/customers/store-request')
  });

  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [zip, setZip] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      api('/customers/store-request', {
        method: 'POST',
        body: {
          store_name: storeName.trim(),
          slug: slug.trim().toLowerCase(),
          store_description: description.trim(),
          business_address: {
            street: street.trim(),
            city: city.trim(),
            state: 'State',
            zip: zip.trim()
          },
          id_proof: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          business_proof: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
        }
      }),
    onSuccess: () => {
      toast('Store request submitted successfully!', 'success');
      void queryClient.invalidateQueries({ queryKey: ['my-store-request'] });
    },
    onError: (err) => toast(errorMessage(err, 'Could not submit request'), 'error')
  });

  if (isLoading) return <Loading />;

  const request = data?.request;

  if (request) {
    const tone = request.status === 'active' ? 'success' : request.status === 'pending' ? 'warning' : 'danger';
    const statusLabel = request.status === 'active' ? 'Approved & Live' : request.status === 'pending' ? 'Pending Review' : 'Rejected';

    return (
      <Screen>
        <Card title="Store Creation Request" icon="store">
          <View style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={text.heading}>{request.name}</Text>
              <Badge tone={tone} label={statusLabel} />
            </View>

            <Text style={text.small}>Shop link: <Text style={{ fontWeight: '700', color: colors.primary }}>/{request.slug}</Text></Text>

            {request.status === 'pending' && (
              <Notice tone="warning" icon="clock">
                Your request has been submitted and is waiting for review by the platform administrator. You will be able to access your store dashboard once approved.
              </Notice>
            )}

            {request.status === 'active' && (
              <Notice tone="success" icon="check-circle">
                Congratulations! Your store request has been approved. You can now sign in as a store owner.
              </Notice>
            )}

            {request.status === 'rejected' && (
              <Notice tone="danger" icon="alert-circle">
                Your store request was not approved. Please contact support for more details.
              </Notice>
            )}
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Notice tone="primary" icon="sparkles">
        Ready to sell on EasyCart? Submit your store details below and our team will review your application.
      </Notice>

      <Card title="Store Details" icon="store">
        <Field
          label="Store Name *"
          placeholder="e.g. Green Leaf Organics"
          value={storeName}
          onChangeText={(val) => {
            setStoreName(val);
            if (!slug) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
          }}
        />

        <Field
          label="Store URL slug *"
          placeholder="e.g. green-leaf-organics"
          value={slug}
          onChangeText={setSlug}
          autoCapitalize="none"
        />

        <Field
          label="Description"
          placeholder="What do you sell?"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </Card>

      <Card title="Business Location" icon="map-pin">
        <Field
          label="Street address *"
          placeholder="Building name, street"
          value={street}
          onChangeText={setStreet}
        />

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Field
              label="City *"
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Pincode *"
              placeholder="6-digit pincode"
              value={zip}
              onChangeText={setZip}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </Card>

      <Button
        label="Submit Store Request"
        icon="send"
        loading={submit.isPending}
        disabled={!storeName.trim() || !slug.trim() || !street.trim() || !city.trim() || !zip.trim()}
        onPress={() => submit.mutate()}
      />
    </Screen>
  );
}
