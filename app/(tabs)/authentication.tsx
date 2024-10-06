import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, useColorScheme, Dimensions, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { loginUser, registerUser } from '@/app/services/authentication';
import { user } from '@/app/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AuthenticationScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState<user>({
    email: '',
    password: '',
    nombre: '',
    rol: 'student',
  });
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const response = await loginUser(userData);
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userId', response.userId);
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
        await AsyncStorage.setItem('userName', response.nombre);
        await AsyncStorage.setItem('userRole', response.rol);
        Alert.alert('Success', 'Login successful!');
      } else {
        const response = await registerUser(userData);
        await AsyncStorage.setItem('userId', response.id);
        await AsyncStorage.setItem('userEmail', response.email);
        await AsyncStorage.setItem('userName', response.nombre);
        await AsyncStorage.setItem('userRole', response.rol);
        Alert.alert('Success', 'Registration successful!');
      }
      router.replace('/');
    } catch (error) {
      console.error(`${isLogin ? 'Login' : 'Registration'} failed:`, error);
      Alert.alert('Error', `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
    }
  };

  const isDarkMode = colorScheme === 'dark';

  const themeStyles = {
    text: isDarkMode ? styles.lightText : styles.darkText,
    input: isDarkMode ? styles.darkInput : styles.lightInput,
    picker: isDarkMode ? styles.darkPicker : styles.lightPicker,
    pickerItem: isDarkMode ? 'white' : 'black',
    container: isDarkMode ? styles.darkContainer : styles.lightContainer,
  };

  const textStyle = { color: colorScheme === 'dark' ? 'white' : 'black' };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={textStyle}>
        {isLogin ? 'Login' : 'Register'}
      </ThemedText>
      <TextInput
        style={[styles.input, themeStyles.input]}
        placeholder="Email"
        placeholderTextColor={isDarkMode ? '#A0A0A0' : '#707070'}
        value={userData.email}
        onChangeText={(text) => setUserData({ ...userData, email: text })}
      />
      <TextInput
        style={[styles.input, themeStyles.input]}
        placeholder="Password"
        placeholderTextColor={isDarkMode ? '#A0A0A0' : '#707070'}
        secureTextEntry
        value={userData.password}
        onChangeText={(text) => setUserData({ ...userData, password: text })}
      />
      {!isLogin && (
        <>
          <TextInput
            style={[styles.input, themeStyles.input]}
            placeholder="Name"
            placeholderTextColor={isDarkMode ? '#A0A0A0' : '#707070'}
            value={userData.nombre}
            onChangeText={(text) => setUserData({ ...userData, nombre: text })}
          />
          <View style={[styles.pickerContainer, themeStyles.input]}>
            <Picker
              selectedValue={userData.rol}
              style={[styles.picker, themeStyles.picker]}
              onValueChange={(itemValue: 'student' | 'teacher') => setUserData({ ...userData, rol: itemValue })}
              /* dropdownIconColor={themeStyles.pickerItem} */
            >
              <Picker.Item label="Student" value="student"  />
              <Picker.Item label="Teacher" value="teacher"  />
            </Picker>
          </View>
        </>
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <ThemedText style={styles.submitButtonText}>
          {isLogin ? 'Login' : 'Register'}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <ThemedText style={textStyle}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  lightContainer: {
    backgroundColor: '#F5F5F5',
  },
  darkContainer: {
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  lightInput: {
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    color: 'black',
  },
  darkInput: {
    backgroundColor: '#2C2C2C',
    borderColor: '#505050',
    color: 'white',
  },
  pickerContainer: {
    marginBottom: 15,
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  lightPicker: {
    backgroundColor: 'white',
    color: 'black',
  },
  darkPicker: {
    backgroundColor: '#2C2C2C',
    color: 'white',
  },
  submitButton: {
    backgroundColor: 'rgb(29, 61, 71)',
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lightText: {
    color: 'black',
  },
  darkText: {
    color: 'white',
  },
});