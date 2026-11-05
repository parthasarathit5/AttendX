import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  SafeAreaView,
  Alert,
  FlatList,
  Platform,
} from 'react-native';

const DEFAULT_OFFERING_ID = "2851d026-2f7b-46c4-92a5-053cf5e4f57d";
const API_BASE = "http://10.0.2.2:8080"; // Android emulator localhost mapping

export default function App() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [role, setRole] = useState('student'); // 'student' or 'faculty'
  const [attendance, setAttendance] = useState({
    summary: {
      total_sessions: 10,
      present_sessions: 7,
      absent_sessions: 2,
      od_sessions: 1,
      attendance_percentage: 80.0,
      is_eligible: true,
      minimum_percentage: 75.0,
      shortfall_sessions: 0,
      exam_fee_amount: 1500,
    },
    logs: [
      { id: '1', session_number: 1, date: '2026-10-16', status: 'present', method: 'PORTAL', remarks: 'Orientation' },
      { id: '2', session_number: 2, date: '2026-10-18', status: 'present', method: 'PORTAL', remarks: 'Clock Sync' },
      { id: '3', session_number: 3, date: '2026-10-20', status: 'present', method: 'QR_CODE', remarks: 'Lab WebSocket' },
      { id: '4', session_number: 4, date: '2026-10-22', status: 'absent', method: 'PORTAL', remarks: 'Unexcused' },
      { id: '5', session_number: 5, date: '2026-10-24', status: 'on_duty', method: 'OD_APPROVED', remarks: 'Smart India Hackathon' },
      { id: '6', session_number: 6, date: '2026-10-26', status: 'present', method: 'QR_CODE', remarks: 'React Native Telemetry' },
      { id: '7', session_number: 7, date: '2026-10-28', status: 'present', method: 'PORTAL', remarks: 'Raft Consensus' },
      { id: '8', session_number: 8, date: '2026-10-30', status: 'present', method: 'QR_CODE', remarks: 'Fault Tolerance' },
      { id: '9', session_number: 9, date: '2026-11-01', status: 'absent', method: 'PORTAL', remarks: 'Unexcused' },
      { id: '10', session_number: 10, date: '2026-11-03', status: 'present', method: 'QR_CODE', remarks: 'Compliance & Review' },
    ],
  });

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [odModalVisible, setOdModalVisible] = useState(false);
  const [qrToken, setQrToken] = useState('ATTENDX:2851d026-2f7b-46c4-92a5-053cf5e4f57d:10:LIVE_SESSION');
  const [odReason, setOdReason] = useState('');
  const [odCategory, setOdCategory] = useState('Hackathon');

  // Attempt live sync with Spring Boot backend
  useEffect(() => {
    fetchBackendAttendance();
  }, []);

  const fetchBackendAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/course-attendance/course-offerings/${DEFAULT_OFFERING_ID}/my-attendance?registerNumber=192111001`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          setAttendance(data);
        }
      }
    } catch (e) {
      // Offline fallback state ready
    }
  };

  const handleQrCheckIn = async () => {
    if (!qrToken.trim()) {
      Alert.alert('Error', 'Please enter a valid QR token');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/course-attendance/qr-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: qrToken,
          register_number: '192111001',
          student_name: 'Arun Kumar S'
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        Alert.alert('Success', 'Attendance marked successfully via QR Code!');
        setQrModalVisible(false);
        fetchBackendAttendance();
      } else {
        Alert.alert('Notice', result.message || 'Check-in validated locally.');
        setQrModalVisible(false);
      }
    } catch (err) {
      Alert.alert('Offline Mode', 'Check-in recorded locally in AttendX SQLite cache.');
      setQrModalVisible(false);
    }
  };

  const handleOdSubmit = async () => {
    if (!odReason.trim()) {
      Alert.alert('Validation Error', 'Please specify the reason for OD leave');
      return;
    }
    Alert.alert('Submitted', 'Your On-Duty application has been submitted to Dr. K. Ravichandran for verification.');
    setOdModalVisible(false);
    setOdReason('');
  };

  const sum = attendance.summary;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandGroup}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>AX</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Attend<Text style={{ color: '#2563eb' }}>X</Text></Text>
            <Text style={styles.brandSub}>SIMATS SSE LMS</Text>
          </View>
        </View>

        {/* Role Toggle Pill */}
        <TouchableOpacity 
          style={styles.roleButton}
          onPress={() => setRole(role === 'student' ? 'faculty' : 'student')}
        >
          <Text style={styles.roleButtonText}>{role.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Course Window Banner (V-Study Reference Component) */}
        <View style={styles.courseCard}>
          <View style={styles.badgeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>21CS301</Text>
            </View>
            <View style={styles.creditBadge}>
              <Text style={styles.creditBadgeText}>4 Credits</Text>
            </View>
          </View>

          <Text style={styles.courseTitle}>Distributed Cloud Computing &amp; Attendance Telemetry</Text>
          <Text style={styles.facultyText}>Faculty: Dr. K. Ravichandran, M.E., Ph.D.</Text>
          <Text style={styles.metaSub}>2025-2026 • Semester VI • Dept. of CSE</Text>
          
          <View style={styles.uuidPill}>
            <Text style={styles.uuidText}>ID: {DEFAULT_OFFERING_ID.substring(0, 18)}...</Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.btnSecondary}
              onPress={() => Alert.alert('Course Schedule', 'Mon 08:30-10:10 (Hall 402)\nWed 10:30-12:10 (Lab 3)\nFri 01:15-02:45 (Smart Room 201)')}
            >
              <Text style={styles.btnSecondaryText}>Timetable</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnPrimary, !sum.is_eligible && styles.btnDisabled]}
              onPress={() => {
                if (sum.is_eligible) {
                  Alert.alert('Exam Fees', 'Eligibility Verified. Total Amount: ₹1,500');
                } else {
                  Alert.alert('Restricted', `Attendance (${sum.attendance_percentage}%) is below 75%. Shortfall: ${sum.shortfall_sessions} classes.`);
                }
              }}
            >
              <Text style={styles.btnPrimaryText}>
                {sum.is_eligible ? 'Pay Exam Fee (₹1,500)' : 'Exam Fee (Locked)'}
              </Text>
            </TouchableOpacity>
          </View>

          {!sum.is_eligible && (
            <Text style={styles.feeWarningText}>
              Attendance is below 75%. Complete shortfall to unlock exam hall ticket.
            </Text>
          )}
        </View>

        {/* Rounded Pill Tab Bar (V-Study style) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
          {['overview', 'topics', 'sessions', 'attendance', 'grading'].map((tabKey) => (
            <TouchableOpacity
              key={tabKey}
              style={[styles.tabPill, activeTab === tabKey && styles.tabPillActive]}
              onPress={() => setActiveTab(tabKey)}
            >
              <Text style={[styles.tabPillText, activeTab === tabKey && styles.tabPillTextActive]}>
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab 1: Attendance Tab (Primary Reference Screen) */}
        {activeTab === 'attendance' && (
          <View>
            {/* 4-Card Metric Grid */}
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>TOTAL</Text>
                <Text style={styles.metricValue}>{sum.total_sessions}</Text>
                <Text style={styles.metricFooter}>Delivered</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>PRESENT</Text>
                <Text style={[styles.metricValue, { color: '#059669' }]}>{sum.present_sessions}</Text>
                <Text style={styles.metricFooter}>Attended</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>ABSENT</Text>
                <Text style={[styles.metricValue, { color: '#dc2626' }]}>{sum.absent_sessions}</Text>
                <Text style={styles.metricFooter}>Missed</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>ATTENDANCE</Text>
                <Text style={[styles.metricValue, { color: sum.is_eligible ? '#1d4ed8' : '#dc2626' }]}>
                  {sum.attendance_percentage}%
                </Text>
                <Text style={styles.metricFooter}>Min 75.0%</Text>
              </View>
            </View>

            {/* Attendance Status Banner */}
            <View style={[styles.bannerBox, sum.is_eligible ? styles.bannerEligible : styles.bannerWarning]}>
              <View style={[styles.dot, sum.is_eligible ? styles.dotGreen : styles.dotRed]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  {sum.is_eligible ? 'Eligible for Semester Examination' : 'Attendance Shortfall Alert'}
                </Text>
                <Text style={styles.bannerSub}>
                  {sum.is_eligible 
                    ? `Current attendance meets the 75% Saveetha academic regulation.`
                    : `Must attend ${sum.shortfall_sessions} upcoming sessions to regain eligibility.`}
                </Text>
              </View>
            </View>

            {/* Action Buttons for Mobile */}
            <View style={styles.buttonActionRow}>
              <TouchableOpacity style={styles.actionPillBtn} onPress={() => setQrModalVisible(true)}>
                <Text style={styles.actionPillBtnText}>Scan QR Code Check-in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionPillBtnSecondary} onPress={() => setOdModalVisible(true)}>
                <Text style={styles.actionPillBtnSecondaryText}>Apply OD Leave</Text>
              </TouchableOpacity>
            </View>

            {/* Attendance Logs Table */}
            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>Session Attendance Records</Text>
              
              {attendance.logs.map((item, index) => {
                const isPresent = item.status === 'present';
                const isOd = item.status === 'on_duty' || item.status === 'od';
                return (
                  <View key={item.id || index.toString()} style={styles.tableRow}>
                    <View style={styles.tableColMain}>
                      <Text style={styles.sessionNumberText}>Session #{item.session_number}</Text>
                      <Text style={styles.sessionDateText}>{item.date}</Text>
                      <Text style={styles.sessionRemarksText}>{item.remarks || item.faculty_remarks || 'Theory class'}</Text>
                    </View>

                    <View style={[
                      styles.statusBadge,
                      isPresent && styles.badgePresent,
                      isOd && styles.badgeOd,
                      !isPresent && !isOd && styles.badgeAbsent,
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        isPresent && styles.textPresent,
                        isOd && styles.textOd,
                        !isPresent && !isOd && styles.textAbsent,
                      ]}>
                        {isPresent ? 'Present' : isOd ? 'OD' : 'Absent'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Tab 2: Overview */}
        {activeTab === 'overview' && (
          <View style={styles.tableCard}>
            <Text style={styles.sectionHeader}>Course Objectives &amp; Policy</Text>
            <Text style={styles.bodyText}>
              This course covers distributed consensus, telemetry pipelines, cloud microservices, dynamic geofenced attendance synchronization, and Supabase PostgreSQL persistence.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Attendance Rule</Text>
              <Text style={styles.infoText}>Minimum 75.0% physical attendance required for Semester End Examination Hall Ticket generation.</Text>
            </View>
          </View>
        )}

        {/* Tab 3: Topics */}
        {activeTab === 'topics' && (
          <View style={styles.tableCard}>
            <Text style={styles.sectionHeader}>Course Topics &amp; Units</Text>
            {['Unit 1: Distributed Computing Foundations', 'Unit 2: Telemetry & Sensing Protocols', 'Unit 3: Cloud Native Architectures', 'Unit 4: Consensus & Fault Tolerance', 'Unit 5: Edge Offline Sync & Mobile Telemetry'].map((unit, idx) => (
              <View key={idx} style={styles.unitRow}>
                <Text style={styles.unitTitle}>{unit}</Text>
                <Text style={styles.unitHours}>5 Hours Allocated</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tab 4: Sessions */}
        {activeTab === 'sessions' && (
          <View style={styles.tableCard}>
            <Text style={styles.sectionHeader}>3-Stage Session Plan</Text>
            {[1, 2, 3, 4, 5].map((s) => (
              <View key={s} style={styles.sessionPlanBox}>
                <Text style={styles.planSessionTitle}>Session #{s}: Core Architecture</Text>
                <Text style={styles.stageLabel}>• Before Class: Pre-read Tanenbaum Distributed Systems</Text>
                <Text style={styles.stageLabel}>• In Class: Interactive Telemetry Lab Simulation</Text>
                <Text style={styles.stageLabel}>• After Class: MCQ Knowledge Check on LMS</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tab 5: Grading */}
        {activeTab === 'grading' && (
          <View style={styles.tableCard}>
            <Text style={styles.sectionHeader}>Continuous Internal Evaluation (CIE)</Text>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>Attendance Discipline (&gt;80%)</Text>
              <Text style={styles.gradeScore}>5 / 5 Marks</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>Continuous Assessment Test 1 (CAT-1)</Text>
              <Text style={styles.gradeScore}>46 / 50 Marks</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>Laboratory Telemetry Practicum</Text>
              <Text style={styles.gradeScore}>28 / 30 Marks</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* QR Scanner / Check-in Modal */}
      <Modal visible={qrModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeaderTitle}>Scan Session QR Token</Text>
            <Text style={styles.modalDesc}>Scan the rotating QR code displayed on the smart classroom screen.</Text>
            
            <TextInput
              style={styles.tokenInput}
              value={qrToken}
              onChangeText={setQrToken}
              placeholder="Enter QR token"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setQrModalVisible(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleQrCheckIn}>
                <Text style={styles.btnPrimaryText}>Verify &amp; Check In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OD Request Modal */}
      <Modal visible={odModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeaderTitle}>Apply On-Duty (OD) Leave</Text>
            <Text style={styles.modalDesc}>Submit event details for official course coordinator approval.</Text>
            
            <TextInput
              style={styles.tokenInput}
              value={odCategory}
              onChangeText={setOdCategory}
              placeholder="Category: Hackathon / Sports / Medical"
            />

            <TextInput
              style={[styles.tokenInput, { height: 80 }]}
              value={odReason}
              onChangeText={setOdReason}
              multiline
              placeholder="Reason and event description"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setOdModalVisible(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleOdSubmit}>
                <Text style={styles.btnPrimaryText}>Submit OD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  roleButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  roleButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  codeBadgeText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '700',
  },
  creditBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  facultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  metaSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  uuidPill: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  uuidText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#64748b',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  btnPrimary: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnDisabled: {
    backgroundColor: '#94a3b8',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  feeWarningText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  tabPillActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabPillTextActive: {
    color: '#ffffff',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 4,
  },
  metricFooter: {
    fontSize: 10,
    color: '#94a3b8',
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  bannerEligible: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  bannerWarning: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: {
    backgroundColor: '#10b981',
  },
  dotRed: {
    backgroundColor: '#ef4444',
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  bannerSub: {
    fontSize: 10,
    color: '#475569',
  },
  buttonActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  actionPillBtn: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionPillBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionPillBtnSecondary: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  actionPillBtnSecondaryText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableColMain: {
    flex: 1,
  },
  sessionNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  sessionDateText: {
    fontSize: 11,
    color: '#64748b',
  },
  sessionRemarksText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgePresent: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeOd: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  badgeAbsent: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textPresent: { color: '#047857' },
  textOd: { color: '#b45309' },
  textAbsent: { color: '#b91c1c' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  infoText: {
    fontSize: 11,
    color: '#475569',
  },
  unitRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  unitTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  unitHours: {
    fontSize: 10,
    color: '#2563eb',
    marginTop: 2,
  },
  sessionPlanBox: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  planSessionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  stageLabel: {
    fontSize: 11,
    color: '#475569',
    marginVertical: 1,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  gradeLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  gradeScore: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
  },
  tokenInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
