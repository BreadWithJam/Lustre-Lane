import { ScrollView, View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Lustre Lane Salon</Text>
          <Text style={styles.heroTitle}>Premium Hair &amp; Beauty Services</Text>
          <Text style={styles.heroSubtitle}>
            Discover your perfect style with our expert team of stylists.
          </Text>
          <Pressable style={styles.heroCta} onPress={() => router.push('/chat')}>
            <Text style={styles.heroCtaText}>Book a Consultation</Text>
          </Pressable>
        </View>

        {/* Quick links */}
        <View style={styles.quickLinks}>
          <QuickLink icon="✂️" label="Our Services" onPress={() => router.push('/services')} />
          <QuickLink icon="🖼️" label="Gallery" onPress={() => router.push('/gallery')} />
          <QuickLink icon="💬" label="Chat with Us" onPress={() => router.push('/chat')} />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.sectionBody}>
            Lustre Lane is a premium salon dedicated to helping you look and feel your best.
            From precision cuts to creative color, our stylists bring expertise and artistry
            to every appointment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function QuickLink({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickLink} onPress={onPress}>
      <Text style={styles.quickLinkIcon}>{icon}</Text>
      <Text style={styles.quickLinkLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 32 },
  hero: {
    backgroundColor: Colors.brown,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  heroEyebrow: { color: Colors.gold, fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { color: Colors.white, fontSize: 28, fontWeight: '700', lineHeight: 36, marginBottom: 12 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  heroCta: { backgroundColor: Colors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, alignSelf: 'flex-start' },
  heroCtaText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  quickLinks: { flexDirection: 'row', gap: 12, padding: 20 },
  quickLink: { flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border },
  quickLinkIcon: { fontSize: 24 },
  quickLinkLabel: { color: Colors.brown, fontWeight: '600', fontSize: 12, textAlign: 'center' },
  section: { paddingHorizontal: 20, paddingTop: 8 },
  sectionTitle: { color: Colors.brown, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sectionBody: { color: Colors.textMuted, fontSize: 14, lineHeight: 22 },
})
