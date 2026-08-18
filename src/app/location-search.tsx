import { KAKAO_REST_API_KEY } from '@/constants/aiConfig';
import { colors } from '@/constants/colors';
import { LocationTab } from '@/constants/locations';
import { useLocations } from '@/contexts/locations-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SearchResult = {
  id: string;
  addressName: string;
  lat: number;
  lng: number;
};

// 이름 유효성 검사: 비어있거나, 자음/모음만 있는 경우(완성되지 않은 한글) 막기
function isValidName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length === 0) return false;
  if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(trimmed)) return false;
  return true;
}

export default function LocationSearchScreen() {
  const router = useRouter();
  const { addLocation } = useLocations();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [customName, setCustomName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError('');
    setResults([]);
    setLoading(true);
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query.trim())}`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
      );
      const data = await res.json();
      const documents = data.documents ?? [];
      if (documents.length === 0) {
        setError('검색 결과가 없어요. 더 자세한 주소를 입력해보세요');
        return;
      }

      const detailedDocs = documents.filter((doc: any) =>
        doc.road_address?.main_building_no || doc.address?.main_address_no
      );
      if (detailedDocs.length === 0) {
        setError('구/동 단위 말고 더 자세한 주소를 입력해주세요 (예: 도로명+건물번호)');
        return;
      }
      setResults(
        detailedDocs.map((doc: any) => ({
          id: doc.address_name,
          addressName: doc.road_address?.address_name ?? doc.address_name,
          lat: Number(doc.y),
          lng: Number(doc.x),
        }))
      );
    } catch (e) {
      console.log('카카오 주소검색 실패', e);
      setError('검색 중 문제가 생겼어요');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmName = () => {
    if (!selected) return;
    if (!isValidName(customName)) {
      setNameError('이름을 정확히 입력해주세요');
      return;
    }
    const newLocation: LocationTab = {
      id: `${selected.id}-${Date.now()}`,
      type: 'added',
      name: customName.trim(),
      lat: selected.lat,
      lng: selected.lng,
      region: selected.addressName,
      precision: 'address',
    };
    addLocation(newLocation);
    router.back();
  };

  if (selected) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => setSelected(null)}>
              <Text style={styles.backButton}>‹ 이전</Text>
            </Pressable>
          </View>

          <Text style={styles.selectedAddress}>{selected.addressName}</Text>

          <TextInput
            style={styles.input}
            value={customName}
            onChangeText={(text) => { setCustomName(text); setNameError(''); }}
            placeholder="이름 (예: 우리집, 회사, OO네 가게)"
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          {nameError !== '' && <Text style={styles.errorText}>{nameError}</Text>}

          <Pressable style={styles.searchButton} onPress={handleConfirmName}>
            <Text style={styles.searchButtonText}>추가하기</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>‹ 이전</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="상세 주소 검색 (예: 강남구 테헤란로 152)"
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />

        <Pressable style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          <Text style={styles.searchButtonText}>{loading ? '검색 중...' : '검색'}</Text>
        </Pressable>

        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          style={styles.list}
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.resultItem} onPress={() => setSelected(item)}>
              <Text style={styles.resultText}>{item.addressName}</Text>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  header: { marginBottom: 16 },
  backButton: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.accentBlue,
  },
  searchButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 12 },
  list: { marginTop: 16 },
  resultItem: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  resultText: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  selectedAddress: { color: colors.textSecondary, fontSize: 14, marginBottom: 16 },
});