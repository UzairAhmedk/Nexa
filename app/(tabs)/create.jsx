import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images, icons } from '../../constants'; // Corrected to combine the imports

import { Image } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import FormField from '../../components/FormField';

import CustomButton from '../../components/CustomButton';
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router';
import { createVideoPost } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider'


const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    post: null,  // Changed from video to post
    thumbnail: null,
    description: ''
  })
  
  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality: 1,
    });

    if(!result.canceled) {
      if (selectType === 'image') {
        setForm({ ...form, thumbnail: result.assets[0] })
      }
      if (selectType === 'video') {
        setForm({ ...form, post: result.assets[0] })  // Changed from video to post
      }
    } 
  }

  const submit = async () => {
    if(!form.description || !form.title || !form.post || !form.thumbnail) {
      return Alert.alert('please fill in all fields')
    }

    setUploading(true)

    try {
      await createVideoPost({
        ...form, 
        accountid: user.$id  // Make sure user ID is passed correctly
      });

      Alert.alert('Success', 'Post Uploaded')
      router.push('/home')
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        title: '',
        post: null,  // Changed from video to post
        thumbnail: null,
        description: ''
      })

      setUploading(false);
    }
  }
  
  return (
   <SafeAreaView className="bg-primary h-full">
    <ScrollView className="px-4 my-6">
      <Text className="text-2xl text-white font-psemibold" >
        Create A Post!
      </Text>

      <FormField
      title="Post Title"
      value={form.title}
      placeholder="Give Your Post A Catchy Title"
      handleChangeText={(e) => setForm({ ...form, title: e })}
      otherStyles= "mt-10"
      />

      <View className="mt-7 space-y-2">
        <Text className="text-base text-gray-100 font-pmedium">
          Upload Post (Video)
        </Text>

        <TouchableOpacity onPress={() => openPicker('video')}>
          {form.post ? (  // Changed from video to post
            <Video 
              source={ { uri: form.post.uri} }  // Changed from video to post
              className="w-full h-64 rounded-2xl"
              resizeMode={ResizeMode.COVER}
            />
          ) : (
            <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
              <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                <Image source={icons.upload} resizeMode="contain" className="w-1/2 h-1/2"/>
              </View>
            </View>
          )}
        </TouchableOpacity>

      </View>

      <View className="mt-7 space-y-2">
      <Text className="text-base text-gray-100 font-pmedium">
          Upload Thumbnail
        </Text>


        <TouchableOpacity onPress={() => openPicker('image')}>
          {form.thumbnail ? (
            <Image 
            source= {{ uri: form.thumbnail.uri}}
            resizeMode="cover"
            className="w-full h-64 rounded-2xl"
            />
          ) : (
            <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2"> 
                <Image source={icons.upload} resizeMode="contain" className="w-5 h-5"/>
                <Text className="text-sm text-gray-100 font-pmedium"> Choose A File </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FormField
      title="Post Description"
      value={form.description}
      placeholder="Give Your Post A Catchy Description"
      handleChangeText={(e) => setForm({ ...form, description: e })}
      otherStyles= "mt-7"
      />

      <CustomButton 
      title="Submit & Publish"
      handlePress={submit}
      containerStyles="mt-7"
      isLoading={uploading}
      />
    </ScrollView>
   </SafeAreaView>
  )
}

export default Create