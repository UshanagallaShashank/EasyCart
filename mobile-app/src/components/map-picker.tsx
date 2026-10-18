// A map the customer can tap or drag a pin on. It is an OpenStreetMap (Leaflet) page inside a WebView
// (or an iframe when the app runs in a web browser), so it needs no map account, API key or billing. Nearby shops show as blue dots.
import { createElement, useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { colors, radius } from '@/theme/theme';
import type { Coords } from '@/lib/location';
import { forScript } from '@/lib/script-safe';

export interface MapShop { name: string; latitude: number; longitude: number; distance_km: number }

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
  var message = JSON.stringify({ latitude: point.lat, longitude: point.lng });
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
  else window.parent.postMessage(message, '*');
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
    return <WebMap html={html} onPick={onPick} height={height} />;
  }

  return (
    <View style={[styles.box, { height }]}>
      <WebView source={{ html }} originWhitelist={['*']} onMessage={onMessage} javaScriptEnabled domStorageEnabled style={styles.web} />
    </View>
  );
}

// In a web browser there is no WebView, so the same map page runs in an iframe and sends the pin back with postMessage.
function WebMap({ html, onPick, height }: { html: string; onPick(coords: Coords): void; height: number }) {
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (typeof event.data !== 'string') return;
      try {
        const point = JSON.parse(event.data) as Coords;
        if (typeof point.latitude === 'number' && typeof point.longitude === 'number') onPick(point);
      } catch {
        // Not a message from our map page: ignore it.
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onPick]);

  return (
    <View style={[styles.box, { height }]}>
      {createElement('iframe', { srcDoc: html, title: 'Map', style: { border: 0, width: '100%', height: '100%' } })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.borderSoft },
  web: { flex: 1, backgroundColor: colors.borderSoft }
});
