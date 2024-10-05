import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import SearchInput from '../../components/SearchInput';
import EmptyState from '../../components/EmptyState';
import { getUserPosts, signOut } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';
import { images, icons } from '../../constants'; // Corrected to combine the imports
import InfoBox from '../../components/InfoBox';
import { router } from 'expo-router';

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext(); // Corrected 'setisLoggedIn' to 'setIsLoggedIn'
  const { data: posts } = useAppwrite(() => getUserPosts(user.$id)); 

  const logout = async () => {
    try {
      await signOut();  // Ensure the signOut process is awaited properly
      setUser(null);
      setIsLogged(false);
  
      // Redirect to sign-in after successful logout
      router.replace('/sign-in');
    } catch (error) {
      // Log the error or display an error message
      console.error("Error during logout:", error);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList 
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard video={item} />
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              className="w-full items-end mb-10"
              onPress={logout}
            >
              <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image source={{ uri: user?.avatar }} className="w-[90%] h-[90%] rounded-lg" resizeMode="cover" />
            </View>
            <InfoBox 
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex-row">
              <InfoBox 
                title={posts?.length || 0}  // Ensuring 'posts' is checked before using '.length'
                subtitle="Posts"
                containerStyles="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox 
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              />
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
};

export default Profile;
