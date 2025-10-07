// components/ReplyModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

const PRIMARY = '#3cc172';

export default function ReplyModal({ visible, onClose, onSend, booking }) {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    const body = msg.trim();
    if (!body) return Alert.alert('Message required', 'Type a message to send.');
    try {
      setSending(true);
      await onSend(body);
      setMsg('');
      onClose?.();
    } catch (e) {
      Alert.alert('Send failed', e.message || 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-4" style={{ maxHeight: '85%' }}>
          <View className="items-center mb-2">
            <View style={{ width: 56, height: 5, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
          </View>

          <Text className="text-lg font-extrabold">Reply to {booking?.name || 'Requester'}</Text>
          <Text className="text-[12px] text-gray-600 mb-3">
            {booking?.property?.title || 'Property'} · {booking?.property?.address || '-'}
          </Text>

          <View className="bg-gray-100 rounded-xl px-3 py-2" style={{ minHeight: 140 }}>
            <TextInput
              value={msg}
              onChangeText={setMsg}
              placeholder="Type your reply..."
              multiline
              style={{ minHeight: 120 }}
            />
          </View>

          <View className="flex-row mt-3" style={{ gap: 10 }}>
            <TouchableOpacity
              disabled={sending}
              onPress={onClose}
              className="flex-1 py-3 rounded-xl items-center"
              style={{ backgroundColor: '#F3F4F6' }}>
              <Text className="font-semibold" style={{ color: '#111827' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={sending}
              onPress={send}
              className={`flex-1 py-3 rounded-xl items-center ${sending ? 'opacity-70' : ''}`}
              style={{ backgroundColor: PRIMARY }}>
              {sending ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Send</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}