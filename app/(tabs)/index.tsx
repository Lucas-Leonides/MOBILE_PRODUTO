import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/ihalagoupng.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}>Vamos documentar?</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.subtitleText}>
          A entrada geral é o caminho mais detalhado pra documentar um item.
        </ThemedText>
        <ThemedText style={styles.bodyText}>
          As quantidades definem o tipo de produto, 1 eletrônica, 2 montagem, você pode vê-los na parte inferior da tela, se colocar uma quantidade diferente verá na última página restante, onde todas são categorizadas.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.subtitleText}>
          Você pode adicionar a imagem da câmera ou da galeria
        </ThemedText>
        <ThemedText style={styles.bodyText}>
          Se não quiser adicionar foto ou algum campo também fique a vontade. 
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.subtitleText}>
          Eles são organizados por data de inserção
        </ThemedText>
        <ThemedText style={styles.bodyText}>
          Tente deixar a documentação atualizada.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#477ed1',
    borderRadius: 8,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff10',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  reactLogo: {
    height: 250,
    width: '100%',
    resizeMode: 'contain',
    marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f0f0',
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 16,
    color: '#d0d0d0',
    lineHeight: 22,
  },
});