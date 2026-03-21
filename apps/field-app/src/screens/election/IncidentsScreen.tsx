import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getCurrentLocation } from '@services/gps';
import { getDatabase } from '@database';
import useAuthStore from '@stores/authStore';

const INCIDENT_TYPES = [
  { id: 'violence', label: 'Violence', icon: 'alert-circle' },
  { id: 'ballot_snatching', label: 'Ballot Snatching', icon: 'hand-left' },
  { id: 'bribery', label: 'Vote Buying/Bribery', icon: 'cash' },
  { id: 'accreditation_issue', label: 'Accreditation Issue', icon: 'card' },
  { id: 'materials_shortage', label: 'Materials Shortage', icon: 'cube' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', color: '#00FF00' },
  { id: 'medium', label: 'Medium', color: '#FFFF00' },
  { id: 'high', label: 'High', color: '#FFA500' },
  { id: 'critical', label: 'Critical', color: '#FF0000' },
];

const IncidentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { puId } = route.params as { puId?: string };
  const { user } = useAuthStore();

  const [selectedType, setSelectedType] = useState('other');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the incident');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location
      const location = await getCurrentLocation();

      const db = getDatabase();
      await db.write(async () => {
        await db.get('election_day_incidents').create((record: any) => {
          record.pollingUnitId = puId || null;
          record.monitorId = user?.id;
          record.incidentType = selectedType;
          record.severity = severity;
          record.description = description;
          record.latitude = location.latitude;
          record.longitude = location.longitude;
          record.evidenceIds = '[]';
          record.status = 'reported';
          record.createdAt = new Date();
          record.updatedAt = new Date();
          record.syncStatus = 'pending';
        });
      });

      Alert.alert(
        'Incident Reported',
        'Your report has been saved and will be synced.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to report incident');
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
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Incident Type</Text>
        <View style={styles.typeGrid}>
          {INCIDENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedType === type.id && styles.typeButtonActive,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={selectedType === type.id ? '#000000' : '#D4AF37'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === type.id && styles.typeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Severity</Text>
        <View style={styles.severityRow}>
          {SEVERITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.severityButton,
                severity === level.id && {
                  borderColor: level.color,
                  backgroundColor: `${level.color}20`,
                },
              ]}
              onPress={() => setSeverity(level.id)}
            >
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: level.color },
                ]}
              />
              <Text
                style={[
                  styles.severityText,
                  severity === level.id && { color: level.color },
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what happened..."
          placeholderTextColor="#666666"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => navigation.navigate('EvidenceCapture', { puId, evidenceType: 'incident' })}
        >
          <Ionicons name="camera" size={20} color="#D4AF37" />
          <Text style={styles.photoButtonText}>Capture Evidence Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    width: '48%',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  typeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  severityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
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

export default IncidentsScreen;
