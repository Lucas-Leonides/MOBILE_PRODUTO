import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
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

  // Função para buscar e ordenar produtos por data e quantidade
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://192.168.0.110:3000/produtos');
      
      // Ordena por data (decrescente) e, dentro dos mesmos produtos com a mesma data, ordena por quantidade (crescente)
      const sortedProducts = response.data
        .filter((product) => product.quantity) // Filtra produtos com quantidade
        .sort((a, b) => {
          if (new Date(b.dateAdded) !== new Date(a.dateAdded)) {
            return new Date(b.dateAdded) - new Date(a.dateAdded); // Ordena por data (decrescente)
          } else {
            return a.quantity - b.quantity; // Ordena por quantidade (crescente)
          }
        });
      
      setProducts(sortedProducts);
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

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('quantity', 2); // Quantidade fixada em 2

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <ThemedText>{item.name}</ThemedText>
      <ThemedText>Quantidade: {item.quantity}</ThemedText>
      <ThemedText style={styles.dateAdded}>Adicionado em: {formatDate(item.dateAdded)}</ThemedText>
      <View style={styles.actionsContainer}>
        <Button title="Editar" onPress={() => { setName(item.name); setDescription(item.description); setSelectedProductId(item._id); }} />
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

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#333"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          placeholderTextColor="#333"
          value={description}
          onChangeText={setDescription}
        />
        
        {/* O campo "Quantidade" não será exibido mais */}
        
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          <ThemedText style={styles.imagePickerText}>{image ? 'Imagem Selecionada' : 'Selecionar Imagem'}</ThemedText>
        </TouchableOpacity>
        
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
        
        <Button title={selectedProductId ? 'Atualizar Produto' : 'Adicionar Produto'} onPress={handleSubmit} color="#683ba8" />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#f7f7f7',
    color: '#333',  // Maior contraste para o campo Nome
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
    width: 150,
    height: 150,
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
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
  },
  dateAdded: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
});
