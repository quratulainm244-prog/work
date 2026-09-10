import { AdmissionModal } from "@/components/AdmissionModal";
import { HeroAnimation } from "@/components/HeroAnimation";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [admissionModalVisible, setAdmissionModalVisible] = useState(false);

  const styles = useMemo(() => getStyles(width), [width]);

  const [sectionPositions, setSectionPositions] = useState<{
    admissions?: number;
    about?: number;
    programs?: number;
    why?: number;
    activities?: number;
    gallery?: number;
    testimonials?: number;
    contact?: number;
  }>({});

  const goToSection = (section: keyof typeof sectionPositions) => {
    setMenuOpen(false);

    if (Platform.OS === "web" && typeof document !== "undefined") {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

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
    <StylesContext.Provider value={styles}>
      <View style={styles.page}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* TOP BAR */}
          <View style={styles.topBar}>
            <Text style={styles.topBarText}>
              Welcome to Kindergarten Saadia's Montessori School
            </Text>

            <SupabaseStatus />

            <Pressable onPress={() => goToSection("contact")}>
              <Text style={styles.contactText}>Contact Us</Text>
            </Pressable>
          </View>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>K</Text>
              </View>

              <View>
                <Text style={styles.schoolName}>
                  KINDERGARTEN SAADIA'S
                </Text>

                <Text style={styles.tagline}>
                  Learn • Grow • Succeed
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
          <View
            nativeID="hero"
            // @ts-ignore
            id="hero"
            style={styles.hero}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <View style={styles.welcomeBadge}>
                  <Text style={styles.welcomeBadgeText}>
                    WELCOME TO KINDERGARTEN SAADIA'S
                  </Text>
                </View>

                <Text style={styles.heroTitle}>
                  Building Bright{"\n"}Futures Together
                </Text>

                <Text style={styles.heroDescription}>
                  A nurturing learning environment where children can
                  learn, explore, grow and develop the confidence to
                  succeed.
                </Text>

                <View style={styles.heroButtons}>
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

              <View style={styles.heroImageContainer}>
                <HeroAnimation />
              </View>
            </View>
          </View>

          {/* FEATURES CARDS (Part of Hero Intro) */}
          <View style={styles.featuresSection}>
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

          {/* 2. ADMISSION SECTION */}
          <View
            nativeID="admissions"
            // @ts-ignore
            id="admissions"
            style={styles.admissionSection}
            onLayout={(event) =>
              savePosition("admissions", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.admissionLabel}>
              ADMISSIONS OPEN
            </Text>

            <Text style={styles.admissionTitle}>
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

          {/* 3. ABOUT US */}
          <View
            nativeID="about"
            // @ts-ignore
            id="about"
            style={styles.aboutSection}
            onLayout={(event) =>
              savePosition("about", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.sectionLabel}>ABOUT OUR SCHOOL</Text>

            <Text style={styles.sectionTitle}>
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

            <Pressable
              style={styles.darkButton}
              onPress={() => goToSection("programs")}
            >
              <Text style={styles.darkButtonText}>
                Learn More About Us
              </Text>
            </Pressable>
          </View>

          {/* 4. PROGRAMS */}
          <View
            nativeID="programs"
            // @ts-ignore
            id="programs"
            style={styles.programsSection}
            onLayout={(event) =>
              savePosition("programs", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.sectionLabel}>OUR PROGRAMS</Text>

            <Text style={styles.sectionTitle}>
              Learning For Every Stage
            </Text>

            <Text style={styles.sectionDescription}>
              We aim to support children through different stages of
              their educational development.
            </Text>

            <View style={styles.programGrid}>
              <ProgramCard
                number="01"
                title="Early Learning"
                description="Fun, creative and engaging learning experiences for young children."
              />

              <ProgramCard
                number="02"
                title="Primary Education"
                description="Building strong academic and personal foundations."
              />

              <ProgramCard
                number="03"
                title="Student Development"
                description="Encouraging confidence, creativity and important life skills."
              />
            </View>
          </View>

          {/* 5. WHY CHOOSE US */}
          <View
            nativeID="why"
            // @ts-ignore
            id="why"
            style={styles.whySection}
            onLayout={(event) =>
              savePosition("why", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.sectionLabel}>WHY CHOOSE US</Text>

            <Text style={styles.sectionTitle}>
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

          {/* 6. ACTIVITIES */}
          <View
            nativeID="activities"
            // @ts-ignore
            id="activities"
            style={styles.activitiesSection}
            onLayout={(event) =>
              savePosition("activities", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.sectionLabel}>LEARNING THROUGH EXPERIENCE</Text>
            <Text style={styles.sectionTitle}>Learning Beyond the Classroom</Text>
            <Text style={styles.sectionDescription}>
              We encourage young children to learn through exploration, practical
              activities, creativity, movement and social interaction.
            </Text>

            <View style={styles.activityGrid}>
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

          {/* 7. GALLERY */}
          <View
            nativeID="gallery"
            // @ts-ignore
            id="gallery"
            style={styles.gallerySection}
            onLayout={(event) =>
              savePosition("gallery", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.sectionLabel}>SCHOOL LIFE</Text>
            <Text style={styles.sectionTitle}>Our Learning Gallery</Text>
            <Text style={styles.sectionDescription}>
              A space for classroom moments, activities, celebrations and
              memorable experiences at KSM.
            </Text>

            <View style={styles.galleryGrid}>
              <GalleryCard
                image="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80"
                title="Learning Together"
              />
              <GalleryCard
                image="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80"
                title="Young Learners"
              />
              <GalleryCard
                image="https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=80"
                title="Creative Activities"
              />
              <GalleryCard
                image="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80"
                title="Classroom Life"
              />
            </View>

            <Text style={styles.galleryNote}>
              Replace these sample images with your school's own photographs when
              you are ready.
            </Text>
          </View>

          {/* 8. TESTIMONIALS */}
          <View
            nativeID="testimonials"
            // @ts-ignore
            id="testimonials"
            style={styles.testimonialsSection}
            onLayout={(event) =>
              savePosition("testimonials", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.sectionLabel}>PARENTS & FAMILIES</Text>
            <Text style={styles.sectionTitle}>What Families Value</Text>

            <View style={styles.testimonialGrid}>
              <TestimonialCard
                quote="A warm and caring environment where children can learn with confidence."
                name="KSM Parent"
              />
              <TestimonialCard
                quote="The focus on early development, activities and individual attention makes learning enjoyable."
                name="KSM Family"
              />
              <TestimonialCard
                quote="A positive beginning for a child's educational journey."
                name="KSM Parent"
              />
            </View>
          </View>

          {/* 9. CONTACT */}
          <View
            nativeID="contact"
            // @ts-ignore
            id="contact"
            style={styles.contactSection}
            onLayout={(event) =>
              savePosition("contact", event.nativeEvent.layout.y)
            }
          >
            <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
            <Text style={styles.sectionTitle}>Visit Kindergarten Saadia's</Text>
            <Text style={styles.contactDescription}>
              Kindergarten Saadia's Montessori School is listed as a Primary
              school in Haripur, Khyber Pakhtunkhwa. Our public information also
              describes early child development programmes for children aged
              approximately 2.5 to 6 years.
            </Text>

            <View style={styles.contactCards}>
              <View style={styles.contactCard}>
                <Text style={styles.contactIcon}>📍</Text>
                <Text style={styles.contactCardTitle}>Location</Text>
                <Text style={styles.contactCardText}>Haripur, Khyber Pakhtunkhwa, Pakistan</Text>
              </View>

              <View style={styles.contactCard}>
                <Text style={styles.contactIcon}>🎓</Text>
                <Text style={styles.contactCardTitle}>School Level</Text>
                <Text style={styles.contactCardText}>Primary / Montessori education</Text>
              </View>

              <View style={styles.contactCard}>
                <Text style={styles.contactIcon}>📱</Text>
                <Text style={styles.contactCardTitle}>Facebook</Text>
                <Text style={styles.contactCardText}>Kindergarten Saadia's Montessori School</Text>
                <Pressable
                  style={styles.facebookButton}
                  onPress={() =>
                    Linking.openURL("https://www.facebook.com/Kindergarten786/")
                  }
                >
                  <Text style={styles.facebookButtonText}>Open Facebook Page</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* 10. FOOTER */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerTitle}>
                KINDERGARTEN SAADIA'S
              </Text>

              <Text style={styles.footerTagline}>
                Learn • Grow • Succeed
              </Text>
            </View>

            <View style={styles.footerRight}>
              <Text style={styles.footerCopyright}>
                © 2026 Kindergarten Saadia's Montessori School
              </Text>
            </View>
          </View>
        </ScrollView>

        <AdmissionModal
          visible={admissionModalVisible}
          onClose={() => setAdmissionModalVisible(false)}
        />
      </View>
    </StylesContext.Provider>
  );
}

/* SUBCOMPONENTS WITH CONTEXT STYLES */

const StylesContext = createContext<ReturnType<typeof getStyles>>(getStyles(1200));
function useAppStyles() {
  return useContext(StylesContext);
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

function ProgramCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.programCard}>
      <Text style={styles.programNumber}>{number}</Text>
      <Text style={styles.programTitle}>{title}</Text>
      <Text style={styles.programDescription}>{description}</Text>
    </View>
  );
}

function ActivityCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.activityCard}>
      <Text style={styles.activityIcon}>{icon}</Text>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityDescription}>{description}</Text>
    </View>
  );
}

