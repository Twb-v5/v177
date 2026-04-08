import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/providers/SettingsProvider";

const isRTL = true;

interface KhatmaSession {
  id: string;
  name: string;
  startDate: string;
  progress: number;
  totalJuz: number;
  completedJuz: number;
  participants: number;
  isActive: boolean;
}

const sampleKhatmas: KhatmaSession[] = [
  {
    id: "1",
    name: " Khatma Ramadan 1446",
    startDate: "2025-03-01",
    progress: 65,
    totalJuz: 30,
    completedJuz: 19,
    participants: 5,
    isActive: true,
  },
  {
    id: "2",
    name: " Daily Khatma",
    startDate: "2025-04-01",
    progress: 30,
    totalJuz: 30,
    completedJuz: 9,
    participants: 1,
    isActive: true,
  },
];

export default function QuranKhatmaScreen() {
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  
  const [khatmas, setKhatmas] = useState<KhatmaSession[]>(sampleKhatmas);

  const startNewKhatma = () => {
    Alert.alert(
      " new Khatma",
      "Would you like to start a new Khatma?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Start", 
          onPress: () => {
            const newKhatma: KhatmaSession = {
              id: Date.now().toString(),
              name: ` Khatma ${new Date().toLocaleDateString("ar")}`,
              startDate: new Date().toISOString().split("T")[0],
              progress: 0,
              totalJuz: 30,
              completedJuz: 0,
              participants: 1,
              isActive: true,
            };
            setKhatmas(prev => [newKhatma, ...prev]);
          }
        },
      ]
    );
  };

  const updateProgress = (khatmaId: string, increment: number) => {
    setKhatmas(prev => prev.map(k => {
      if (k.id === khatmaId) {
        const newCompleted = Math.min(k.completedJuz + increment, k.totalJuz);
        return {
          ...k,
          completedJuz: newCompleted,
          progress: Math.round((newCompleted / k.totalJuz) * 100),
          isActive: newCompleted < k.totalJuz
        };
      }
      return k;
    }));
  };

  const deleteKhatma = (khatmaId: string) => {
    Alert.alert(
      " delete Khatma",
      "Are you sure you want to delete this Khatma?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setKhatmas(prev => prev.filter(k => k.id !== khatmaId))
        },
      ]
    );
  };

  const renderKhatma = ({ item }: { item: KhatmaSession }) => (
    <View style={[styles.khatmaCard, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
      <View style={styles.khatmaHeader}>
        <View style={styles.khatmaInfo}>
          <Text style={[styles.khatmaName, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>{item.name}</Text>
          <Text style={[styles.khatmaDate, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {item.startDate} · {item.participants} participants
          </Text>
        </View>
        <Pressable onPress={() => deleteKhatma(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progress}%`,
                backgroundColor: item.progress === 100 ? "#22c55e" : "#1a4731"
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
          {item.completedJuz} / {item.totalJuz} ({item.progress}%)
        </Text>
      </View>

      {/* Juz Progress Dots */}
      <View style={styles.juzContainer}>
        {Array.from({ length: item.totalJuz }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.juzDot,
              { backgroundColor: isDark ? "#334155" : "#e2e8f0" },
              index < item.completedJuz && styles.juzDotCompleted
            ]}
          />
        ))}
      </View>

      {/* Control Buttons */}
      {item.isActive && (
        <View style={styles.controlsRow}>
          <Pressable 
            style={[styles.controlBtn, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}
            onPress={() => updateProgress(item.id, -1)}
            disabled={item.completedJuz === 0}
          >
            <Ionicons name="remove" size={20} color={isDark ? "#f1f5f9" : "#1e293b"} />
          </Pressable>
          
          <Pressable 
            style={[styles.addJuzBtn, { backgroundColor: "#1a4731" }]}
            onPress={() => updateProgress(item.id, 1)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addJuzText}> add Juz</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.controlBtn, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}
            onPress={() => updateProgress(item.id, 10)}
          >
            <Text style={[styles.skipText, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>+10</Text>
          </Pressable>
        </View>
      )}

      {item.progress === 100 && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
          <Text style={[styles.completedText, { color: "#22c55e" }]}> completed Alhamduillah</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-forward" size={24} color={isDark ? "#f1f5f9" : "#1e293b"} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? "#f1f5f9" : "#1e293b" }]}> Khatma Tracker</Text>
        <Pressable onPress={startNewKhatma} style={styles.headerBtn}>
          <Ionicons name="add-circle" size={28} color="#1a4731" />
        </Pressable>
      </View>

      {/* Stats Summary */}
      <View style={[styles.statsContainer, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>{khatmas.length}</Text>
          <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Total Khatmas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
            {khatmas.filter(k => k.isActive).length}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#22c55e" }]}>
            {khatmas.filter(k => k.progress === 100).length}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>Completed</Text>
        </View>
      </View>

      {/* Khatma List */}
      <FlatList
        data={khatmas}
        renderItem={renderKhatma}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color={isDark ? "#475569" : "#cbd5e1"} />
            <Text style={[styles.emptyText, { color: isDark ? "#64748b" : "#94a3b8" }]}>
              No Khatmas yet
            </Text>
            <Pressable style={[styles.emptyBtn, { backgroundColor: "#1a4731" }]} onPress={startNewKhatma}>
              <Text style={styles.emptyBtnText}>Start Khatma</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 12, 
    borderBottomWidth: 1 
  },
  headerBtn: { padding: 8, borderRadius: 12 },
  headerTitle: { 
    flex: 1, 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif"
  },
  statsContainer: { 
    flexDirection: "row", 
    padding: 20, 
    margin: 16, 
    borderRadius: 20, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 28, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: "#e2e8f0", marginVertical: 4 },
  list: { padding: 16, paddingTop: 0 },
  khatmaCard: { 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 16, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 2 }
    })
  },
  khatmaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  khatmaInfo: { flex: 1 },
  khatmaName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  khatmaDate: { fontSize: 12 },
  deleteBtn: { padding: 8 },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: "left" },
  juzContainer: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 16 },
  juzDot: { width: 18, height: 18, borderRadius: 4 },
  juzDotCompleted: { backgroundColor: "#1a4731" },
  controlsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
  controlBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addJuzBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  addJuzText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  skipText: { fontWeight: "600", fontSize: 14 },
  completedBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16, gap: 8 },
  completedText: { fontSize: 16, fontWeight: "600" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, marginTop: 16 },
  emptyBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },
});
