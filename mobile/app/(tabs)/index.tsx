import { ScrollView, View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

const QUICK_LINKS = [
  { icon: 'cut-outline' as const, label: 'Services', route: '/services' as const },
  { icon: 'images-outline' as const, label: 'Gallery', route: '/gallery' as const },
  { icon: 'chatbubble-outline' as const, label: 'Chat', route: '/chat' as const },
]

export default function HomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <ImageBackground
          source={require('../../assets/images/salon.png')}
          style={styles.heroBg}
          resizeMode="cover"
          imageStyle={{ objectPosition: 'bottom' }}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroCardWrapper}>
              <View style={styles.heroCardInner}>
                <Text style={styles.eyebrow}>Lustre Lane Salon</Text>
                <Text style={styles.heroTitle}>Premium Hair{'\n'}&amp; Beauty</Text>
                <Text style={styles.heroSubtitle}>
                  Expert stylists. Personalised care. Unforgettable results.
                </Text>
                <Pressable style={styles.cta} onPress={() => router.push('/chat')}>
                  <Text style={styles.ctaText}>Book a Consultation</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                </Pressable>
              </View>
          </View>
        </ImageBackground>

        {/* Quick links */}
        <View style={styles.quickRow}>
          {QUICK_LINKS.map((link) => (
            <Pressable key={link.label} style={styles.quickCard} onPress={() => router.push(link.route)}>
              <View style={styles.quickIcon}>
                <Ionicons name={link.icon} size={22} color={Colors.brown} />
              </View>
              <Text style={styles.quickLabel}>{link.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About Us</Text>
          <View style={styles.divider} />
          <Text style={styles.aboutBody}>
            Lustre Lane is a premium salon dedicated to helping you look and feel your best.
            From precision cuts to creative colour, our stylists bring expertise and artistry
            to every appointment.
          </Text>
        </View>

        {/* CTA banner */}
        <Pressable style={styles.banner} onPress={() => router.push('/services')}>
          <View>
            <Text style={styles.bannerTitle}>Explore Our Services</Text>
            <Text style={styles.bannerSub}>Cuts · Colour · Treatments · Packages</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.brown} />
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },

  heroBg: {
    width: '100%',
    height: 420,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 36,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroCardWrapper: {
    width: '88%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroCardInner: {
    backgroundColor: 'rgba(100,55,25,0.72)',
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 28,
  },
  eyebrow: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
    marginBottom: 14,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  ctaText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  quickRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: { color: Colors.text, fontWeight: '600', fontSize: 12 },

  aboutCard: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aboutTitle: { color: Colors.brown, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  aboutBody: { color: Colors.textMuted, fontSize: 14, lineHeight: 22 },

  banner: {
    marginHorizontal: 20,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bannerTitle: { color: Colors.brown, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  bannerSub: { color: Colors.warmGray, fontSize: 12 },
})
