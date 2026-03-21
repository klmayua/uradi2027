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
import { SafeAreaView } from 'react-native-safe-area-safe-area-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import apiService from '@services/api';
import { getDatabase } from '@database';
import useAuthStore from '@stores/authStore';

const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00'];
const QUEUE_OPTIONS = [
  { value: 'short', label: 'Short (<10 people)' },
  { value: 'medium', label: 'Medium (10-30)' },
  { value: 'long', label: 'Long (>30)' },
];

const AccreditationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { puId } = route.params as { puId?: string };
  const { user } = useAuthStore();

  const [selectedSlot, setSelectedSlot] = useState('10:00');
  const [accreditedCount, setAccreditedCount] = useState('');
  const [bvasFunctional, setBvasFunctional] = useState(true);
  const [queueLength, setQueueLength] = useState('medium');
  const [issues, setIssues] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!accreditedCount || !puId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save locally first
      const db = getDatabase();
      await db.write(async () => {
        await db.get('accreditation_records').create((record: any) => {
          record.pollingUnitId = puId;
          record.monitorId = user?.id;
          record.timeSlot = selectedSlot;
          record.accreditedCount = parseInt(accreditedCount);
          record.bvasFunctional = bvasFunctional;
          record.queueLength = queueLength;
          record.issues = issues ? [issues] : [];
          record.createdAt = new Date();
          record.updatedAt = new Date();
          record.syncStatus = 'pending';
        });
      });

      // Try to sync immediately
      try {
        await apiService.submitAccreditation({
          polling_unit_id: puId,
          time_slot: selectedSlot,
          accredited_count: parseInt(accreditedCount),
          bvas_functional: bvasFunctional,
          queue_length: queueLength,
          issues: issues ? [issues] : [],
        });
      } catch {
        // Will sync later
      }

      Alert.alert('Success', 'Accreditation report saved', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save accreditation report');
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
        <Text style={styles.headerTitle}>Accreditation Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Time Slot</Text>
          <View style={styles.timeSlots}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlot,
                  selectedSlot === slot && styles.timeSlotActive,
                ]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedSlot === slot && styles.timeSlotTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Accredited Voters</Text>
          <TextInput
            style={styles.input}
            value={accreditedCount}
            onChangeText={setAccreditedCount}
            placeholder="Enter number of accredited voters"
            placeholderTextColor="#666666"
            keyboardType="number-pad"
          />

          <Text style={styles.sectionTitle}>BVAS Status</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>BVAS Functioning</Text>
            <Switch
              value={bvasFunctional}
              onValueChange={setBvasFunctional}
              trackColor={{ false: '#333333', true: '#D4AF37' }}
              thumbColor={bvasFunctional ? '#FFFFFF' : '#666666'}
            />
          </View>

          <Text style={styles.sectionTitle}>Queue Length</Text>
          <View style={styles.queueOptions}>
            {QUEUE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.queueOption,
                  queueLength === option.value && styles.queueOptionActive,
                ]}
                onPress={() => setQueueLength(option.value)}
              >
                <Text
                  style={[
                    styles.queueOptionText,
                    queueLength === option.value && styles.queueOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Issues (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={issues}
            onChangeText={setIssues}
            placeholder="Describe any issues..."
            placeholderTextColor="#666666"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Submit Report'}
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
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  timeSlotActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timeSlotText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  timeSlotTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  queueOptions: {
    gap: 8,
  },
  queueOption: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  queueOptionActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  queueOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  queueOptionTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccreditationScreen;
