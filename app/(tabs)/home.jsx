import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { images } from '../../constants';
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { useMemo, useState } from 'react';
import useAppwrite from '../../hooks/useAppwrite';
import { getAllPosts, getLatestPosts } from '../../lib/appwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';

const Home = () => {
  const { user } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: posts,
    refetch,
    isLoading,
  } = useAppwrite(() => getAllPosts(user.$id));
  const { data: latestPosts } = useAppwrite(getLatestPosts);

  const insets = useSafeAreaInsets();

  const onRefreshing = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView
      className='h-full bg-primary'
      style={{ paddingBottom: -insets.bottom }}
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className='my-6 px-4 space-y-6'>
            <View className='justify-between items-start flex-row mb-6'>
              <View>
                <Text className='font-pmedium text-sm text-gray-100'>
                  Welcome back
                </Text>
                <Text className='text-2xl font-psemibold text-white'>
                  Benjamin
                </Text>
              </View>
              <View className='mt-1.5'>
                <Image
                  source={images.logoSmall}
                  className='w-9 h-10'
                  resizeMode='contain'
                />
              </View>
            </View>

            <SearchInput />

            <View className='w-full flex-1 pt-2 pb-8'>
              <Text className='text-gray-100 text-lg font-pregular mb-3'>
                Latest Videos
              </Text>
              <Trending posts={latestPosts ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() =>
          isLoading ? (
            <ActivityIndicator animating={true} color='#fff' />
          ) : (
            <EmptyState
              title='No videos found'
              subtitle='Be the first to upload a video'
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefreshing}
            colors={'#fff'} // for android
            tintColor={'#fff'} // for ios
          />
        }
      />
    </SafeAreaView>
  );
};

export default Home;
