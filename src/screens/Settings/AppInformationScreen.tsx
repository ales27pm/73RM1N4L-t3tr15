import { useMemo } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { SettingsStackNavigationProp } from "../../navigation/types";
import { APP_INFORMATION_SECTIONS } from "../../utils/appMetadata";

const AppInformationScreen = () => {
  const navigation = useNavigation<SettingsStackNavigationProp<"AppInformation">>();

  const informationSections = useMemo(() => APP_INFORMATION_SECTIONS, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="app-info-scroll">
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to notification settings"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            testID="app-info-back-button"
          >
            <Ionicons name="chevron-back" size={22} color="#38bdf8" />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Localizable Info</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        {informationSections.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => (
                <View
                  key={item.testID}
                  style={[styles.row, index < section.items.length - 1 && styles.rowDivider]}
                  testID={item.testID}
                >
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text selectable style={styles.rowValue}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backLabel: {
    marginLeft: 4,
    color: "#38bdf8",
    fontWeight: "600",
  },
  headerPlaceholder: {
    width: 48,
    height: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomColor: "#1e293b",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    color: "#94a3b8",
    fontSize: 14,
    flex: 1,
    paddingRight: 16,
  },
  rowValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
});

export default AppInformationScreen;
