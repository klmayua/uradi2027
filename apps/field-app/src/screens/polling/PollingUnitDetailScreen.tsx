import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDatabase } from '@database';

const PollingUnitDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { puId } = route.params as { puId: string };
  const [pollingUnit, setPollingUnit] = useState<any>(null);
  const [stats, setStats] = useState({
    evidenceCount: 0,
    accreditationCount: 0,
    incidentCount: 0,
  });

  useEffect(() => {
    loadPollingUnit();
  }, [puId]);

  const loadPollingUnit = async () => {
    const db = getDatabase();
    const pu = await db.get('polling_units').find(puId);
    setPollingUnit(pu);

    // Load stats
    const evidence = await db.get('evidence').query().fetch();
    const accreditation = await db.get('accreditation_records').query().fetch();
    const incidents = await db.get('election_day_incidents').query().fetch();

    setStats({
      evidenceCount: evidence.filter((e: any) => e.pollingUnitId === puId).length,
      accreditationCount: accreditation.filter((a: any) => a.pollingUnitId === puId).length,
      incidentCount: incidents.filter((i: any) => i.pollingUnitId === puId).length,
    });
  };

  if (!pollingUnit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Polling Unit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{pollingUnit.puCode}</Text>
          </View>
          <Text style={styles.puName}>{pollingUnit.puName}</Text>
          <Text style={styles.location}>{pollingUnit.wardName}, {pollingUnit.lgaName}</Text>
          <Text style={styles.voters}>{pollingUnit.registeredVoters.toLocaleString()} Registered Voters</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Evidence Captured</Text>
            <Text style={styles.statValue}>{stats.evidenceCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Accreditation Updates</Text>
            <Text style={styles.statValue}>{stats.accreditationCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Incidents Reported</Text>
            <Text style={styles.statValue}>{stats.incidentCount}</Text>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CheckIn', { puId })}
          >
            <Ionicons name="location" size={24} color="#D4AF37" />
            <Text style={styles.actionText}>Check In</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EvidenceCapture', { puId, evidenceType: 'accreditation' })}
          >
            <Ionicons name="camera" size={24} color="#D4AF37" />
            <Text style={styles.actionText}>Capture Evidence</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Accreditation', { puId })}
          >
            <Ionicons name="people" size={24} color="#D4AF37" />
            <Text style={styles.actionText}>Report Accreditation</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Results', { puId })}
          >
            <Ionicons name="stats-chart" size={24} color="#D4AF37" />
            <Text style={styles.actionText}>Submit Results</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Incidents', { puId })}
          >
            <Ionicons name="warning" size={24} color="#D4AF37" />
            <Text style={styles.actionText}>Report Incident</Text>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  loading: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  codeBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  codeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  puName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  voters: {
    fontSize: 14,
    color: '#D4AF37',
  },
  statsCard: {
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
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  statLabel: {
    fontSize: 14,
    color: '#999999',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
});

export default PollingUnitDetailScreen;
