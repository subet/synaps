import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type FireLevel = 'none' | 'small' | 'medium' | 'large';

function getFireLevel(streak: number): FireLevel {
  if (streak <= 0) return 'none';
  if (streak <= 7) return 'small';
  if (streak <= 30) return 'medium';
  return 'large';
}

const fireSmall = require('../../../assets/images/fire-small.gif');
const fireBig = require('../../../assets/images/fire-big.gif');
const fireBigger = require('../../../assets/images/fire-bigger.gif');

interface StreakFireProps {
  streak: number;
}

export function StreakFire({ streak }: StreakFireProps) {
  const level = getFireLevel(streak);

  if (level === 'none') {
    return (
      <View style={styles.container}>
        <View style={styles.coldLogs}>
          <View style={[styles.logCold, { transform: [{ rotate: '-18deg' }] }]} />
          <View style={[styles.logCold, { transform: [{ rotate: '18deg' }], marginTop: -2 }]} />
        </View>
      </View>
    );
  }

  const source = level === 'small' ? fireSmall : level === 'medium' ? fireBig : fireBigger;
  const size = level === 'small' ? 36 : level === 'medium' ? 50 : 64;

  return (
    <View style={styles.container}>
      <Image source={source} style={{ width: size, height: size }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coldLogs: {
    alignItems: 'center',
  },
  logCold: {
    width: 22,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#B0A89A',
  },
});
