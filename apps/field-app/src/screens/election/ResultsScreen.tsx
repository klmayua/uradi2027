import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getDatabase } from '@database';
import useAuthStore from '@stores/authStore';

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { puId } = route.params as { puId?: string };
  const { user } = useAuthStore();

  const [parties, setParties] = useState([
    { name: 'APC', votes: '', isIncumbent: false },
    { name: 'PDP', votes: '', isIncumbent: false },
    { name: 'NNPP', votes: '', isIncumbent: false },
    { name: 'Other', votes: '', isIncumbent: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateVotes = (index: number, votes: string) => {
    const updated = [...parties];
    updated[index].votes = votes;
    setParties(updated);
  };

  const toggleIncumbent = (index: number) => {
    const updated = [...parties];
    updated[index].isIncumbent = !updated[index].isIncumbent;
    setParties(updated);
  };

  const handleSubmit = async () => {
    if (!puId) {
      Alert.alert('Error', 'Polling unit not found');
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getDatabase();

      await db.write(async () => {
        for (const party of parties) {
          if (party.votes) {
            await db.get('vote_tallies').create((record: any) => {
              record.pollingUnitId = puId;
              record.monitorId = user?.id;
              record.candidateName = party.name;
              record.party = party.name;
              record.votesReceived = parseInt(party.votes) || 0;
              record.isIncumbent = party.isIncumbent;
              record.verified = false;
              record.createdAt = new Date();
              record.updatedAt = new Date();
              record.syncStatus = 'pending';
            });
          }
        }
      });

      Alert.alert('Success', 'Results saved. They will be synced when you are online.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save results');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vote Tally</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.instructions}>
          Enter the vote counts for each party. Include a photo of the result sheet for verification.
        </Text>

        {parties.map((party, index) => (
          <View key={party.name} style={styles.card}>
            <View style={styles.partyHeader}>
              <Text style={styles.partyName}>{party.name}</Text>
              <View style={styles.incumbentRow}>
                <Text style={styles.incumbentLabel}>Incumbent</Text>
                <Switch
                  value={party.isIncumbent}
                  onValueChange={() => toggleIncumbent(index)}
                  trackColor={{ false: '#333333', true: '#D4AF37' }}
                  thumbColor={party.isIncumbent ? '#FFFFFF' : '#666666'}
                />
              </View>
            </View>

            <TextInput
              style={styles.input}
              value={party.votes}
              onChangeText={(text) => updateVotes(index, text)}
              placeholder="Enter vote count"
              placeholderTextColor="#666666"
              keyboardType="number-pad"
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => navigation.navigate('EvidenceCapture', { puId, evidenceType: 'result' })}
        >
          <Ionicons name="camera" size={20} color="#D4AF37" />
          <Text style={styles.photoButtonText}>Capture Result Sheet Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Submit Results'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  partyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  incumbentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incumbentLabel: {
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultsScreen;
