import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Shadow, Size, Spacing } from "../design/tokens";

export type ActiveNavTab = "beranda" | "peta" | "siaga" | "vault";

interface BottomNavBarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onOpenReportModal: () => void;
}

export function BottomNavBar({
  activeTab,
  onSelectTab,
  onOpenReportModal,
}: BottomNavBarProps) {
  return (
    <View style={styles.navBarContainer}>
      {/* Tab 1: Beranda */}
      <Pressable
        style={styles.navItem}
        onPress={() => onSelectTab("beranda")}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "beranda" }}
        accessibilityLabel="Menu Beranda"
      >
        <Text style={[styles.navIcon, activeTab === "beranda" && styles.navIconActive]}>
          🏛️
        </Text>
        <Text style={[styles.navLabel, activeTab === "beranda" && styles.navLabelActive]}>
          Beranda
        </Text>
      </Pressable>

      {/* Tab 2: Peta */}
      <Pressable
        style={styles.navItem}
        onPress={() => onSelectTab("peta")}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "peta" }}
        accessibilityLabel="Menu Peta Komunitas"
      >
        <Text style={[styles.navIcon, activeTab === "peta" && styles.navIconActive]}>
          🗺️
        </Text>
        <Text style={[styles.navLabel, activeTab === "peta" && styles.navLabelActive]}>
          Peta
        </Text>
      </Pressable>

      {/* Center Action: Lapor Baru (+) */}
      <View style={styles.centerActionWrap}>
        <Pressable
          style={styles.centerActionButton}
          onPress={onOpenReportModal}
          accessibilityRole="button"
          accessibilityLabel="Buat Laporan Baru"
        >
          <Text style={styles.centerActionIcon}>+</Text>
          <Text style={styles.centerActionLabel}>Lapor</Text>
        </Pressable>
      </View>

      {/* Tab 3: Siaga */}
      <Pressable
        style={styles.navItem}
        onPress={() => onSelectTab("siaga")}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "siaga" }}
        accessibilityLabel="Menu Siaga Bencana"
      >
        <Text style={[styles.navIcon, activeTab === "siaga" && styles.navIconActive]}>
          🚨
        </Text>
        <Text style={[styles.navLabel, activeTab === "siaga" && styles.navLabelActive]}>
          Siaga
        </Text>
      </Pressable>

      {/* Tab 4: Vault & Profil */}
      <Pressable
        style={styles.navItem}
        onPress={() => onSelectTab("vault")}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "vault" }}
        accessibilityLabel="Menu Profil dan Brankas Berkas"
      >
        <Text style={[styles.navIcon, activeTab === "vault" && styles.navIconActive]}>
          🛡️
        </Text>
        <Text style={[styles.navLabel, activeTab === "vault" && styles.navLabelActive]}>
          Brankas
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    height: 64,
    backgroundColor: Colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.xs,
    ...Shadow.float,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: 2,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  centerActionWrap: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  centerActionButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.float,
    marginTop: -16,
  },
  centerActionIcon: {
    color: Colors.textInverse,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 24,
  },
  centerActionLabel: {
    color: Colors.textInverse,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
