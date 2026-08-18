import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

type ShelterPoint = { name: string; lat: number; lng: number };

export default function MapViewScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { startLat, startLng, shelters, title, startLabel } = useLocalSearchParams<{
        startLat?: string; startLng?: string; shelters?: string; title?: string; startLabel?: string;
    }>();

    const sLat = Number(startLat);
    const sLng = Number(startLng);
    const shelterList: ShelterPoint[] = shelters ? JSON.parse(shelters) : [];
    const screenTitle = title ?? (shelterList.length === 1 ? shelterList[0].name : '주변 대피소');

    const shelterMarkersJs = shelterList
        .map((s, i) => {
            const safeName = s.name.replace(/'/g, "\\'");
            return `
    L.marker([${s.lat}, ${s.lng}], { icon: shelterIcon })
      .addTo(map)
      .bindTooltip('${safeName}', { permanent: true, direction: 'bottom', offset: [0, 2], className: 'map-label' })
      .bindPopup('<div style="text-align:center;"><b>${safeName}</b><br/><button onclick="showRoute(${s.lat},${s.lng})" style="margin-top:6px;background:#3D8BF5;color:white;border:none;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;">도착</button></div>');`;
        })
        .join('\n');

    const boundsPoints = [[sLat, sLng], ...shelterList.map((s) => [s.lat, s.lng])];

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    .map-label {
      background: rgba(0,0,0,0.75);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: none;
    }
    .map-label::before { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var startIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;background:#3D8BF5;border:3px solid white;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.4);"></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    var shelterIcon = L.divIcon({
      html: '<div style="width:30px;height:30px;background:#3D8BF5;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 4px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:15px;">🏠</span></div>',
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    var startLat = ${sLat};
    var startLng = ${sLng};
    var routeLayer = null;

    var routeInfoControl = L.control({ position: 'bottomleft' });
    routeInfoControl.onAdd = function () {
      var div = L.DomUtil.create('div', 'route-info');
      div.style.display = 'none';
      return div;
    };
    routeInfoControl.addTo(map);

    function showRoute(destLat, destLng) {
      map.closePopup();
      var url = 'https://router.project-osrm.org/route/v1/foot/' + startLng + ',' + startLat + ';' + destLng + ',' + destLat + '?overview=full&geometries=geojson';
      fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (routeLayer) { map.removeLayer(routeLayer); }
          if (data.code !== 'Ok') { return; }
          var route = data.routes[0];
          routeLayer = L.geoJSON(route.geometry, { style: { color: '#3D8BF5', weight: 5, opacity: 0.85 } }).addTo(map);
          map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
          var km = (route.distance / 1000);
          var mins = Math.round((km / 4) * 60);
          var el = routeInfoControl.getContainer();
          el.style.display = 'block';
          el.style.background = 'rgba(0,0,0,0.75)';
          el.style.color = 'white';
          el.style.padding = '8px 12px';
          el.style.borderRadius = '10px';
          el.style.fontSize = '13px';
          el.style.fontWeight = '700';
          el.innerHTML = '🚶 도보 약 ' + mins + '분 · ' + km.toFixed(1) + 'km';
        })
        .catch(function (e) { console.log('route error', e); });
    }

    L.marker([${sLat}, ${sLng}], { icon: startIcon })
      .addTo(map)
      .bindTooltip('${(startLabel ?? '현재 위치').replace(/'/g, "\\'")}', { permanent: true, direction: 'bottom', offset: [0, 4], className: 'map-label' });
    ${shelterMarkersJs}

    var bounds = L.latLngBounds(${JSON.stringify(boundsPoints)});
    map.fitBounds(bounds, { padding: [40, 40] });
  </script>
</body>
</html>
`;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.backButton}>‹ 이전</Text>
                    </Pressable>
                    <Text style={styles.title}>{screenTitle}</Text>
                </View>
            </SafeAreaView>
            <View style={[styles.webviewWrapper, { paddingBottom: insets.bottom }]}>
                <WebView originWhitelist={['*']} source={{ html }} style={styles.webview} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safeArea: { backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: 20, paddingVertical: 12,
    },
    backButton: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
    title: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
    webviewWrapper: { flex: 1, backgroundColor: colors.background },
    webview: { flex: 1 },
});
