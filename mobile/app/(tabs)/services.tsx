import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { endpoints } from '@/constants/api'
import type { Service, ServiceCategory } from '@/types'

const CATEGORIES: { key: ServiceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cuts', label: 'Cuts' },
  { key: 'color', label: 'Colour' },
  { key: 'treatments', label: 'Treatments' },
  { key: 'packages', label: 'Packages' },
]

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cuts: 'cut-outline',
  color: 'color-palette-outline',
  treatments: 'sparkles-outline',
  packages: 'gift-outline',
}

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all')

  useEffect(() => {
    fetch(endpoints.services)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => setServices(json.data ?? []))
      .catch((err) => setError(err.message ?? 'Failed to load services'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category === activeCategory)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Services</Text>
        <Text style={styles.count}>{filtered.length} available</Text>
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.chip, activeCategory === item.key && styles.chipActive]}
            onPress={() => setActiveCategory(item.key)}
          >
            <Text style={[styles.chipText, activeCategory === item.key && styles.chipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.brown} size="large" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.warmGray} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && filtered.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No services in this category.</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ServiceCard service={item} />}
        />
      )}
    </SafeAreaView>
  )
}

function ServiceCard({ service }: { service: Service }) {
  const icon = CATEGORY_ICONS[service.category] ?? 'sparkles-outline'
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={18} color={Colors.brown} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>{service.name}</Text>
          <Text style={styles.cardPrice}>${service.price}</Text>
        </View>
        {service.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{service.description}</Text>
        ) : null}
        <View style={styles.cardMeta}>
          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={11} color={Colors.warmGray} />
            <Text style={styles.metaText}>{service.duration} min</Text>
          </View>
          {service.stylistName ? (
            <View style={styles.metaBadge}>
              <Ionicons name="person-outline" size={11} color={Colors.warmGray} />
              <Text style={styles.metaText}>{service.stylistName}</Text>
            </View>
          ) : null}
          <View style={[styles.metaBadge, styles.categoryBadge]}>
            <Text style={styles.categoryText}>{service.category}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  header: { color: Colors.brown, fontSize: 24, fontWeight: '800' },
  count: { color: Colors.warmGray, fontSize: 12 },
  filterList: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.brown, borderColor: Colors.brown },
  chipText: { color: Colors.warmGray, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 60 },
  loadingText: { color: Colors.warmGray, fontSize: 13, marginTop: 8 },
  errorText: { color: Colors.error, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  emptyText: { color: Colors.warmGray, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: { paddingTop: 2 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardName: { color: Colors.text, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  cardPrice: { color: Colors.brown, fontSize: 16, fontWeight: '800' },
  cardDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  metaText: { color: Colors.warmGray, fontSize: 11 },
  categoryBadge: { backgroundColor: Colors.cream },
  categoryText: { color: Colors.brown, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
})
