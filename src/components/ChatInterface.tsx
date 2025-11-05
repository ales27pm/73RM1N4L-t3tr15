import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { logError } from '../utils/logger';

/**
 * ChatInterface - A reusable chat component with streaming API support
 *
 * Features:
 * - Streaming response handling with proper error recovery
 * - Response body validation before iteration
 * - Partial content preservation on stream interruption
 * - AbortController support for request cancellation
 * - User-friendly error messages
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  apiEndpoint: string;
  apiKey?: string;
  onError?: (error: Error) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiEndpoint,
  apiKey,
  onError,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Check if response is ok before trying to read body
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Check if response has a body
      if (!response.body) {
        throw new Error('Response has no body. The API may not support streaming or returned an empty response.');
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update the assistant message with accumulated content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: accumulated }
                : m
            )
          );
        }
      } catch (streamError) {
        logError('Stream reading error', { context: 'ChatInterface' }, streamError);

        // If we got some content, keep it
        if (accumulated) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: accumulated + '\n\n[Stream interrupted]' }
                : m
            )
          );
        } else {
          // Remove the empty assistant message
          setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
          throw streamError;
        }
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));

      // Don't log abort errors (user cancelled)
      if (error.name !== 'AbortError') {
        logError('Failed to send message', { context: 'ChatInterface' }, error);

        // Add error message to chat
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `Error: ${error.message}\n\nPlease check your API endpoint and try again.`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);

        if (onError) {
          onError(error);
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [inputText, isLoading, apiEndpoint, apiKey, messages, onError]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`mb-4 p-4 rounded-lg ${
        item.role === 'user' ? 'bg-blue-500 self-end' : 'bg-gray-700 self-start'
      }`}
      style={{ maxWidth: '80%' }}
    >
      <Text className="text-white text-base">{item.content}</Text>
      <Text className="text-gray-300 text-xs mt-2">
        {item.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        inverted={false}
      />

      <View className="flex-row items-center p-4 border-t border-gray-800">
        <TextInput
          className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg mr-2"
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          editable={!isLoading}
          multiline
          maxLength={2000}
        />

        <TouchableOpacity
          className={`px-6 py-3 rounded-lg ${
            isLoading || !inputText.trim() ? 'bg-gray-700' : 'bg-blue-500'
          }`}
          onPress={handleSend}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold">Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
