import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

interface CardProps {
  id: number;
  name: string;
  age: number;
  image: string;
}

// Sample user profiles
const profiles: CardProps[] = [
  { id: 1, name: 'Sophia', age: 24, image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Emma', age: 27, image: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: 3, name: 'Liam', age: 26, image: 'https://randomuser.me/api/portraits/men/33.jpg' },
];

export default function HomeScreen() {
  const position = useRef(new Animated.ValueXY()).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const swipeCard = (direction: 'left' | 'right') => {
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1 < profiles.length ? prevIndex + 1 : 0));
      position.setValue({ x: 0, y: 0 });
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {profiles
        .map((profile, index) => {
          if (index < currentIndex) return null; // Hide previous cards

          const isTopCard = index === currentIndex;
          const cardStyle = isTopCard
            ? {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  {
                    rotate: position.x.interpolate({
                      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                      outputRange: ['-30deg', '0deg', '30deg'],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              }
            : { transform: [{ scale: 0.95 }] };

          return (
            <Animated.View
              key={profile.id}
              style={[styles.card, cardStyle]}
              {...(isTopCard ? panResponder.panHandlers : {})}
            >
              <Image source={{ uri: profile.image }} style={styles.image} />
              <Text style={styles.name}>
                {profile.name}, {profile.age}
              </Text>
            </Animated.View>
          );
        })
        .reverse()}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  card: {
    position: 'absolute',
    width: 300,
    height: 400,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