function GalleryCard({
  image,
  title,
}: {
  image: string;
  title: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.galleryCard}>
      <Image source={{ uri: image }} style={styles.galleryImage} />
      <View style={styles.galleryCaption}>
        <Text style={styles.galleryCaptionText}>{title}</Text>
      </View>
    </View>
  );
}

function TestimonialCard({
  quote,
  name,
}: {
  quote: string;
  name: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.testimonialCard}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.testimonialQuote}>{quote}</Text>
      <Text style={styles.testimonialName}>{name}</Text>
    </View>
  );
}

function WhyItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.whyItem}>
      <Text style={styles.whyNumber}>{number}</Text>
      <View style={styles.whyContent}>
        <Text style={styles.whyTitle}>{title}</Text>
        <Text style={styles.whyDescription}>{description}</Text>
      </View>
    </View>
  );
}

/* DYNAMIC RESPONSIVE STYLES FACTORY */

function getStyles(width: number) {
  const isDesktop = width > 800;
  const isLarge = width > 900;
  const isExtraLarge = width > 1000;
  const isMedium = width > 600;
  const isTablet = width > 700;

  return StyleSheet.create({
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
      flexGrow: 1,
      width: "100%",
      minWidth: "100%",
    },

    /* TOP BAR */
    topBar: {
      height: 54,
      width: "100%",
      backgroundColor: "#123f62",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isLarge ? 38 : 20,
    },

    topBarText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "500",
    },

    contactText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "700",
    },

    /* HEADER */
    header: {
      width: "100%",
      minHeight: 120,
      backgroundColor: "#ffffff",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isLarge ? 40 : 20,
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
      fontSize: isLarge ? 27 : 20,
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
      width: 240,
      backgroundColor: "#ffffff",
      zIndex: 100,
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
      backgroundColor: "#123f62",
      minHeight: 560,
      paddingHorizontal: isLarge ? 7 : 20,
      paddingVertical: 60,
    },

    heroContent: {
      width: "90%",
      maxWidth: 1350,
      alignSelf: "center",
      flexDirection: isDesktop ? "row" : "column",
      alignItems: "center",
      justifyContent: "space-between",
    },

    heroLeft: {
      flex: 1,
      paddingHorizontal: isDesktop ? 25 : 5,
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
      fontSize: isExtraLarge ? 66 : isDesktop ? 52 : 40,
      lineHeight: isExtraLarge ? 82 : isDesktop ? 64 : 50,
      fontWeight: "900",
      marginBottom: 27,
    },

    heroDescription: {
      color: "#e5edf4",
      fontSize: isDesktop ? 21 : 18,
      lineHeight: isDesktop ? 36 : 28,
      maxWidth: 700,
      marginBottom: 35,
    },

    heroButtons: {
      flexDirection: isMedium ? "row" : "column",
      alignItems: isMedium ? "center" : "stretch",
    },

    primaryButton: {
      backgroundColor: "#efa91f",
      paddingHorizontal: 32,
      paddingVertical: 20,
      borderRadius: 7,
      marginRight: isMedium ? 18 : 0,
      marginBottom: isMedium ? 0 : 14,
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
      flex: 0.9,
      marginTop: isDesktop ? 0 : 30,
      marginLeft: isDesktop ? 35 : 0,
      width: isDesktop ? undefined : "100%",
      maxWidth: 600,
      justifyContent: "center",
      alignItems: "center",
    },

    /* FEATURES */
    featuresSection: {
      width: "100%",
      backgroundColor: "#f3f6f8",
      paddingVertical: 55,
      paddingHorizontal: 20,
      flexDirection: isDesktop ? "row" : "column",
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
      maxWidth: isDesktop ? 390 : undefined,
      alignSelf: "center",
      width: isDesktop ? undefined : "100%",
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
      minHeight: 500,
      backgroundColor: "#efa91f",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
      paddingHorizontal: 20,
    },

    admissionLabel: {
      color: "#ffffff",
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: 2.5,
      marginBottom: 30,
      textAlign: "center",
    },

    admissionTitle: {
      color: "#ffffff",
      fontSize: isLarge ? 58 : isDesktop ? 48 : 36,
      lineHeight: isLarge ? 73 : isDesktop ? 60 : 46,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 28,
    },

    admissionText: {
      color: "#ffffff",
      fontSize: isDesktop ? 20 : 17,
      lineHeight: isDesktop ? 32 : 28,
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
      textAlign: "center",
    },

    /* 3. ABOUT */
    aboutSection: {
      width: "100%",
      minHeight: 470,
      backgroundColor: "#ffffff",
      paddingVertical: 80,
      paddingHorizontal: 25,
      alignItems: "center",
      justifyContent: "center",
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
      fontSize: isLarge ? 48 : isDesktop ? 40 : 32,
      lineHeight: isLarge ? 58 : isDesktop ? 50 : 40,
      fontWeight: "900",
      textAlign: "center",
      maxWidth: 1100,
      marginBottom: 25,
    },

    aboutText: {
      color: "#686868",
      fontSize: isDesktop ? 19 : 17,
      lineHeight: isDesktop ? 34 : 28,
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
      backgroundColor: "#f4f6f8",
      paddingVertical: 80,
      paddingHorizontal: 25,
      alignItems: "center",
    },

    sectionDescription: {
      color: "#6c6c6c",
      fontSize: isDesktop ? 20 : 17,
      textAlign: "center",
      marginBottom: 60,
      maxWidth: 900,
      lineHeight: isDesktop ? 32 : 26,
    },

    programGrid: {
      width: "100%",
      maxWidth: 1200,
      alignSelf: "center",
      flexDirection: isDesktop ? "row" : "column",
      gap: 30,
    },

    programCard: {
      flex: 1,
      backgroundColor: "#ffffff",
      minHeight: 300,
      borderRadius: 10,
      padding: isDesktop ? 40 : 25,
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
      fontSize: isDesktop ? 28 : 22,
      lineHeight: isDesktop ? 39 : 30,
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
      minHeight: 560,
      paddingVertical: 80,
      paddingHorizontal: 25,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
    },

    whyList: {
      width: "100%",
      maxWidth: 1050,
      alignSelf: "center",
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
      width: isDesktop ? 90 : 60,
    },

    whyContent: {
      flex: 1,
    },

    whyTitle: {
      color: "#123f62",
      fontSize: isDesktop ? 26 : 21,
      fontWeight: "900",
      marginBottom: 10,
    },

    whyDescription: {
      color: "#707070",
      fontSize: isDesktop ? 18 : 16,
      lineHeight: isDesktop ? 30 : 25,
    },

    /* 6. ACTIVITIES */
    activitiesSection: {
      width: "100%",
      backgroundColor: "#123f62",
      paddingVertical: 85,
      paddingHorizontal: 25,
      alignItems: "center",
    },

    activityGrid: {
      width: "100%",
      maxWidth: 1200,
      alignSelf: "center",
      flexDirection: isDesktop ? "row" : "column",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 25,
    },

    activityCard: {
      flex: 1,
      minWidth: isDesktop ? 250 : undefined,
      maxWidth: isDesktop ? 280 : undefined,
      backgroundColor: "#ffffff",
      borderRadius: 14,
      padding: 30,
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      width: isDesktop ? undefined : "100%",
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
      backgroundColor: "#f4f6f8",
      paddingVertical: 85,
      paddingHorizontal: 25,
      alignItems: "center",
    },

    galleryGrid: {
      width: "100%",
      maxWidth: 1200,
      alignSelf: "center",
      flexDirection: isDesktop ? "row" : "column",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 25,
    },

    galleryCard: {
      flex: 1,
      minWidth: isDesktop ? 260 : undefined,
      maxWidth: isDesktop ? 560 : undefined,
      height: isDesktop ? 300 : 240,
      backgroundColor: "#ffffff",
      borderRadius: 14,
      overflow: "hidden",
      width: isDesktop ? undefined : "100%",
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
      backgroundColor: "#ffffff",
      paddingVertical: 85,
      paddingHorizontal: 25,
      alignItems: "center",
    },

    testimonialGrid: {
      width: "100%",
      maxWidth: 1200,
      alignSelf: "center",
      flexDirection: isDesktop ? "row" : "column",
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
      backgroundColor: "#eef3f6",
      paddingVertical: 85,
      paddingHorizontal: 25,
      alignItems: "center",
    },

    contactDescription: {
      color: "#666666",
      fontSize: isDesktop ? 18 : 16,
      lineHeight: isDesktop ? 31 : 26,
      maxWidth: 900,
      textAlign: "center",
      marginBottom: 45,
    },

    contactCards: {
      width: "100%",
      maxWidth: 1200,
      alignSelf: "center",
      flexDirection: isDesktop ? "row" : "column",
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
      backgroundColor: "#123f62",
      paddingHorizontal: isDesktop ? 40 : 20,
      paddingVertical: 45,
      flexDirection: isTablet ? "row" : "column",
      justifyContent: "space-between",
      alignItems: isTablet ? "center" : "flex-start",
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
      alignItems: isTablet ? "flex-end" : "flex-start",
      marginTop: isTablet ? 0 : 25,
    },
  });
}