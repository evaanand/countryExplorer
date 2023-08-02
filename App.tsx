/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect,useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View, TextInput, Button, FlatList, ActivityIndicator,
  Image,
  TouchableOpacity
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { SvgUri } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheApiResponse = async (key: string, data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.log('Error caching API response:', error);
  }
};

const getCachedApiResponse = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.log('Error retrieving cached API response:', error);
    return null;
  }
};
function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState(null);
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    loadFavourites();
  }, [favourites]);

  const loadFavourites = async () => {
    try {
      const storedFavourites = await AsyncStorage.getItem('favourites');
      if (storedFavourites !== null) {
        setFavourites(JSON.parse(storedFavourites));
      }
    } catch (error) {
      console.log('Error loading favourites:', error);
    }
  };

  const saveFavourites = async (favourite:string[]) => {
    try {
      await AsyncStorage.setItem('favourites', JSON.stringify(favourite));
    } catch (error) {
      console.log('Error saving favourites:', error);
    }
  };

  const addToFavourites = (name: string) => {
    let fav = [...favourites, name];
    saveFavourites(fav)
  };

  const removeFromFavourites = (name: string) => {
    let updatedFavourites = favourites.filter((item) => item !== name);
    saveFavourites(updatedFavourites);
  };

  const handleSearch = async () => {
    const cacheKey = searchText.trim()
    const cachedData = await getCachedApiResponse(searchText);
    if (cachedData) {
      // Use cached data
      setCountries(cachedData);
    } else {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${cacheKey}?fullText=true`
      );
      const data = await response.json();
      console.log(data[0])
      if(data&&data.length>0){
        setCountries(data[0])
        cacheApiResponse(cacheKey, data[0]);
      }else{
        setCountries(null);
      }
    } catch (error) {
      console.error(error);
    }
  }
  };

  const milesToKms = (miles: number): number => {
    const kilometers = Math.round(miles * 1.60934);
    return kilometers;
  };

  return (

    
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Country Explorer
      </Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        onChangeText={setSearchText}
        value={searchText}
        placeholder="Enter country name"
      />
      <Button title="Search" onPress={handleSearch} />
      {countries && <View style={{ marginVertical: 10 }}>
      <SvgUri
        width="100%"
        height={150}
        uri={countries.flags.svg}
        />
          <Text>Name: {countries.name.common}</Text>
          <Text>Capital: {countries.capital}</Text>
          <Text>Population: {countries.population}</Text>
          <Text>Area: {countries.area} sq mi</Text>
          <Text>Area: {milesToKms(countries.area)} sq km</Text>
          <Text>Languages: {Object.values(countries.languages).join(', ')}</Text>
          <Text>Timezones: {Object.values(countries.timezones).join(', ')}</Text>
          <Text>Currency: {Object.values(countries.currencies)[0].name} ({Object.values(countries.currencies)[0].symbol})</Text>
          <View style={{ marginVertical: 10 }}>
          {favourites.includes(countries.name.common)? <Button title="Remove Favourite" onPress={()=>removeFromFavourites(countries.name.common)} />:<Button title="Add as Favourite" onPress={()=>addToFavourites(countries.name.common)} />}
    </View>
    </View>}
    <View style={{paddingVertical:10}}>
      <Text>Favourites:</Text>
      <FlatList
        data={favourites}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ marginVertical: 6 }} onPress={()=>setSearchText(item)}>
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
