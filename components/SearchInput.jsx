import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { icons } from '../constants';
import { usePathname, useRouter } from 'expo-router';

const SearchInput = ({ initialQuery }) => {
    const pathname = usePathname();  
    const router = useRouter(); // Importing and using the router
    const [query, setQuery] = useState(initialQuery || '');

    return (
      <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary-100 flex-row items-center pb-5">
        <TextInput 
          className="text-white text-base mt-4 flex-1 font-pregular"
          value={query}
          placeholder="Search For Photography Ideas"
          placeholderTextColor="#CDCDE0"
          onChangeText={(e) => setQuery(e)}
        />
        
        <TouchableOpacity
        onPress={() => {
          if (!query) {
            return Alert.alert('Missing Query', "Input something else to search results across database");
          }
          if(pathname.startsWith('/search')) {
            router.setParams({ query });
          } else {
            router.push(`/search/${query}`);
          }
        }}
        >
            <Image 
            source={icons.search}
            className="mt-4 w-5 h-5"
            resizeMode='contain' // Corrected typo here
            />
        </TouchableOpacity>
      </View>
  );
}

export default SearchInput;
