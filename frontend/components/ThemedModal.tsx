import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';

interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface ThemedModalProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: ModalAction[];
  onClose: () => void;
}

export default function ThemedModal({ visible, title, message, actions, onClose }: ThemedModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.actions}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.button, action.variant === 'primary' ? styles.primary : styles.secondary]}
                onPress={action.onPress}
              >
                <Text style={[styles.buttonText, action.variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  card: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.35)',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: '#D0D0D0',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 16,
  },
  actions: {
    gap: 10,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#FF7A00',
  },
  secondary: {
    backgroundColor: '#2B2B2B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryText: {
    color: '#000000',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
});
