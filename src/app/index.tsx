import { AdmissionModal } from "@/components/AdmissionModal";
import { HeroAnimation } from "@/components/HeroAnimation";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  fetchPrograms,
  fetchGallery,
  fetchTestimonials,
  fetchSiteSettings,
  ProgramItem,
  GalleryItem,
  TestimonialItem,
  SiteSettingsState,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/admin-api";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: "default-1",
    number: "01",
    title: "Early Learning",
    description: "Fun, creative and engaging learning experiences for young children.",
    age_group: "2.5 - 4 Years",
    icon: "🌱",
    sort_order: 1,
    is_active: true,
    created_at: "",
  },
  {
    id: "default-2",
    number: "02",
    title: "Primary Education",
    description: "Building strong academic and personal foundations.",
    age_group: "4 - 6 Years",
    icon: "📚",
    sort_order: 2,
    is_active: true,
    created_at: "",
  },
  {
    id: "default-3",
    number: "03",
    title: "Student Development",
    description: "Encouraging confidence, creativity and important life skills.",
    age_group: "All Ages",
    icon: "⭐",
    sort_order: 3,
    is_active: true,
    created_at: "",
  },
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "default-g-1",
    title: "Learning Together",
    image_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    category: "campus",
    sort_order: 1,
    is_active: true,
    created_at: "",
  },
  {
    id: "default-g-2",
    title: "Young Learners",
    image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    category: "activities",
    sort_order: 2,
    is_active: true,
    created_at: "",
  },
  {
    id: "default-g-3",
    title: "Creative Activities",
    image_url: "https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=80",
    category: "activities",
    sort_order: 3,
    is_active: true,
    created_at: "",
  },
  {
    id: "default-g-4",
    title: "Classroom Life",
    image_url: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80",
    category: "campus",
    sort_order: 4,
    is_active: true,
    created_at: "",
  },
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "default-t-1",
    name: "KSM Parent",
    relationship: "KSM Parent",
    message: "A warm and caring environment where children can learn with confidence.",
    rating: 5,
    sort_order: 1,
    is_active: true,
    created_at: "",
  },
  {
    id: "default-t-2",
    name: "KSM Family",
    relationship: "KSM Family",
    message: "The focus on early development, activities and individual attention makes learning enjoyable.",
    rating: 5,
    sort_order: 2,
    is_active: true,
    created_at: "",
  },
  {
    id: "default-t-3",
    name: "KSM Parent",
    relationship: "KSM Parent",
    message: "A positive beginning for a child's educational journey.",
    rating: 5,
    sort_order: 3,
    is_active: true,
    created_at: "",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [admissionModalVisible, setAdmissionModalVisible] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth > 860;
  const isTablet = windowWidth <= 860 && windowWidth > 600;
  const isMobile = windowWidth <= 600;

  // Live dynamic data state with sensible fallbacks
  const [programs, setPrograms] = useState<ProgramItem[]>(DEFAULT_PROGRAMS);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsState>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveContent() {
      try {
        const [progs, gal, tests, settings] = await Promise.allSettled([
          fetchPrograms(false),
          fetchGallery(false),
          fetchTestimonials(false),
          fetchSiteSettings(),
        ]);
        if (!isMounted) return;
        if (progs.status === "fulfilled" && progs.value?.length > 0) {
          setPrograms(progs.value);
        }
        if (gal.status === "fulfilled" && gal.value?.length > 0) {
          setGallery(gal.value);
        }
        if (tests.status === "fulfilled" && tests.value?.length > 0) {
          setTestimonials(tests.value);
        }
        if (settings.status === "fulfilled" && settings.value) {
          setSiteSettings(settings.value);
        }
      } catch (err) {
        console.warn("Failed to load live data from Supabase:", err);
      }
    }
    loadLiveContent();
    return () => {
      isMounted = false;
    };
  }, []);



  const [sectionPositions, setSectionPositions] = useState<{
    about?: number;
    programs?: number;
    why?: number;
    activities?: number;
    gallery?: number;
    testimonials?: number;
    admissions?: number;
    contact?: number;
  }>({});

  const goToSection = (section: keyof typeof sectionPositions) => {
    setMenuOpen(false);

    const position = sectionPositions[section];

    if (position !== undefined) {
      scrollRef.current?.scrollTo({
        y: position,
        animated: true,
      });
    }
  };

  const savePosition = (
    section: keyof typeof sectionPositions,
    y: number
  ) => {
    setSectionPositions((previous) => ({
      ...previous,
      [section]: y,
    }));
  };

  return (
    <View style={styles.page}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR */}
        <View style={[styles.topBar, { paddingHorizontal: isDesktop ? 38 : 20 }]}>
          <Text style={styles.topBarText}>
            Welcome to {siteSettings.branding?.fullName || "Kindergarten Saadia's Montessori School"}
          </Text>

          <SupabaseStatus />

          <Pressable onPress={() => goToSection("admissions")}>
            <Text style={styles.contactText}>Contact Us</Text>
          </Pressable>
        </View>


        {/* HEADER */}
        <View style={[styles.header, { paddingHorizontal: isDesktop ? 40 : 20 }]}>
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>K</Text>
            </View>

            <View>
              <Text style={[styles.schoolName, { fontSize: isDesktop ? 27 : 20 }]}>
                {siteSettings.branding?.schoolName || "KINDERGARTEN SAADIA'S"}
              </Text>

              <Text style={styles.tagline}>
                {siteSettings.branding?.tagline || "Learn • Grow • Succeed"}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.menuButton}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <Text style={styles.menuIcon}>☰</Text>
            <Text style={styles.menuText}>Menu</Text>
          </Pressable>
        </View>

        {/* MENU */}
        {menuOpen && (
          <View style={styles.menuPanel}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                scrollRef.current?.scrollTo({
                  y: 0,
                  animated: true,
                });
              }}
            >
              <Text style={styles.menuItemText}>Home</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("admissions")}
            >
              <Text style={styles.menuItemText}>Admissions</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("about")}
            >
              <Text style={styles.menuItemText}>About Us</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("programs")}
            >
              <Text style={styles.menuItemText}>Programs</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("why")}
            >
              <Text style={styles.menuItemText}>Why Choose Us</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("activities")}
            >
              <Text style={styles.menuItemText}>Activities</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("gallery")}
            >
              <Text style={styles.menuItemText}>Gallery</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("testimonials")}
            >
              <Text style={styles.menuItemText}>Testimonials</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => goToSection("contact")}
            >
              <Text style={styles.menuItemText}>Contact</Text>
            </Pressable>
          </View>
        )}

        {/* 1. HERO SECTION */}
        <View style={styles.hero} nativeID="hero">
          <View style={[styles.heroContent, isDesktop && { flexDirection: "row", alignItems: "center" }]} nativeID="hero-content">
            <View style={[styles.heroLeft, isDesktop && { flex: 1, paddingRight: 35 }]} nativeID="hero-left">
              <View style={styles.welcomeBadge}>
                <Text style={styles.welcomeBadgeText}>
                  WELCOME TO KINDERGARTEN SAADIA'S
                </Text>
              </View>

              <Text style={[styles.heroTitle, { fontSize: isDesktop ? 66 : isTablet ? 50 : 38, lineHeight: isDesktop ? 80 : isTablet ? 60 : 48 }]}>
                Building Bright{"\n"}Futures Together
              </Text>

              <Text style={styles.heroDescription}>
                A nurturing learning environment where children can
                learn, explore, grow and develop the confidence to
                succeed.
              </Text>

              <View style={[styles.heroButtons, { flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center" }]} nativeID="hero-buttons">
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setAdmissionModalVisible(true)}
                >
                  <Text style={styles.primaryButtonText}>
                    Apply for Admission
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => goToSection("about")}
                >
                  <Text style={styles.secondaryButtonText}>
                    Discover Our School
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.heroImageContainer, isDesktop ? { flex: 1, maxWidth: 620, marginLeft: 35, marginTop: 0 } : { width: "100%", maxWidth: 600, marginTop: 35 }]} nativeID="hero-right">
              <HeroAnimation />
            </View>
          </View>

          {/* FEATURES HIGHLIGHTS ROW (Inside Hero Section) */}
          <View style={[styles.featuresSection, { flexDirection: isDesktop ? "row" : "column" }]} nativeID="features">
            <FeatureCard
              icon="🎓"
              title="Quality Education"
              description="Building strong foundations for young learners."
            />

            <FeatureCard
              icon="👩‍🏫"
              title="Caring Teachers"
              description="Supporting every child's educational journey."
            />

            <FeatureCard
              icon="🌟"
              title="Bright Future"
              description="Helping students grow with confidence."
            />
          </View>
        </View>

        {/* 2. ADMISSION SECTION */}
        <View
          style={styles.admissionSection}
          nativeID="admissions"
          onLayout={(event) =>
            savePosition("admissions", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.admissionLabel}>
            ADMISSIONS OPEN
          </Text>

          <Text style={[styles.admissionTitle, { fontSize: isDesktop ? 58 : 38, lineHeight: isDesktop ? 72 : 48 }]}>
            Begin Your Child's{"\n"}Learning Journey
          </Text>

          <Text style={styles.admissionText}>
            Begin your child's learning journey at Kindergarten Saadia's. Click below to submit an online admission inquiry directly to our administrative team.
          </Text>

          <Pressable
            style={styles.admissionButton}
            onPress={() => setAdmissionModalVisible(true)}
          >
            <Text style={styles.admissionButtonText}>
              Apply for Admission Online 📝
            </Text>
          </Pressable>
        </View>

        {/* 3. ABOUT US SECTION */}
        <View
          style={styles.aboutSection}
          nativeID="about"
          onLayout={(event) =>
            savePosition("about", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.sectionLabel}>ABOUT OUR SCHOOL</Text>

          <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 48 : 34, lineHeight: isDesktop ? 58 : 44 }]}>
            A Place Where Children Love To Learn
          </Text>

          <Text style={styles.aboutText}>
            Kindergarten Saadia's Montessori School is focused on
            providing a positive, supportive and engaging learning
            environment for children.
          </Text>

          <Text style={styles.aboutText}>
            Our goal is to encourage curiosity, creativity, confidence
            and a lifelong love for learning.
          </Text>

          <Pressable style={styles.darkButton}>
            <Text style={styles.darkButtonText}>
              Learn More About Us
            </Text>
          </Pressable>
        </View>

        {/* 4. PROGRAMS SECTION */}
        <View
          style={styles.programsSection}
          nativeID="programs"
          onLayout={(event) =>
            savePosition("programs", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.sectionLabel}>OUR PROGRAMS</Text>

          <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 48 : 34, lineHeight: isDesktop ? 58 : 44 }]}>
            Learning For Every Stage
          </Text>

          <Text style={styles.sectionDescription}>
            We aim to support children through different stages of
            their educational development.
          </Text>

          <View style={[styles.programGrid, { flexDirection: isDesktop ? "row" : "column" }]} nativeID="programs-grid">
            {programs.map((item, idx) => (
              <ProgramCard
                key={item.id || idx}
                number={item.number || String(idx + 1).padStart(2, "0")}
                title={item.title}
                description={item.description}
              />
            ))}
          </View>
        </View>

        {/* 5. WHY CHOOSE US SECTION */}
        <View
          style={styles.whySection}
          nativeID="why"
          onLayout={(event) =>
            savePosition("why", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.sectionLabel}>WHY CHOOSE US</Text>

          <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 48 : 34, lineHeight: isDesktop ? 58 : 44 }]}>
            More Than Just A School
          </Text>

          <View style={styles.whyList}>
            <WhyItem
              number="01"
              title="Student Focused"
              description="Every child is encouraged to learn and grow at their own pace."
            />

            <WhyItem
              number="02"
              title="Positive Environment"
              description="A safe, welcoming and supportive place for learning."
            />

            <WhyItem
              number="03"
              title="Holistic Growth"
              description="Supporting academic, creative and personal development."
            />
          </View>
        </View>

        {/* 6. ACTIVITIES SECTION */}
        <View
          style={styles.activitiesSection}
          nativeID="activities"
          onLayout={(event) =>
            savePosition("activities", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.sectionLabel}>LEARNING THROUGH EXPERIENCE</Text>
          <Text style={[styles.sectionTitle, { color: "#ffffff", fontSize: isDesktop ? 48 : 34, lineHeight: isDesktop ? 58 : 44 }]}>Learning Beyond the Classroom</Text>
          <Text style={[styles.sectionDescription, { color: "#d1d5db" }]}>
            We encourage young children to learn through exploration, practical
            activities, creativity, movement and social interaction.
          </Text>

          <View style={[styles.activityGrid, { flexDirection: isDesktop ? "row" : "column" }]} nativeID="activities-grid">
            <ActivityCard
              icon="🎨"
              title="Creative Learning"
              description="Art, crafts and imaginative activities help children express ideas and build confidence."
            />
            <ActivityCard
              icon="🔎"
              title="Discovery & Exploration"
              description="Hands-on experiences encourage curiosity, observation and independent thinking."
            />
            <ActivityCard
              icon="🤝"
              title="Social Development"
              description="Children develop communication, cooperation and positive relationships in a caring environment."
            />
            <ActivityCard
              icon="🏃"
              title="Active Childhood"
              description="Movement and play support healthy development while making learning enjoyable."
            />
          </View>
        </View>

        {/* 7. GALLERY SECTION */}
        <View
          style={styles.gallerySection}
          nativeID="gallery"
          onLayout={(event) =>
            savePosition("gallery", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.sectionLabel}>SCHOOL LIFE</Text>
          <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 48 : 34, lineHeight: isDesktop ? 58 : 44 }]}>Our Learning Gallery</Text>
          <Text style={styles.sectionDescription}>
            A space for classroom moments, activities, celebrations and
            memorable experiences at KSM.
          </Text>

          <View style={[styles.galleryGrid, { flexDirection: isDesktop ? "row" : "column" }]} nativeID="gallery-grid">
            {gallery.map((item, idx) => (
              <GalleryCard
                key={item.id || idx}
                image={item.image_url}
                title={item.title || "Learning Together"}
              />
            ))}
          </View>

          <Text style={styles.galleryNote}>
            Replace these sample images with your school's own photographs when
            you are ready.
          </Text>
        </View>

        {/* 8. TESTIMONIALS SECTION */}
        <View
          style={styles.testimonialsSection}
          nativeID="testimonials"
          onLayout={(event) =>
            savePosition("testimonials", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.sectionLabel}>PARENTS & FAMILIES</Text>
          <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 48 : 34, lineHeight: isDesktop ? 58 : 44 }]}>What Families Value</Text>

          <View style={[styles.testimonialGrid, { flexDirection: isDesktop ? "row" : "column" }]} nativeID="testimonials-grid">
            {testimonials.map((item, idx) => (
              <TestimonialCard
                key={item.id || idx}
                quote={item.message}
                name={item.name || "KSM Parent"}
              />
            ))}
          </View>
        </View>

        {/* 9. CONTACT SECTION */}
        <View
          style={styles.contactSection}
          nativeID="contact"
          onLayout={(event) =>
            savePosition("contact", event.nativeEvent.layout.y)
          }
        >
          <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
          <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 48 : 34, lineHeight: isDesktop ? 58 : 44 }]}>Visit Kindergarten Saadia's</Text>
          <Text style={styles.contactDescription}>
            Kindergarten Saadia's Montessori School is listed as a Primary
            school in Haripur, Khyber Pakhtunkhwa. Our public information also
            describes early child development programmes for children aged
            approximately 2.5 to 6 years.
          </Text>

          <View style={[styles.contactCards, { flexDirection: isDesktop ? "row" : "column" }]} nativeID="contact-cards">
            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={styles.contactCardTitle}>Location</Text>
              <Text style={styles.contactCardText}>
                {siteSettings.contact?.location || "Haripur, Khyber Pakhtunkhwa, Pakistan"}
              </Text>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>🎓</Text>
              <Text style={styles.contactCardTitle}>School Level</Text>
              <Text style={styles.contactCardText}>
                {siteSettings.contact?.level || "Primary / Montessori education"}
              </Text>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>📱</Text>
              <Text style={styles.contactCardTitle}>Facebook</Text>
              <Text style={styles.contactCardText}>
                {siteSettings.contact?.facebookName || "Kindergarten Saadia's Montessori School"}
              </Text>
              <Pressable
                style={styles.facebookButton}
                onPress={() =>
                  Linking.openURL(
                    siteSettings.contact?.facebookUrl || "https://www.facebook.com/Kindergarten786/"
                  )
                }
              >
                <Text style={styles.facebookButtonText}>Open Facebook Page</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 10. FOOTER */}
        <View style={[styles.footer, { flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }]} nativeID="footer">
          <View>
            <Text style={styles.footerTitle}>
              {siteSettings.branding?.schoolName || "KINDERGARTEN SAADIA'S"}
            </Text>

            <Text style={styles.footerTagline}>
              {siteSettings.branding?.tagline || "Learn • Grow • Succeed"}
            </Text>
          </View>

          <View style={[styles.footerRight, { alignItems: isMobile ? "flex-start" : "flex-end", marginTop: isMobile ? 25 : 0 }]}>
            <Text style={styles.footerCopyright}>
              © 2026 {siteSettings.branding?.fullName || "Kindergarten Saadia's Montessori School"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <AdmissionModal
        visible={admissionModalVisible}
        onClose={() => setAdmissionModalVisible(false)}
      />
    </View>
  );
}

