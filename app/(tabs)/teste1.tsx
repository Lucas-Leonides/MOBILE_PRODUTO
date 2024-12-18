import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, TextInput, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Teste1Screen() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLatestProduct = async () => {
    try {
      const response = await axios.get('http://192.168.0.110:3000/produtos');
      if (response.data.length > 0) {
        setProduct(response.data[response.data.length - 1]);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestProduct();
  }, []);

  const handlePickImageFromGallery = async () => {
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (galleryStatus !== 'granted') {
      alert('Permissões para a galeria são necessárias!');
      return;
    }

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

  const handlePickImageFromCamera = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraStatus !== 'granted') {
      alert('Permissões para a câmera são necessárias!');
      return;
    }

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
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append('name', name);
      formData.append('description', description);
      formData.append('quantity', quantity);

      if (image) {
        const filename = image.split('/').pop();
        const filetype = filename.split('.').pop();
        formData.append('image', {
          uri: image,
          name: filename,
          type: `image/${filetype}`,
        });
      }

      if (product?._id) {
        await axios.put(`http://192.168.0.110:3000/produtos/${product._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const response = await axios.post('http://192.168.0.110:3000/produtos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProduct(response.data);
      }

      resetForm();
      fetchLatestProduct();
    } catch (error) {
      console.error('Erro ao enviar dados do produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setQuantity(product.quantity.toString());
      setImage(product.imageUrl);
    }
  };

  const handleDelete = async () => {
    try {
      if (product?._id) {
        await axios.delete(`http://192.168.0.110:3000/produtos/${product._id}`);
        setProduct(null);
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setQuantity('');
    setImage(null);
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
        Gerenciar Produto
      </ThemedText>

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
        <TextInput
          style={styles.input}
          placeholder="Quantidade"
          placeholderTextColor="#888"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImageFromGallery}>
            <ThemedText style={styles.imagePickerText}>Selecionar Imagem da Galeria</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImageFromCamera}>
            <ThemedText style={styles.imagePickerText}>Tirar Foto com a Câmera</ThemedText>
          </TouchableOpacity>
        </View>

        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        <Button
          title={isSubmitting ? 'Enviando...' : 'Enviar'}
          onPress={handleSubmit}
          color="#477ed1"
          disabled={isSubmitting}
        />
      </View>

      {product && (
        <View style={styles.productContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <ThemedText style={styles.productName}>{product.name}</ThemedText>
            <ThemedText style={styles.productDescription}>{product.description}</ThemedText>
            <ThemedText style={styles.productQuantity}>Quantidade: {product.quantity}</ThemedText>
          </View>
          <View style={styles.buttonRow}>
            <Button title="Editar" onPress={handleEdit} color="#5bc0de" />
            <Button title="Excluir" onPress={handleDelete} color="#d9534f" />
          </View>
        </View>
      )}
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
    color: '#333',
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
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
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
  productContainer: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 200,
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  productInfo: {
    marginBottom: 15,
    alignItems: 'center',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
    marginTop: 10,
  },
});
