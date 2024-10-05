import { View, Text, FlatList, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import SearchInput from '../../components/SearchInput';
import EmptyState from '../../components/EmptyState';
import { searchPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useLocalSearchParams } from 'expo-router';

const Search = () => {
  const { query } = useLocalSearchParams(); // Correctly invoke useLocalSearchParams()
  const { data: posts, refetch } = useAppwrite(() => searchPosts(query)); // Pass searchPosts(query) as a function
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (query) {
      refetch(); // Refetch data when query changes
    }
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList 
        data={posts}
        keyExtractor={(item) => item.$id} // Ensure item.id is correct
        renderItem={({ item }) => (
          <VideoCard video={item} />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              {query}
            </Text>

            <View className="mt-6 mb-8">
              <SearchInput initialQuery={query} />  
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState 
            title="No Posts Found"
            subtitle="No Videos Found for this search"
          />
        )}
      />
    </SafeAreaView>
  );
}

export default Search;