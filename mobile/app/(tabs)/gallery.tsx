import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Dimensions, Modal } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { endpoints } from '@/constants/api'
import type { GalleryImage } from '@/types'

const COLS = 2
const GAP = 12
const PADDING = 20
const IMG_SIZE = (Dimensions.get('window').width - PADDING * 2 - GAP) / COLS

export default function GalleryScreen() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<GalleryImage | null>(null)

  useEffect(() => {
    fetch(endpoints.gallery)
      .then((r) => r.json())
      .then((json) => setImages(json.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Gallery</Text>

      {loading && <ActivityIndicator color={Colors.brown} style={{ marginTop: 32 }} />}

      <FlatList
        data={images}
        numColumns={COLS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)}>
            <Image
              source={{ uri: item.thumbnailUrl ?? item.imageUrl }}
              style={styles.thumb}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        )}
      />

      {/* Lightbox */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          {selected && (
            <View style={styles.lightbox}>
              <Image source={{ uri: selected.imageUrl }} style={styles.lightboxImg} contentFit="contain" />
              {selected.title && <Text style={styles.lightboxTitle}>{selected.title}</Text>}
            </View>
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { color: Colors.brown, fontSize: 22, fontWeight: '700', paddingHorizontal: PADDING, paddingTop: 16, paddingBottom: 12 },
  grid: { padding: PADDING },
  thumb: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  lightbox: { width: '100%', alignItems: 'center', gap: 12 },
  lightboxImg: { width: '100%', height: 400, borderRadius: 12 },
  lightboxTitle: { color: Colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center' },
})
