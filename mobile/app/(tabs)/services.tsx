import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { endpoints } from '@/constants/api'
import type { Service, ServiceCategory } from '@/types'

const CATEGORIES: { key: ServiceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cuts', label: 'Cuts' },
  { key: 'color', label: 'Color' },
  { key: 'treatments', label: 'Treatments' },
  { key: 'packages', label: 'Packages' },
]

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all')

  useEffect(() => {
    fetch(endpoints.services)
      .then((r) => r.json())
      .then((json) => setServices(json.data ?? []))
      .catch(() => setError('Failed to load services'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'all' ? services : services.filter((s) => s.category === activeCategory)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Our Services</Text>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.filterChip, activeCategory === item.key && styles.filterChipActive]}
            onPress={() => setActiveCategory(item.key)}
          >
            <Text style={[styles.filterChipText, activeCategory === item.key && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {loading && <ActivityIndicator color={Colors.brown} style={{ marginTop: 32 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ServiceCard service={item} />}
      />
    </SafeAreaView>
  )
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{service.name}</Text>
        <Text style={styles.cardPrice}>${service.price}</Text>
      </View>
      {service.description && <Text style={styles.cardDesc}>{service.description}</Text>}
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>⏱ {service.duration} min</Text>
        {service.stylistName && <Text style={styles.cardMeta}>👤 {service.stylistName}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { color: Colors.brown, fontSize: 22, fontWeight: '700', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  filterList: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  filterChipActive: { backgroundColor: Colors.brown, borderColor: Colors.brown },
  filterChipText: { color: Colors.warmGray, fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: Colors.white },
  list: { padding: 20, gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardName: { color: Colors.text, fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  cardPrice: { color: Colors.brown, fontSize: 16, fontWeight: '700' },
  cardDesc: { color: Colors.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', gap: 16 },
  cardMeta: { color: Colors.warmGray, fontSize: 12 },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: 32 },
})
