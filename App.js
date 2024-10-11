import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { getResources, getResourceById, addResource, updateResource, deleteResource } from './mockapi';

export default function App() {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [searchId, setSearchId] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await getResources();
      setResources(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchById = async () => {
    if (!searchId) return;
    try {
      const response = await getResourceById(searchId);
      setResources([response.data]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddResource = async () => {
    if (!title || !description || !url) return;
    const newResource = { title, description, url };
    try {
      await addResource(newResource);
      fetchResources();
      clearForm();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditResource = async () => {
    if (!editId || !title || !description || !url) return;
    const updatedResource = { title, description, url };
    try {
      await updateResource(editId, updatedResource);
      fetchResources();
      clearForm();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await deleteResource(id);
      fetchResources();
    } catch (error) {
      console.log(error);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setEditId(null);
  };

  const handleSelectResourceForEdit = (resource) => {
    setTitle(resource.title);
    setDescription(resource.description);
    setUrl(resource.url);
    setEditId(resource.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista de Recursos de Aprendizaje</Text>

      <TextInput
        placeholder="Buscar por ID"
        style={styles.input}
        value={searchId}
        onChangeText={setSearchId}
      />
      <Button title="Buscar" onPress={handleSearchById} />

      <TextInput
        placeholder="Título"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Descripción"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        placeholder="URL"
        style={styles.input}
        value={url}
        onChangeText={setUrl}
      />

      <Button
        title={editId ? 'Actualizar Recurso' : 'Agregar Recurso'}
        onPress={editId ? handleEditResource : handleAddResource}
      />

      <FlatList
        data={resources}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.resourceItem}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.url}</Text>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => handleSelectResourceForEdit(item)} />
              <Button title="Eliminar" onPress={() => handleDeleteResource(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 10,
    borderRadius: 5,
  },
  resourceItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});
