import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

type SpotDetailsType = {
  [key: string]: {
    name: string;
    area: string;
    description: string;
    image: string;
    waveCondition: string;
    windDirection: string;
    waveDirection: string;
    locationDescription: string;
    crowd: string;
  };
};

type RouteParams = {
  SpotDetail: { spotId: string };
};

const SpotDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'SpotDetail'>>();
  const { spotId } = route.params;

  // ダミーデータ（通常はAPIから取得）
  const spotDetails: SpotDetailsType = {
    '1': {
      name: '茅ヶ崎サザンビーチ',
      area: '神奈川県',
      description: '素晴らしい波が楽しめるサーフスポットです。',
      image: 'https://via.placeholder.com/400',
      waveCondition: '良い',
      windDirection: '南風',
      waveDirection: '東',
      locationDescription: '茅ヶ崎市のビーチエリア。',
      crowd: '混雑',
    },
    '2': {
      name: '湘南海岸',
      area: '神奈川県',
      description: '湘南を代表する人気スポット。',
      image: 'https://via.placeholder.com/400',
      waveCondition: '普通',
      windDirection: '北風',
      waveDirection: '南',
      locationDescription: '湘南エリアの海岸。',
      crowd: '混雑なし',
    },
    // 他のスポットのデータ
  };

  const spot = spotDetails[spotId as keyof SpotDetailsType];

  return (
    <ScrollView style={styles.container}>
      {/* スポット画像 */}
      <Image source={{ uri: spot.image }} style={styles.spotImage} />

      {/* スポット名 */}
      <Text style={styles.spotName}>{spot.name}</Text>
      <Text style={styles.spotArea}>エリア: {spot.area}</Text>

      {/* 波のコンディション */}
      <View style={styles.conditionContainer}>
        <Text style={styles.conditionTitle}>波のコンディション</Text>
        <Text>サイズ: {spot.waveCondition}</Text>
        <Text>風向き: {spot.windDirection}</Text>
        <Text>波の向き: {spot.waveDirection}</Text>
      </View>

      {/* スポットの詳細 */}
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>スポット概要</Text>
        <Text>場所: {spot.locationDescription}</Text>
        <Text>混雑状況: {spot.crowd}</Text>
      </View>

      {/* スポットの説明 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>詳細情報</Text>
        <Text>{spot.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  spotImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  spotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  spotArea: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  conditionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  conditionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  detailContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
});

export default SpotDetailScreen;
