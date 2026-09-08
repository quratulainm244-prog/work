import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { HERO_FRAMES, TOTAL_HERO_FRAMES } from '@/constants/hero-frames';

// Slow, smooth, and cinematic frame speed (100ms per frame = 10 FPS)
const CINEMATIC_FRAME_DURATION_MS = 100;
// Extended hold on the finished KSM School Crest so visitors can admire it
const CREST_REVEAL_PAUSE_MS = 3600;

export function HeroAnimation() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Native animation values for 3D horizontal entrance & settling
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Interactive 3D mouse tilt values (for web)
  const [mouseTilt, setMouseTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Preload all frames in browser memory for flicker-free rendering
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      HERO_FRAMES.forEach((frame) => {
        try {
          const img = new (window as any).Image();
          const src =
            typeof frame === 'string'
              ? frame
              : (frame as any)?.uri || (frame as any)?.default || frame;
          if (src && typeof src === 'string') {
            img.src = src;
          }
        } catch {
          // ignore
        }
      });
    }
  }, []);

  // 3D Horizontal Pop Entrance Animation
  useEffect(() => {
    // 1. Entrance Pop & Natural Settle
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: true,
    }).start(() => {
      // 2. Start gentle, continuous 3D breathing/floating loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3200,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [entranceAnim, floatAnim]);

  // Slow, smooth, cinematic frame sequence loop
  useEffect(() => {
    const isLastFrame = currentFrame === TOTAL_HERO_FRAMES - 1;
    const delay = isLastFrame ? CREST_REVEAL_PAUSE_MS : CINEMATIC_FRAME_DURATION_MS;

    timerRef.current = setTimeout(() => {
      setCurrentFrame((prev) => (prev + 1) % TOTAL_HERO_FRAMES);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentFrame]);

  // Web interactive mouse parallax handler
  const handleMouseMove = (e: any) => {
    if (Platform.OS !== 'web') return;
    const rect = e.currentTarget?.getBoundingClientRect?.();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles (max ±4.5 degrees)
    const rotateY = ((x - centerX) / centerX) * 4.5;
    const rotateX = -((y - centerY) / centerY) * 4.5;

    setMouseTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    if (Platform.OS !== 'web') return;
    setMouseTilt({ rotateX: 0, rotateY: 0 });
  };

  // Interpolated entrance values:
  // Starts 220px to the right, tilted in 3D perspective (-28deg rotateY, 8deg rotateX, scale 0.82)
  // Pops horizontally onto screen, overshoots softly (-12px), and settles naturally at 0.
  const translateX = entranceAnim.interpolate({
    inputRange: [0, 0.6, 0.82, 1],
    outputRange: [220, -12, 4, 0],
  });

  const rotateY = entranceAnim.interpolate({
    inputRange: [0, 0.6, 0.82, 1],
    outputRange: ['-28deg', '4deg', '-1.5deg', '0deg'],
  });

  const rotateX = entranceAnim.interpolate({
    inputRange: [0, 0.6, 0.82, 1],
    outputRange: ['8deg', '-2deg', '1deg', '0deg'],
  });

  const scale = entranceAnim.interpolate({
    inputRange: [0, 0.6, 0.82, 1],
    outputRange: [0.82, 1.035, 0.995, 1],
  });

  const opacity = entranceAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.9, 1],
  });

  // Natural organic vertical float settling
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.stageContainer}>
      {/* Hidden pre-render buffer for instant zero-flicker decoding */}
      <View style={styles.hiddenBuffer} pointerEvents="none">
        {HERO_FRAMES.map((src, index) => (
          <Image
            key={index}
            source={src}
            style={styles.bufferImage}
            priority={index < 8 ? 'high' : 'normal'}
          />
        ))}
      </View>

      {/* 3D Ambient Studio Backlight Glow */}
      <View
        style={[
          styles.ambientBacklight,
          isWeb ? ({ className: 'ksm-studio-glow' } as any) : undefined,
        ]}
        pointerEvents="none"
      />

      {/* Main 3D Card with horizontal pop entrance and depth tilt */}
      <Animated.View
        style={[
          styles.animatedCardWrapper,
          {
            opacity,
            transform: [
              { perspective: 1200 },
              { translateX },
              { translateY },
              { rotateY: isWeb && (mouseTilt.rotateY !== 0) ? `${mouseTilt.rotateY}deg` : (rotateY as any) },
              { rotateX: isWeb && (mouseTilt.rotateX !== 0) ? `${mouseTilt.rotateX}deg` : (rotateX as any) },
              { scale },
            ],
          },
        ]}
        {...(isWeb
          ? {
              onMouseMove: handleMouseMove,
              onMouseLeave: handleMouseLeave,
            }
          : {})}
      >
        <View style={styles.cardBevelFrame}>
          {/* Inner Canvas Container */}
          <View style={styles.canvasContainer}>
            {/* The Cinematic Animation Frame */}
            <Image
              source={HERO_FRAMES[currentFrame]}
              style={styles.frameImage}
              contentFit="cover"
              transition={0}
              priority="high"
            />

            {/* Subtle Studio Specular Sheen (gloss sweep across glass) */}
            <View
              style={[
                styles.specularSheen,
                isWeb ? ({ className: 'ksm-studio-sheen-sweep' } as any) : undefined,
              ]}
              pointerEvents="none"
            />

            {/* Cinematic Perimeter Studio Vignette */}
            <View style={styles.cinematicVignette} pointerEvents="none" />

            {/* Subtle KSM Studio Gold Brand Accent Watermark */}
            <View style={styles.studioCornerAccent} pointerEvents="none">
              <View style={styles.accentGoldDot} />
              <View style={styles.accentGoldLine} />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 14,
  },
  hiddenBuffer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    zIndex: -1,
  },
  bufferImage: {
    width: 1,
    height: 1,
  },
  /* Ambient glowing aura behind the 3D card */
  ambientBacklight: {
    position: 'absolute',
    width: '92%',
    height: '84%',
    borderRadius: 36,
    backgroundColor: 'rgba(239, 169, 31, 0.28)',
    shadowColor: '#efa91f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 40,
    elevation: 10,
    zIndex: 0,
  },
  /* 3D Animated Card Container */
  animatedCardWrapper: {
    width: '100%',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Polished KSM Studio Beveled Frame */
  cardBevelFrame: {
    width: '100%',
    borderRadius: 26,
    padding: 6,
    backgroundColor: '#0a1d30',
    borderWidth: 2,
    borderColor: '#efa91f',
    shadowColor: '#0a1e30',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.45,
    shadowRadius: 36,
    elevation: 16,
  },
  /* Canvas Screen Ratio Container */
  canvasContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#071626',
  },
  /* The active animation frame */
  frameImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  /* Studio Specular Sheen (diagonal light reflection sweep) */
  specularSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '45%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ skewX: '-25deg' }, { translateX: -200 }],
    zIndex: 4,
  },
  /* Soft inner studio vignette for cinematic depth */
  cinematicVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 169, 31, 0.35)',
    zIndex: 5,
  },
  /* Refined KSM Studio minimal corner insignia */
  studioCornerAccent: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 6,
    opacity: 0.85,
  },
  accentGoldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#efa91f',
  },
  accentGoldLine: {
    width: 22,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(239, 169, 31, 0.7)',
  },
});
