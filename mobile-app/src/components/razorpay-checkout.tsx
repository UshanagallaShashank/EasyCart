// Razorpay's own payment window, shown inside the app. It reports back when the payment succeeds, fails or is closed.
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { forScript } from '@/lib/script-safe';
import { colors } from '@/theme/theme';

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function buildHtml(keyId: string, orderId: string, amount: number) {
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>html, body { height: 100%; margin: 0; background: #f8fafc; }</style>
</head><body>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
function tell(message) { window.ReactNativeWebView.postMessage(JSON.stringify(message)); }
var options = {
  key: ${forScript(keyId)},
  order_id: ${forScript(orderId)},
  amount: ${forScript(amount)},
  currency: 'INR',
  name: 'EasyCart',
  description: 'Order payment',
  theme: { color: '#0284c7' },
  handler: function (result) { tell({ type: 'success', result: result }); },
  modal: { ondismiss: function () { tell({ type: 'dismissed' }); } }
};
var checkout = new Razorpay(options);
checkout.on('payment.failed', function (response) { tell({ type: 'failed', message: response && response.error ? response.error.description : '' }); });
checkout.open();
</script></body></html>`;
}

export function RazorpayCheckout({ keyId, orderId, amount, onSuccess, onFailed, onDismissed }: {
  keyId: string;
  orderId: string;
  amount: number;
  onSuccess(result: RazorpaySuccess): void;
  onFailed(message: string): void;
  onDismissed(): void;
}) {
  const html = useMemo(() => buildHtml(keyId, orderId, amount), [keyId, orderId, amount]);

  function onMessage(event: WebViewMessageEvent) {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type: string; result?: RazorpaySuccess; message?: string };
      if (message.type === 'success' && message.result) onSuccess(message.result);
      else if (message.type === 'failed') onFailed(message.message || 'The payment failed');
      else if (message.type === 'dismissed') onDismissed();
    } catch {
      // Not a message from our payment page: ignore it.
    }
  }

  return (
    <View style={styles.box}>
      <WebView source={{ html, baseUrl: 'https://checkout.razorpay.com' }} originWhitelist={['*']} onMessage={onMessage} javaScriptEnabled domStorageEnabled style={styles.web} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 560, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  web: { flex: 1, backgroundColor: colors.bg }
});
