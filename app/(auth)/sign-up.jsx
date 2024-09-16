import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { createUser } from '../../lib/appwrite';
import 'react-native-url-polyfill/auto';
import { useGlobalContext } from '../../context/GlobalProvider';

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.userName || !form.email || !form.password) {
      return Alert.alert('Error', 'Please fill all the fields');
    }

    setIsSubmitting(true);

    try {
      console.log('CREATING USER');

      const res = createUser(form.email, form.password, form.userName);

      setIsLoggedIn(true);
      setUser(res);
      router.replace('/home');
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView>
        <View className='w-full justify-center min-h-[80vh] px-4 my-6'>
          <Image
            source={images.logo}
            resizeMode='contain'
            className='w-[115px] h-[35px]'
          />
          <Text className='text-2xl text-white text-semibold mt-10 font-psemibold mb-2'>
            Log in to Aora
          </Text>

          <FormField
            title='Username'
            value={form.userName}
            handleChangeText={(e) => setForm({ ...form, userName: e })}
            otherStyles='mt-4'
          />

          <FormField
            title='Email'
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles='mt-4'
            keyboardType='email-address'
          />

          <FormField
            title='Password'
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles='mt-4'
          />

          <CustomButton
            title='Sign up'
            handlePress={submit}
            containerStyles='mt-10'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-gray-100'>
              Have an account already?
            </Text>
            <Link
              href={'/sign-in'}
              className='text-lg font-psemibold text-secondary-100'
            >
              Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
