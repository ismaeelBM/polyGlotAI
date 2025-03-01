import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Ultravox AI Voice Assistant</Text>
        <Text style={styles.subtitle}>Real-time voice conversations with AI</Text>
      </View>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Ionicons name="mic-outline" size={32} color="#4a90e2" />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Real-time Voice</Text>
            <Text style={styles.featureDescription}>
              Speak naturally and get instant responses from the AI assistant
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color="#4a90e2" />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Custom System Prompts</Text>
            <Text style={styles.featureDescription}>
              Configure the assistant's personality and knowledge
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="apps-outline" size={32} color="#4a90e2" />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>State Indication</Text>
            <Text style={styles.featureDescription}>
              See when the assistant is listening, thinking, or speaking
            </Text>
          </View>
        </View>
      </View>
      
      <Link 
        href={"/ultravox" as any} 
        asChild
        >
        <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Voice Assistant</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
        </Link>
      
      <Text style={styles.apiNote}>
        You'll need an Ultravox API key to use this app.
        Visit ultravox.ai to sign up.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  apiNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
});