import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  SpotDetail: { spotId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SpotDetail'>;

const SportSharingScreen = () => {
  const spots = [
    { id: '1', name: '茅ヶ崎サザンビーチ', area: '神奈川県', image: 'https://via.placeholder.com/80' },
    { id: '2', name: '湘南海岸', area: '神奈川県', image: 'https://via.placeholder.com/80' },
    { id: '3', name: '江ノ島', area: '神奈川県', image: 'https://via.placeholder.com/80' },
    { id: '4', name: '鵠沼海岸', area: '神奈川県', image: 'https://via.placeholder.com/80' },
    { id: '5', name: '千葉サーフポイント', area: '千葉県', image: 'https://via.placeholder.com/80' },
    { id: '6', name: '伊良湖ビーチ', area: '愛知県', image: 'https://via.placeholder.com/80' },
    { id: '7', name: '千葉北サーフポイント', area: '千葉県', image: 'https://via.placeholder.com/80' },
  ];

  const regions = [
    'すべて', '東北', '北海道', '茨城', '千葉北', '千葉南', '湘南', '西湘',
    '伊豆', '静岡', '伊良湖', '和歌山', '四国', '九州', '日本海', 'アイランド'
  ];

  const rankingSpots = [
    { id: '1', name: '茅ヶ崎サザンビーチ', rank: 1, image: 'https://via.placeholder.com/80' },
    { id: '2', name: '湘南海岸', rank: 2, image: 'https://via.placeholder.com/80' },
    { id: '3', name: '江ノ島', rank: 3, image: 'https://via.placeholder.com/80' },
    { id: '4', name: '鵠沼海岸', rank: 4, image: 'https://via.placeholder.com/80' },
    { id: '5', name: '千葉サーフポイント', rank: 5, image: 'https://via.placeholder.com/80' },
  ];

  const [searchText, setSearchText] = useState('');
  const [filteredSpots, setFilteredSpots] = useState(spots);
  const [selectedRegion, setSelectedRegion] = useState('');

  const navigation = useNavigation<NavigationProp>();

  const handleRegionSelect = (region: any) => {
    setSelectedRegion(region);
    if (region === 'すべて') {
      setFilteredSpots(spots);
    } else {
      const filtered = spots.filter((spot) => spot.name.includes(region));
      setFilteredSpots(filtered);
    }
  };

  const handleSearch = (text: any) => {
    setSearchText(text);
    const filtered = spots.filter((spot) =>
      spot.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSpots(filtered);
  };

  const renderItem = ({ item }: { item: any }) => (
    item ? (
      <TouchableOpacity
        style={styles.spotCard}
        onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}  // スポットIDを渡して遷移
      >
        <Image source={{ uri: item.image || 'fallback-image-url' }} style={styles.spotImage} />
        <View style={styles.textContainer}>
          <Text style={styles.spotName}>{item.name}</Text>
          <Text style={styles.spotArea}>エリア: {item.area}</Text>
        </View>
      </TouchableOpacity>
    ) : null
  );

  const renderRegion = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.regionButton, selectedRegion === item && styles.selectedRegionButton]}
      onPress={() => handleRegionSelect(item)}
    >
      <Text style={styles.regionButtonText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderRankingItem = ({ item }: { item: any }) => (
    <View style={styles.rankCard}>
      <Text style={styles.rankText}>{item.rank}位</Text>
      <Image source={{ uri: item.image }} style={styles.rankImage} />
      <Text style={styles.rankName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="サーフスポットを検索"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* 今週の人気スポットランキング */}
      <Text style={styles.sectionTitle}>今週の人気スポットランキング</Text>
      <FlatList
        data={rankingSpots}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rankList}
      />

      {/* 地域リストの表示 */}
      <View style={styles.regionContainer}>
        <FlatList
          data={regions}
          renderItem={renderRegion}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionList}
        />
      </View>

      {/* 検索結果のリスト */}
      <FlatList
        data={filteredSpots}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noResultsText}>該当するスポットがありません</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  searchInput: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 30,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  regionContainer: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  regionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedRegionButton: {
    backgroundColor: '#0056b3',
  },
  regionButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  spotCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  spotArea: {
    fontSize: 14,
    color: '#888',
  },
  noResultsText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rankCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  rankImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  rankName: {
    fontSize: 16,
    color: '#333',
  },
  rankList: {
    marginBottom: 16,
  },
});

export default SportSharingScreen;
