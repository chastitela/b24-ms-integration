import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const PRODUCTS = [
  { id: '1', name: 'Эклер', price: 120 },
  { id: '2', name: 'Макарон', price: 90 },
  { id: '3', name: 'Чизкейк', price: 150 },
];

export default function App() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => alert(`Добавлено: ${item.name}`)}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price} ₽</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Кондитерская</Text>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontSize: 18,
  },
  price: {
    fontSize: 16,
    color: '#666',
  },
});
