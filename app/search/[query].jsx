import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import SearchInput from '../../components/SearchInput';
import EmptyState from '../../components/EmptyState';
import { useEffect } from 'react';
import useAppwrite from '../../hooks/useAppwrite';
import { searchPosts } from '../../lib/appwrite';
import VideoCard from '../../components/VideoCard';
import { useLocalSearchParams } from 'expo-router';

const Search = () => {
  const { query } = useLocalSearchParams();
  const {
    data: posts,
    refetch,
    isLoading,
  } = useAppwrite(() => searchPosts(query));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    refetch();
  }, [query]);

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
          <View className='my-6 px-4'>
            <Text className='font-pmedium text-sm text-gray-100'>
              Search Results
            </Text>
            <Text className='text-2xl font-psemibold text-white'>{query}</Text>
            <View className='mt-6 mb-8'>
              <SearchInput initialQuery={query} />
            </View>
          </View>
        )}
        ListEmptyComponent={() =>
          isLoading ? (
            <ActivityIndicator animating={true} color='#fff' />
          ) : (
            <EmptyState
              title='No videos found'
              subtitle='No videos found for this search'
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Search;
