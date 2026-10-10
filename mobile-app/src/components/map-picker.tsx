// A map the customer can tap or drag a pin on. It is an OpenStreetMap (Leaflet) page inside a WebView,
// so it needs no map account, API key or billing. Nearby shops show as blue dots.
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Text } from './text';
import { colors, radius, text } from '@/theme/theme';
import type { Coords } from '@/lib/location';

export interface MapShop { name: string; latitude: number; longitude: number; distance_km: number }

// Safe to place inside a <script>: a "<" in a shop name can never close the script early.
function forScript(value: unknown): string {
  return JSON.stringify(value).split('<').join('\\u003c');
}

function buildHtml(center: Coords, shops: MapShop[]): string {
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var center = ${forScript([center.latitude, center.longitude])};
var shops = ${forScript(shops)};
var map = L.map('map').setView(center, 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
shops.forEach(function (shop) {
  var label = document.createElement('span');
  label.textContent = shop.name + ' (' + shop.distance_km + ' km)';
  L.circleMarker([shop.latitude, shop.longitude], { radius: 9, color: '#0369a1', fillColor: '#0ea5e9', fillOpacity: 0.9, weight: 2 }).addTo(map).bindTooltip(label);
});
var pin = L.marker(center, { draggable: true }).addTo(map);
function tell(point) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: point.lat, longitude: point.lng }));
}
pin.on('dragend', function () { tell(pin.getLatLng()); });
map.on('click', function (event) { pin.setLatLng(event.latlng); tell(event.latlng); });
</script></body></html>`;
}

export function MapPicker({ center, shops = [], onPick, height = 280 }: { center: Coords; shops?: MapShop[]; onPick(coords: Coords): void; height?: number }) {
  // The page is rebuilt only when the starting point or the shops change, so dragging the pin never reloads the map.
  const shopKey = shops.map((shop) => `${shop.name}${shop.latitude}${shop.longitude}`).join('|');
  const html = useMemo(() => buildHtml(center, shops), [center.latitude, center.longitude, shopKey]);

  function onMessage(event: WebViewMessageEvent) {
    try {
      const point = JSON.parse(event.nativeEvent.data) as Coords;
      if (typeof point.latitude === 'number' && typeof point.longitude === 'number') onPick(point);
    } catch {
      // Not a message from our map page: ignore it.
    }
  }

  if (Platform.OS === 'web') {
    return <View style={[styles.box, styles.fallback, { height }]}><Text style={text.muted}>The map works in the phone app.</Text></View>;
  }

  return (
    <View style={[styles.box, { height }]}>
      <WebView source={{ html }} originWhitelist={['*']} onMessage={onMessage} javaScriptEnabled domStorageEnabled style={styles.web} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.borderSoft },
  web: { flex: 1, backgroundColor: colors.borderSoft },
  fallback: { alignItems: 'center', justifyContent: 'center' }
});
