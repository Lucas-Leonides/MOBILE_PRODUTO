import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function EditDeleteProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://192.168.0.110:3000/produtos');
      const filteredProducts = response.data
        .filter((product) => product.quantity === 2)  // Filtrando produtos com quantidade 2
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('quantity', 2);  // Quantidade fixada em 2

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
        // Atualizando um produto existente
        await axios.put(`http://192.168.0.110:3000/produtos/${selectedProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Adicionando um novo produto
        await axios.post('http://192.168.0.110:3000/produtos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao enviar dados do produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImage(null);
    setSelectedProductId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://192.168.0.110:3000/produtos/${id}`);
      fetchProducts(); // Recarrega os produtos após a exclusão
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product); // Armazenar o produto clicado no estado
    setIsModalVisible(true); // Abrir o modal com as informações do produto
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productContainer}>
      <TouchableOpacity onPress={() => handleProductClick(item)}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      </TouchableOpacity>
      <ThemedText style={styles.productName}>{item.name}</ThemedText>
      <ThemedText style={styles.productQuantity}>Quantidade: {item.quantity}</ThemedText>
      <ThemedText style={styles.productDate}>Adicionado em: {formatDate(item.dateAdded)}</ThemedText>
      <ThemedText style={styles.productDescription}>{item.description}</ThemedText>
      <View style={styles.actionsContainer}>
        <Button title="Editar" onPress={() => { setName(item.name); setDescription(item.description); setSelectedProductId(item._id); setShowForm(true); }} />
        <Button title="Excluir" onPress={() => handleDelete(item._id)} color="red" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Gerenciar Produtos (Quantidade 2)</ThemedText>

      <View style={styles.buttonContainer}>
        <Button title="Atualizar Lista" onPress={handleRefresh} color="#477ed1" />
        <View style={styles.spacer} />
        <Button title={showForm ? "Fechar Formulário" : "Adicionar Novo Produto"} onPress={() => setShowForm(!showForm)} color="#683ba8" />
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <ThemedText style={styles.imagePickerText}>{image ? 'Imagem Selecionada' : 'Selecionar Imagem da Galeria'}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imagePicker} onPress={handleTakePhoto}>
            <ThemedText style={styles.imagePickerText}>{image ? 'Imagem da Câmera Selecionada' : 'Tirar Foto com a Câmera'}</ThemedText>
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

          <Button
            title={selectedProductId ? 'Atualizar Produto' : 'Adicionar Produto'}
            onPress={handleSubmit}
            color="#683ba8"
            disabled={isSubmitting}
          />
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
      />

      {selectedProduct && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedProduct.imageUrl }} style={styles.modalImage} />
              <ThemedText style={styles.modalText}>Nome: {selectedProduct.name}</ThemedText>
              <ThemedText style={styles.modalText}>Descrição: {selectedProduct.description}</ThemedText>
              <ThemedText style={styles.modalText}>Quantidade: {selectedProduct.quantity}</ThemedText>
              <ThemedText style={styles.modalText}>Adicionado em: {formatDate(selectedProduct.dateAdded)}</ThemedText>
              <Button title="Fechar" onPress={() => setIsModalVisible(false)} color="#683ba8" />
            </View>
          </View>
        </Modal>
      )}
    </ThemedView>
  );
}


const styles = StyleSheet.create({
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
