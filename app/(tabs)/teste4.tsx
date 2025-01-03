import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, TextInput, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Importando o ícone do menu
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function EditDeleteProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(''); // Adicionando estado para a quantidade
  const [image, setImage] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantityGroups, setQuantityGroups] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Controlando a visibilidade do menu

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://crud-aps.onrender.com/produtos');
      const sortedProducts = response.data
        .filter((product) => product.quantity)
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

      setProducts(sortedProducts);
      groupByQuantity(sortedProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByQuantity = (products) => {
    const groups = products.reduce((acc, product) => {
      const quantity = product.quantity;
      if (!acc[quantity]) {
        acc[quantity] = [];
      }
      acc[quantity].push(product);
      return acc;
    }, {});

    setQuantityGroups(Object.keys(groups));
    setFilteredProducts(products);  // Exibe todos os produtos por padrão
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('quantity', quantity); // Enviando a quantidade no formulário

      if (image) {
        const filename = image.split('/').pop();
        const filetype = filename.split('.').pop();
        formData.append('image', {
          uri: image,
          name: filename,
          type: `image/${filetype}`,
        });
      }

      if (selectedProductId) {
        await axios.put(`https://crud-aps.onrender.com/produtos/${selectedProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('https://crud-aps.onrender.com/produtos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao enviar dados do produto:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setQuantity(''); // Resetando o valor da quantidade
    setImage(null);
    setSelectedProductId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://crud-aps.onrender.com/produtos/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleImagePress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productContainer}>
      <TouchableOpacity onPress={() => handleImagePress(item)}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      </TouchableOpacity>
      <ThemedText style={styles.productName}>{item.name}</ThemedText>
      <ThemedText style={styles.productQuantity}>Quantidade: {item.quantity}</ThemedText>
      <ThemedText style={styles.productDate}>
        Adicionado em: {new Date(item.dateAdded).toLocaleString()}
      </ThemedText>
      <View style={styles.actionsContainer}>
        <Button
          title="Editar"
          onPress={() => {
            setName(item.name);
            setDescription(item.description);
            setQuantity(item.quantity.toString()); // Preenchendo o campo de quantidade com o valor atual
            setSelectedProductId(item._id);
            setShowForm(true);
          }}
        />
        <Button title="Excluir" onPress={() => handleDelete(item._id)} color="red" />
      </View>
    </View>
  );

  const handleGroupClick = (quantity) => {
    const filtered = products.filter(product => product.quantity === parseInt(quantity));
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Edição geral
      </ThemedText>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsMenuVisible(!isMenuVisible)} // Alterna visibilidade do menu
      >
        <Ionicons name="menu" size={32} color="#477ed1" />
      </TouchableOpacity>

      {isMenuVisible && ( // Menu visível apenas quando clicado
        <View style={styles.headerButtons}>
          <Button
            title="Voltar para Todos"
            onPress={() => setFilteredProducts(products)}
            color="#4CAF50"
          />
          {quantityGroups.map((quantity) => (
            <Button
              key={quantity}
              title={`Lista ${quantity}`}
              onPress={() => handleGroupClick(quantity)}
              color="#477ed1"
            />
          ))}
        </View>
      )}

      <View style={styles.spacer} />

      <View style={styles.headerButtons}>
        <Button
          title={showForm ? "Fechar Formulário" : "Adicionar Novo Produto"}
          onPress={() => setShowForm(!showForm)}
          color={showForm ? "#eb4034" : "#683ba8"}
        />
        <View style={styles.spacer} />
        <Button
          title="Atualizar Página"
          onPress={fetchProducts}
          color="#4CAF50"
        />
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity} // Adicionando o campo de quantidade
          />
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <ThemedText style={styles.imagePickerText}>
              {image ? 'Imagem Selecionada' : 'Selecionar Imagem da Galeria'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imagePicker} onPress={handleTakePhoto}>
            <ThemedText style={styles.imagePickerText}>
              {image ? 'Imagem da Câmera Selecionada' : 'Tirar Foto com a Câmera'}
            </ThemedText>
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

          <Button
            title={selectedProductId ? 'Atualizar Produto' : 'Adicionar Produto'}
            onPress={handleSubmit}
            color="#683ba8"
          />
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        style={styles.list}
      />

      {selectedProduct && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedProduct.imageUrl }} style={styles.modalImage} />
              <ThemedText style={styles.modalText}>Nome: {selectedProduct.name}</ThemedText>

              {/* ScrollView para a descrição */}
              <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.modalText}>Descrição: {selectedProduct.description}</ThemedText>
              </ScrollView>

              <ThemedText style={styles.modalText}>Quantidade: {selectedProduct.quantity}</ThemedText>
              <ThemedText style={styles.modalText}>
                Adicionado em: {new Date(selectedProduct.dateAdded).toLocaleString()}
              </ThemedText>

              {/* Botão de fechar com posição fixa */}
              <View style={styles.closeButtonContainer}>
                <Button title="Fechar" onPress={() => setModalVisible(false)} color="#683ba8" />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  
  scrollView: {
    maxHeight: 200,  // Defina um tamanho máximo para a área rolável
    marginBottom: 40, // Espaço entre a descrição e o botão
  },
  closeButtonContainer: {
    position: 'absolute',
    bottom: -20, // Ajuste para garantir que o botão fique abaixo do conteúdo
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  spacer: {
    height: 10,
  },
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  imagePicker: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#333',
    fontSize: 16,
  },
  imagePreview: {
    width: 250,
    height: 250,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  list: {
    marginTop: 20,
  },
  productContainer: {
    marginBottom: 20,
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 250,
    height: 250,
    marginBottom: 10,
    borderRadius: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productQuantity: {
    fontSize: 16,
    color: '#666',
  },
  productDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
});