/* FEATURE CARD */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>

      <Text style={styles.featureTitle}>{title}</Text>

      <Text style={styles.featureDescription}>
        {description}
      </Text>
    </View>
  );
}

/* PROGRAM CARD */

function ProgramCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.programCard}>
      <Text style={styles.programNumber}>{number}</Text>

      <Text style={styles.programTitle}>{title}</Text>

      <Text style={styles.programDescription}>
        {description}
      </Text>
    </View>
  );
}

/* ACTIVITY CARD */

function ActivityCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.activityCard}>
      <Text style={styles.activityIcon}>{icon}</Text>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityDescription}>{description}</Text>
    </View>
  );
}

/* GALLERY CARD */

function GalleryCard({
  image,
  title,
}: {
  image: string;
  title: string;
}) {
  return (
    <View style={styles.galleryCard}>
      <Image source={{ uri: image }} style={styles.galleryImage} />
      <View style={styles.galleryCaption}>
        <Text style={styles.galleryCaptionText}>{title}</Text>
      </View>
    </View>
  );
}

/* TESTIMONIAL CARD */

function TestimonialCard({
  quote,
  name,
}: {
  quote: string;
  name: string;
}) {
  return (
    <View style={styles.testimonialCard}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.testimonialQuote}>{quote}</Text>
      <Text style={styles.testimonialName}>{name}</Text>
    </View>
  );
}

