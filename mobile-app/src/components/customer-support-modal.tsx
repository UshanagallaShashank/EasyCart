import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { colors, radius, shadow, space } from '@/theme/theme';

interface CustomerSupportModalProps {
  visible: boolean;
  onClose(): void;
}

const FAQS = [
  {
    q: 'Where is my order?',
    a: 'You can track live delivery progress directly under My Orders in your account.'
  },
  {
    q: 'How do cancellations & refunds work?',
    a: 'Orders can be cancelled before the rider departs. Refunds are processed back to your original payment method in 2–4 hours.'
  },
  {
    q: 'Damaged or missing items?',
    a: 'Call or email us with your order ID and a photo; our support team will issue an instant replacement or refund.'
  }
];

export function CustomerSupportModal({ visible, onClose }: CustomerSupportModalProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  function handleCall() {
    void Linking.openURL('tel:18001234567');
  }

  function handleEmail() {
    void Linking.openURL('mailto:support@easycart.com?subject=EasyCart%20Customer%20Support');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Title Section */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Icon name="headphones" size={26} color="#0284c7" />
              </View>
              <Text style={styles.title}>Customer Support</Text>
              <Text style={styles.subtitle}>
                We're always here to help you with your groceries and deliveries.
              </Text>
              <View style={styles.pill}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>24/7 Live Assistance Available</Text>
              </View>
            </View>

            {/* Direct Contact Buttons */}
            <View style={styles.contactSection}>
              <Pressable
                onPress={handleCall}
                style={({ pressed }) => [styles.contactCard, pressed && styles.cardPressed]}
              >
                <View style={[styles.contactIconWrap, { backgroundColor: '#ecfdf5' }]}>
                  <Icon name="phone" size={20} color="#059669" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Call Helpline</Text>
                  <Text style={styles.contactValue}>1800 123 4567</Text>
                  <Text style={styles.contactMeta}>Toll-free • Available 24/7</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#94a3b8" />
              </Pressable>

              <Pressable
                onPress={handleEmail}
                style={({ pressed }) => [styles.contactCard, pressed && styles.cardPressed]}
              >
                <View style={[styles.contactIconWrap, { backgroundColor: '#e0f2fe' }]}>
                  <Icon name="mail" size={20} color="#0284c7" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email Us</Text>
                  <Text style={styles.contactValue}>support@easycart.com</Text>
                  <Text style={styles.contactMeta}>Quick reply within 15 mins</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#94a3b8" />
              </Pressable>
            </View>

            {/* Quick FAQs */}
            <View style={styles.faqSection}>
              <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
              {FAQS.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <Pressable
                    key={faq.q}
                    onPress={() => setExpandedFaq(isOpen ? null : index)}
                    style={styles.faqCard}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQ}>{faq.q}</Text>
                      <Icon
                        name={isOpen ? 'chevron-down' : 'chevron-right'}
                        size={16}
                        color="#64748b"
                      />
                    </View>
                    {isOpen && <Text style={styles.faqA}>{faq.a}</Text>}
                  </Pressable>
                );
              })}
            </View>

            {/* Close Button */}
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end'
  },
  dismissOverlay: {
    flex: 1
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
    ...shadow
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 10
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1'
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 10
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a'
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d'
  },
  contactSection: {
    gap: 10,
    marginBottom: 20
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14
  },
  cardPressed: {
    backgroundColor: '#f8fafc'
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactInfo: {
    flex: 1,
    gap: 2
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  contactMeta: {
    fontSize: 12,
    color: '#94a3b8'
  },
  faqSection: {
    marginBottom: 20,
    gap: 8
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4
  },
  faqCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 6
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    paddingRight: 8
  },
  faqA: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569'
  }
});
