import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lightTheme, darkTheme } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import AddCarScreen from './src/screens/AddCarScreen';
import CarDetailScreen from './src/screens/CarDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { CollectionProvider } from './src/context/CollectionContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';

const Stack = createNativeStackNavigator();

const MainApp = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme as any}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddCar" component={AddCarScreen} />
          <Stack.Screen name="CarDetail" component={CarDetailScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <CollectionProvider>
          <MainApp />
        </CollectionProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

export default App;
