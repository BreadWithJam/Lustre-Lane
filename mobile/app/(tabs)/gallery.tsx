import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Dimensions, Modal } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { endpoints } from '@/constants/api'
import type { GalleryImage } from '@/types'

const { width } = Dimensions.get('window')
const COLS = 2
const GAP = 8
const PADDING = 16
const IMG_SIZE = (width - PADDING * 2 - GAP) / COLS

export default function GalleryScreen() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<GalleryImage | null>(null)

  useEffect(() => {
    fetch(endpoints.gallery)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => setImages(json.data ?? []))
      .catch((err) => {
        console.error('[Gallery] fetch error:', err)
        setError(err.message ?? 'Failed to load gallery')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Gallery</Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.brown} size="large" />
          <Text style={styles.loadingText}>Loading gallery...</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.warmGray} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && images.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="images-outline" size={40} color={Colors.warmGray} />
          <Text style={styles.emptyText}>No images yet.</Text>
        </View>
      )}

      {!loading && !error && images.length > 0 && (
        <FlatList
          data={images}
          numColumns={COLS}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const uri = typeof item.thumbnailUrl === 'string' && item.thumbnailUrl
              ? item.thumbnailUrl
              : typeof item.imageUrl === 'string'
              ? item.imageUrl
              : null
            if (!uri) return <View style={[styles.thumb, styles.thumbPlaceholder]} />
            return (
              <Pressable onPress={() => setSelected(item)} style={styles.thumbWrap}>
                <Image
                  source={uri}
                  style={styles.thumb}
                  contentFit="cover"
                  transition={300}
                  placeholder={{ color: Colors.creamDark }}
                />
                {item.isFeatured && (
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={10} color={Colors.gold} />
                  </View>
                )}
              </Pressable>
            )
          }}
        />
      )}

      {/* Lightbox */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <View style={styles.lightboxWrap}>
            <Pressable style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </Pressable>
            {selected && (() => {
              const uri = typeof selected.imageUrl === 'string' ? selected.imageUrl : null
              return uri ? (
                <>
                  <Image source={uri} style={styles.lightboxImg} contentFit="contain" />
                  {selected.title ? (
                    <Text style={styles.lightboxTitle}>{selected.title}</Text>
                  ) : null}
                  {selected.tags?.length > 0 && (
                    <View style={styles.tagRow}>
                      {selected.tags.slice(0, 4).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              ) : null
            })()}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { color: Colors.brown, fontSize: 24, fontWeight: '800', paddingHorizontal: PADDING, paddingTop: 20, paddingBottom: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { color: Colors.warmGray, fontSize: 13, marginTop: 8 },
  errorText: { color: Colors.error, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  emptyText: { color: Colors.warmGray, fontSize: 14 },
  grid: { padding: PADDING },
  thumbWrap: { position: 'relative' },
  thumb: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: 12 },
  thumbPlaceholder: { backgroundColor: Colors.creamDark },
  featuredBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lightboxWrap: { width: '100%', alignItems: 'center', gap: 12 },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    marginBottom: 4,
  },
  lightboxImg: { width: '100%', height: 380, borderRadius: 12 },
  lightboxTitle: { color: Colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  tag: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  tagText: { color: Colors.white, fontSize: 11 },
})