/* WHY ITEM */

function WhyItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.whyItem}>
      <Text style={styles.whyNumber}>{number}</Text>

      <View style={styles.whyContent}>
        <Text style={styles.whyTitle}>{title}</Text>

        <Text style={styles.whyDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffffff",
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    width: "100%",
    minWidth: "100%",
    alignItems: "stretch",
  },

  /* TOP BAR */

  topBar: {
    width: "100%",
    alignSelf: "stretch",
    height: 54,
    backgroundColor: "#123f62",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  topBarText: {
    color: "#ffffff",
    fontSize: 16,
  },

  contactText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  /* HEADER */

  header: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 120,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 68,
    height: 68,
    borderRadius: 40,
    backgroundColor: "#efa91f",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  logoText: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
  },

  schoolName: {
    color: "#123f62",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  tagline: {
    color: "#777777",
    fontSize: 15,
    marginTop: 4,
  },

  menuButton: {
    backgroundColor: "#123f62",
    borderRadius: 7,
    paddingHorizontal: 23,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    color: "#ffffff",
    fontSize: 19,
    marginRight: 7,
  },

  menuText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

  /* MENU */

  menuPanel: {
    position: "absolute",
    right: 40,
    top: 174,
    width: 220,
    backgroundColor: "#ffffff",
    zIndex: 20,
    elevation: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    borderRadius: 8,
    overflow: "hidden",
  },

  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  menuItemText: {
    color: "#123f62",
    fontSize: 16,
    fontWeight: "600",
  },

  /* 1. HERO */

  hero: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#123f62",
    minHeight: 560,
    paddingHorizontal: 20,
    paddingVertical: 60,
    position: "relative",
  },

  heroContent: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroLeft: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 5,
    paddingVertical: 15,
  },

  welcomeBadge: {
    borderWidth: 1,
    borderColor: "#efa91f",
    borderRadius: 30,
    alignSelf: "flex-start",
    paddingHorizontal: 21,
    paddingVertical: 11,
    marginBottom: 35,
  },

  welcomeBadgeText: {
    color: "#efa91f",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: "#ffffff",
    fontSize: 52,
    lineHeight: 64,
    fontWeight: "900",
    marginBottom: 27,
  },

  heroDescription: {
    color: "#e5edf4",
    fontSize: 21,
    lineHeight: 36,
    maxWidth: 700,
    marginBottom: 35,
  },

  heroButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  primaryButton: {
    backgroundColor: "#efa91f",
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 7,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 19,
    borderRadius: 7,
  },

  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  heroImageContainer: {
    width: "100%",
    maxWidth: 620,
    justifyContent: "center",
    alignItems: "center",
  },

  /* FEATURES HIGHLIGHTS (Inside Hero Section) */

  featuresSection: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    marginTop: 50,
    paddingVertical: 35,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 25,
  },

  featureCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 35,
    paddingVertical: 35,
    minHeight: 245,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },

  featureIcon: {
    fontSize: 45,
    marginBottom: 20,
  },

  featureTitle: {
    color: "#123f62",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },

  featureDescription: {
    color: "#707070",
    fontSize: 18,
    lineHeight: 29,
    textAlign: "center",
  },

  /* 2. ADMISSIONS */

  admissionSection: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 500,
    backgroundColor: "#efa91f",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
    position: "relative",
  },

  admissionLabel: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 2.5,
    marginBottom: 30,
  },

  admissionTitle: {
    color: "#ffffff",
    fontSize: 48,
    lineHeight: 62,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 28,
  },

  admissionText: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 32,
    textAlign: "center",
    maxWidth: 850,
    marginBottom: 40,
  },

  admissionButton: {
    backgroundColor: "#123f62",
    borderRadius: 7,
    paddingHorizontal: 36,
    paddingVertical: 21,
  },

  admissionButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  /* 3. ABOUT */

  aboutSection: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 470,
    backgroundColor: "#ffffff",
    paddingVertical: 80,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  sectionLabel: {
    color: "#efa91f",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 25,
  },

  sectionTitle: {
    color: "#123f62",
    fontSize: 42,
    lineHeight: 52,
    fontWeight: "900",
    textAlign: "center",
    maxWidth: 1100,
    marginBottom: 25,
  },

  aboutText: {
    color: "#686868",
    fontSize: 19,
    lineHeight: 34,
    textAlign: "center",
    maxWidth: 1000,
    marginBottom: 18,
  },

  darkButton: {
    backgroundColor: "#123f62",
    borderRadius: 7,
    paddingHorizontal: 32,
    paddingVertical: 17,
    marginTop: 15,
  },

  darkButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },

  /* 4. PROGRAMS */

  programsSection: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#f4f6f8",
    paddingVertical: 80,
    paddingHorizontal: 25,
    alignItems: "center",
    position: "relative",
  },

  sectionDescription: {
    color: "#6c6c6c",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 60,
    maxWidth: 900,
    lineHeight: 32,
  },

  programGrid: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    gap: 30,
  },

  programCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    minHeight: 300,
    borderRadius: 10,
    padding: 40,
    justifyContent: "center",
  },

  programNumber: {
    color: "#efa91f",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 35,
  },

  programTitle: {
    color: "#123f62",
    fontSize: 28,
    lineHeight: 39,
    fontWeight: "900",
    marginBottom: 20,
  },

  programDescription: {
    color: "#707070",
    fontSize: 18,
    lineHeight: 31,
  },

  /* 5. WHY */

  whySection: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 560,
    paddingVertical: 80,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    position: "relative",
  },

  whyList: {
    width: "100%",
    maxWidth: 1050,
    marginTop: 25,
  },

  whyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 20,
  },

  whyNumber: {
    color: "#efa91f",
    fontSize: 28,
    fontWeight: "900",
    width: 90,
  },

  whyContent: {
    flex: 1,
  },

  whyTitle: {
    color: "#123f62",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 10,
  },

  whyDescription: {
    color: "#707070",
    fontSize: 18,
    lineHeight: 30,
  },

  /* 6. ACTIVITIES */

  activitiesSection: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#123f62",
    paddingVertical: 85,
    paddingHorizontal: 25,
    alignItems: "center",
    position: "relative",
  },

  activityGrid: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 25,
  },

  activityCard: {
    flex: 1,
    minWidth: 260,
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 30,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  activityIcon: {
    fontSize: 46,
    marginBottom: 18,
  },

  activityTitle: {
    color: "#123f62",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },

  activityDescription: {
    color: "#707070",
    fontSize: 16,
    lineHeight: 27,
    textAlign: "center",
  },

  /* 7. GALLERY */

  gallerySection: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#f4f6f8",
    paddingVertical: 85,
    paddingHorizontal: 25,
    alignItems: "center",
    position: "relative",
  },

  galleryGrid: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 25,
  },

  galleryCard: {
    flex: 1,
    minWidth: 260,
    maxWidth: 560,
    height: 300,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
  },

  galleryImage: {
    width: "100%",
    height: "100%",
  },

  galleryCaption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(18,63,98,0.88)",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  galleryCaptionText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },

  galleryNote: {
    color: "#777777",
    fontSize: 14,
    marginTop: 25,
    textAlign: "center",
  },

  /* 8. TESTIMONIALS */

  testimonialsSection: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#ffffff",
    paddingVertical: 85,
    paddingHorizontal: 25,
    alignItems: "center",
    position: "relative",
  },

  testimonialGrid: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    gap: 25,
  },

  testimonialCard: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    borderRadius: 14,
    padding: 35,
    minHeight: 260,
    justifyContent: "center",
  },

  quoteMark: {
    color: "#efa91f",
    fontSize: 58,
    fontWeight: "900",
    lineHeight: 55,
  },

  testimonialQuote: {
    color: "#123f62",
    fontSize: 19,
    lineHeight: 31,
    fontWeight: "600",
    marginBottom: 22,
  },

  testimonialName: {
    color: "#efa91f",
    fontSize: 15,
    fontWeight: "900",
  },

  /* 9. CONTACT */

  contactSection: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#eef3f6",
    paddingVertical: 85,
    paddingHorizontal: 25,
    alignItems: "center",
    position: "relative",
  },

  contactDescription: {
    color: "#666666",
    fontSize: 18,
    lineHeight: 31,
    maxWidth: 900,
    textAlign: "center",
    marginBottom: 45,
  },

  contactCards: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    gap: 25,
  },

  contactCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 30,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  },

  contactIcon: {
    fontSize: 38,
    marginBottom: 15,
  },

  contactCardTitle: {
    color: "#123f62",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },

  contactCardText: {
    color: "#707070",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
  },

  facebookButton: {
    backgroundColor: "#123f62",
    borderRadius: 7,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 18,
  },

  facebookButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  /* 10. FOOTER */

  footer: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#123f62",
    paddingHorizontal: 40,
    paddingVertical: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },

  footerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },

  footerTagline: {
    color: "#d6d6d6",
    fontSize: 14,
    marginTop: 5,
  },

  footerCopyright: {
    color: "#d6d6d6",
    fontSize: 14,
  },

  footerRight: {
    alignItems: "flex-end",
  },
});