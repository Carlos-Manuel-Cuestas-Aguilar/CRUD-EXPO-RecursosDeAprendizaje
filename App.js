import React, { useState, useEffect, createContext, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, ScrollView, Dimensions, Pressable, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getResources, addResource, updateResource, deleteResource } from './mockapi';

const Tab = createBottomTabNavigator();
const ResourceContext = createContext();

function LibraryScreen() {
  const { resources, fetchResources } = useContext(ResourceContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTitle, setSearchTitle] = useState("");

  const openModal = (resource) => {
    setSelectedResource(resource);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedResource(null);
  };

  const normalizeText = (text) => {
    return text
      .normalize("NFD") // Descompone caracteres especiales como acentos
      .replace(/[\u0300-\u036f]/g, "") // Elimina las marcas de acento
      .toLowerCase(); // Convierte a minúsculas para evitar distinción por mayúsculas
  };

  const filteredResources = resources.filter((item) =>
    normalizeText(item.title).includes(normalizeText(searchTitle))
  );

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth < 600 ? screenWidth / 2 - 20 : screenWidth / 4 - 20;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Biblioteca de Libros</Text>

      <Text style={styles.subHeader}>Buscador:</Text>
      <TextInput
        placeholder="Buscar por título"
        style={styles.input}
        value={searchTitle}
        onChangeText={setSearchTitle}
      />

      <View style={[styles.gridContainer, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }]}>
        {filteredResources.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.card, { width: cardWidth }]} onPress={() => openModal(item)}>
            <Image source={{ uri: item.url }} style={styles.image} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal */}
      {selectedResource && (
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{selectedResource.title}</Text>
              <Text style={styles.modalDescription}>{selectedResource.description}</Text>
              <Text />

              <TouchableOpacity onPress={() => Linking.openURL(selectedResource.source)}>
                <Text style={styles.linkText}>Ir al recurso</Text>
              </TouchableOpacity>

              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  );
}

function CRUDScreen() {
  const { resources, fetchResources, setResources } = useContext(ResourceContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');

  const [searchTitle, setSearchTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const itemsPerPage = 5;

  const handleAddResource = async () => {
    if (!title || !description || !url || !source) return;
    const newResource = { title, description, url, source };
    try {
      await addResource(newResource);
      fetchResources();
      clearForm();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditResource = async () => {
    if (!editId || !title || !description || !url || !source) return;
    const updatedResource = { title, description, url, source };
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

  const handleSelectResourceForEdit = (resource) => {
    setTitle(resource.title);
    setDescription(resource.description);
    setUrl(resource.url);
    setSource(resource.source);
    setEditId(resource.id);
    setIsEditing(true);
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setSource('');
    setEditId(null);
    setIsEditing(false);
  };

  const filteredResources = resources.filter(item =>
    item.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [searchTitle]);

  const paginatedResources = filteredResources.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>CRUD de Libros</Text>

      <View id="1" style={isEditing ? styles.editingMode : null}>
        <Text style={styles.subHeader}>{editId ? 'Editar Libro' : 'Agregar Nuevo Libro'}</Text>
        <TextInput placeholder="Título" style={styles.input} value={title} onChangeText={setTitle} />
        <TextInput placeholder="Descripción" style={styles.input} value={description} onChangeText={setDescription} />
        <TextInput placeholder="URL de la Imagen" style={styles.input} value={url} onChangeText={setUrl} />
        <TextInput placeholder="URL del recurso" style={styles.input} value={source} onChangeText={setSource} />

        {/* Contenedor para los botones */}
        <View style={{ flexDirection: 'column' }}>
          <TouchableOpacity
            style={editId ? styles.updateButton : styles.addButton}
            onPress={editId ? handleEditResource : handleAddResource}
          >
            <Text style={styles.buttonText}>{editId ? 'Actualizar Libro' : 'Agregar Libro'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text/>

      <View style={{ marginVertical: 20 }}>
        <Text style={styles.subHeader}>Buscador:</Text>
        <TextInput placeholder="Buscar por título" style={styles.input} value={searchTitle} onChangeText={setSearchTitle} />
      </View>

      <Text style={styles.subHeader}>Tabla de Libros</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Título</Text>
        <Text style={styles.tableHeaderText}>Acciones</Text>
      </View>

      {paginatedResources.map((item) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={styles.tableText}>{item.title}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editButton} onPress={() => handleSelectResourceForEdit(item)}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteResource(item.id)}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.pagination}>
        <TouchableOpacity style={styles.paginationButton} onPress={handlePreviousPage} disabled={page === 1}>
          <Text style={styles.buttonText}>Anterior</Text>
        </TouchableOpacity>
        <Text>Página {page} de {totalPages}</Text>
        <TouchableOpacity style={styles.paginationButton} onPress={handleNextPage} disabled={page === totalPages}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

}

function ResourceProvider({ children }) {
  const [resources, setResources] = useState([]);

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

  return (
    <ResourceContext.Provider value={{ resources, fetchResources, setResources }}>
      {children}
    </ResourceContext.Provider>
  );
}

export default function App() {
  return (
    <ResourceProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Biblioteca"
            component={LibraryScreen}
            options={{
              tabBarIcon: () => (
                <Image source={require('./assets/logoico.png')} style={{ width: 20, height: 20 }} />
              ),
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="CRUD de Libros"
            component={CRUDScreen}
            options={{
              tabBarIcon: () => (
                <Image source={require('./assets/crud.png')} style={{ width: 20, height: 20 }} />
              ),
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ResourceProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#e8f5e9',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 20,
  },
  subHeader: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#fbc02d',
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#fbc02d',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 5,
    borderRadius: 5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  paginationButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  card: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editingMode: {
    backgroundColor: '#fffde7',
    borderRadius: 5,
    borderColor: '#fbc02d',
    borderWidth: 2,
    padding: 10,
    marginBottom: 10,
  },linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
    marginVertical: 10,
  },
});
