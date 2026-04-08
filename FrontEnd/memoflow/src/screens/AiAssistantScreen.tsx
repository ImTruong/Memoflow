import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { aiChatApi } from '../api/aiChatApi';
import { aiProviderApi } from '../api/aiProviderApi';
import { AiChatMessage, AiChatSession } from '../types/aiChat';
import { colors } from '../theme/colors';

type AiAssistantScreenProps = {
  onBack?: () => void;
  route?: any;
  navigation?: any;
};

type InlinePart = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

type MarkdownBlock = {
  type: 'paragraph' | 'bullet';
  parts: InlinePart[];
};

const QUICK_PROMPTS = [
  'Giai thich ngu phap cau nay',
  'Cho minh them vi du',
  'Luyen tap ngay',
];

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
};

const formatTime = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes}m ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}h ago`;
  }

  const days = Math.floor(diffMs / day);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
};

const parseInlineMarkdown = (value: string): InlinePart[] => {
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts: InlinePart[] = [];
  let cursor = 0;

  value.replace(tokenRegex, (token, _group, offset) => {
    if (offset > cursor) {
      parts.push({ text: value.slice(cursor, offset) });
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push({ text: token.slice(2, -2), bold: true });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push({ text: token.slice(1, -1), code: true });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push({ text: token.slice(1, -1), italic: true });
    } else {
      parts.push({ text: token });
    }

    cursor = offset + token.length;
    return token;
  });

  if (cursor < value.length) {
    parts.push({ text: value.slice(cursor) });
  }

  return parts;
};

const parseMarkdownBlocks = (content: string): MarkdownBlock[] => {
  return content
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('- ')) {
        return {
          type: 'bullet' as const,
          parts: parseInlineMarkdown(trimmed.slice(2).trim()),
        };
      }

      return {
        type: 'paragraph' as const,
        parts: parseInlineMarkdown(line),
      };
    });
};

export const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({ onBack, route, navigation }) => {
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [pendingAutoSend, setPendingAutoSend] = useState<{
    message: string;
    hiddenContext?: string;
    sessionId?: number;
  } | null>(null);
  const hasAutoSentRef = useRef(false);

  const messageListRef = useRef<FlatList<AiChatMessage>>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions],
  );

  const loadMessages = useCallback(async (sessionId: number) => {
    setLoadingMessages(true);
    try {
      const response = await aiChatApi.getMessages(sessionId);
      setMessages(response.data || []);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the tai lich su chat');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const createAndOpenSession = useCallback(async () => {
    const response = await aiChatApi.createSession();
    const created = response.data;

    setSessions((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
    setActiveSessionId(created.id);
    setMessages([]);
    setShowHistory(false);

    return created;
  }, []);

  const bootstrap = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const response = await aiChatApi.getSessions();
      const loadedSessions = response.data || [];
      setSessions(loadedSessions);

      let bootstrapSessionId: number;

      if (loadedSessions.length > 0) {
        const latestSession = loadedSessions[0];
        setActiveSessionId(latestSession.id);
        await loadMessages(latestSession.id);
        bootstrapSessionId = latestSession.id;
      } else {
        const createdSession = await createAndOpenSession();
        bootstrapSessionId = createdSession.id;
      }

      const autoSend = route?.params?.autoSend === true;
      const autoSendMessage =
        typeof route?.params?.autoSendMessage === 'string' ? route.params.autoSendMessage.trim() : '';
      const hiddenContext =
        typeof route?.params?.hiddenContext === 'string' ? route.params.hiddenContext : undefined;

      const initialPrompt =
        route?.params?.initialPrompt ?? route?.params?.prefilledMessage ?? route?.params?.message;

      if (autoSend && autoSendMessage && !hasAutoSentRef.current) {
        hasAutoSentRef.current = true;
        setPendingAutoSend({
          message: autoSendMessage,
          hiddenContext,
          sessionId: bootstrapSessionId,
        });
      } else if (initialPrompt && typeof initialPrompt === 'string') {
        setInputValue(initialPrompt);
        // Clear param so it doesn't re-trigger on subsequent navs if handled properly by navigation, 
        // though navigation params remain unless reset. Setting inputValue once during bootstrap is adequate.
      }

      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the khoi tao AI Assistant');
    } finally {
      setLoadingInitial(false);
    }
  }, [
    createAndOpenSession,
    loadMessages,
    route?.params?.autoSend,
    route?.params?.autoSendMessage,
    route?.params?.hiddenContext,
    route?.params?.initialPrompt,
    route?.params?.prefilledMessage,
    route?.params?.message,
  ]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (messages.length === 0) return;

    const timer = setTimeout(() => {
      messageListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages.length]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event?.endCoordinates?.height ?? 0);

      setTimeout(() => {
        messageListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const upsertSessionAfterReply = (
    replySessionId: number,
    title: string,
    lastPreview: string,
    updatedAt: string,
  ) => {
    setSessions((prev) => {
      const current = prev.find((session) => session.id === replySessionId);
      const merged: AiChatSession = {
        id: replySessionId,
        title: title || current?.title || 'Cuoc tro chuyen moi',
        lastMessagePreview: truncate(lastPreview, 90),
        createdAt: current?.createdAt || updatedAt,
        updatedAt,
      };

      return [merged, ...prev.filter((session) => session.id !== replySessionId)];
    });
  };

  const submitMessage = async (
    rawContent: string,
    options?: { hiddenContext?: string; sessionId?: number },
  ) => {
    const content = rawContent.trim();
    if (!content || sending) return;

    setInputValue('');
    setErrorMessage(null);

    let sessionId = options?.sessionId ?? activeSessionId;
    if (!sessionId) {
      const created = await createAndOpenSession();
      sessionId = created.id;
    }

    const tempId = -Date.now();
    const now = new Date().toISOString();
    const tempUserMessage: AiChatMessage = {
      id: tempId,
      role: 'user',
      content,
      createdAt: now,
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setSending(true);

    try {
      const savedUserMessageResponse = await aiChatApi.saveMessage(sessionId, 'user', content);
      const savedUserMessage = savedUserMessageResponse.data;

      setMessages((prev) => [...prev.filter((item) => item.id !== tempId), savedUserMessage]);

      const assistantContent = await aiProviderApi.generateTutorReply(
        content,
        [...messages, savedUserMessage],
        options?.hiddenContext,
      );

      const savedAssistantMessageResponse = await aiChatApi.saveMessage(sessionId, 'assistant', assistantContent);
      const savedAssistantMessage = savedAssistantMessageResponse.data;

      setMessages((prev) => {
        const normalized = prev.filter((item) => item.id !== tempId && item.id !== savedUserMessage.id);
        return [...normalized, savedUserMessage, savedAssistantMessage];
      });

      upsertSessionAfterReply(
        sessionId,
        activeSession?.title || 'Cuoc tro chuyen moi',
        savedAssistantMessage.content,
        savedAssistantMessage.createdAt,
      );

      setActiveSessionId(sessionId);
    } catch (error) {
      setMessages((prev) => prev.filter((item) => item.id !== tempId));
      setErrorMessage(error instanceof Error ? error.message : 'Khong gui duoc tin nhan');
    } finally {
      setSending(false);
    }
  };

  const handleSelectSession = async (session: AiChatSession) => {
    setActiveSessionId(session.id);
    setShowHistory(false);
    await loadMessages(session.id);
  };

  useEffect(() => {
    if (!pendingAutoSend || loadingInitial || sending) return;

    const payload = pendingAutoSend;
    setPendingAutoSend(null);
    void submitMessage(payload.message, {
      hiddenContext: payload.hiddenContext,
      sessionId: payload.sessionId,
    });
  }, [loadingInitial, pendingAutoSend, sending]);

  const renderMessageItem = ({ item }: { item: AiChatMessage }) => {
    const isUser = item.role === 'user';
    const markdownBlocks = !isUser ? parseMarkdownBlocks(item.content) : [];

    const renderInlineParts = (parts: InlinePart[], isUserMessage: boolean, keyPrefix: string) => (
      <Text style={[styles.messageText, isUserMessage ? styles.messageTextUser : styles.messageTextAssistant]}>
        {parts.map((part, index) => (
          <Text
            key={`${keyPrefix}-${index}`}
            style={[
              part.bold ? styles.mdBold : null,
              part.italic ? styles.mdItalic : null,
              part.code ? (isUserMessage ? styles.mdCodeUser : styles.mdCodeAssistant) : null,
            ]}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant]}>
          {isUser ? (
            <Text style={[styles.messageText, styles.messageTextUser]}>{item.content}</Text>
          ) : markdownBlocks.length > 0 ? (
            <View style={styles.mdBlockWrap}>
              {markdownBlocks.map((block, blockIndex) =>
                block.type === 'bullet' ? (
                  <View style={styles.mdBulletRow} key={`md-bullet-${item.id}-${blockIndex}`}>
                    <Text style={styles.mdBulletDot}>{'\u2022'}</Text>
                    <View style={styles.mdBulletContent}>
                      {renderInlineParts(block.parts, false, `bullet-${item.id}-${blockIndex}`)}
                    </View>
                  </View>
                ) : (
                  <View style={styles.mdParagraph} key={`md-paragraph-${item.id}-${blockIndex}`}>
                    {renderInlineParts(block.parts, false, `paragraph-${item.id}-${blockIndex}`)}
                  </View>
                ),
              )}
            </View>
          ) : (
            <Text style={[styles.messageText, styles.messageTextAssistant]}>{item.content}</Text>
          )}
        </View>
        <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: AiChatSession }) => {
    const active = item.id === activeSessionId;

    return (
      <TouchableOpacity
        style={[styles.historyItem, active && styles.historyItemActive]}
        activeOpacity={0.75}
        onPress={() => void handleSelectSession(item)}
      >
        <View style={styles.historyTextWrap}>
          <View style={styles.historyTitleRow}>
            <Text style={styles.historyTitle} numberOfLines={1}>
              {item.title || 'Cuoc tro chuyen moi'}
            </Text>
            <Text style={styles.historyTime}>{formatRelativeTime(item.updatedAt)}</Text>
          </View>
          <Text style={styles.historyPreview} numberOfLines={2}>
            {item.lastMessagePreview || 'Bat dau cuoc tro chuyen hoc tieng Anh'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => {
              if (showHistory) {
                setShowHistory(false);
                return;
              }
              if (onBack) {
                onBack();
              } else if (navigation && navigation.goBack) {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="robot-happy-outline" size={18} color={colors.primary} />
              <Text style={styles.headerTitle}>AI Assistant</Text>
            </View>
            <Text style={styles.headerStatus}>TRUC TUYEN</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowHistory((prev) => !prev)}
          >
            <Ionicons name="time-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {loadingInitial ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Dang tai tro ly AI...</Text>
          </View>
        ) : showHistory ? (
          <View style={styles.historyContainer}>
            <View style={styles.historyActionsRow}>
              <Text style={styles.historyHeading}>History</Text>
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={() => void createAndOpenSession()}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.newChatText}>New chat</Text>
              </TouchableOpacity>
            </View>

            {sessions.length === 0 ? (
              <View style={styles.emptyHistoryBlock}>
                <Text style={styles.emptyHistoryText}>Chua co lich su chat.</Text>
              </View>
            ) : (
              <FlatList
                data={sessions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderHistoryItem}
                contentContainerStyle={styles.historyListContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        ) : (
          <>
            {loadingMessages ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                ref={messageListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessageItem}
                contentContainerStyle={styles.messageListContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.emptyChatBlock}>
                    <Text style={styles.emptyChatTitle}>Xin chao! Minh la tro ly hoc tieng Anh.</Text>
                    <Text style={styles.emptyChatSubtitle}>
                      Ban co the hoi minh ve ngu phap, tu vung, dich cau, hoac luyen nghe.
                    </Text>
                  </View>
                }
              />
            )}

            {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            {sending && (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>AI dang tra loi...</Text>
              </View>
            )}

            <View
              style={[
                styles.composerWrap,
                Platform.OS === 'android'
                  ? { marginBottom: Math.max(0, keyboardHeight - insets.bottom) }
                  : null,
              ]}
            >
              {!isKeyboardVisible && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickPromptRow}
                  keyboardShouldPersistTaps="handled"
                >
                  {QUICK_PROMPTS.map((prompt) => (
                    <TouchableOpacity
                      key={prompt}
                      style={styles.quickPromptButton}
                      onPress={() => {
                        setInputValue(prompt);
                        void submitMessage(prompt);
                      }}
                    >
                      <Text style={styles.quickPromptText}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <View style={[styles.inputWrap, { paddingBottom: Math.max(insets.bottom + 6, 12) }]}>
                <TouchableOpacity style={styles.plusButton}>
                  <Ionicons name="add-circle-outline" size={22} color={colors.textSecondary} />
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  onFocus={() => {
                    setTimeout(() => {
                      messageListRef.current?.scrollToEnd({ animated: true });
                    }, 80);
                  }}
                  placeholder="Hoi bat cu dieu gi ve bai hoc..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={6000}
                />

                <TouchableOpacity
                  style={[styles.sendButton, (!inputValue.trim() || sending) && styles.sendButtonDisabled]}
                  disabled={!inputValue.trim() || sending}
                  onPress={() => void submitMessage(inputValue)}
                >
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    height: 74,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  headerStatus: {
    marginTop: 2,
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  loadingBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  historyContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  historyActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyHeading: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  newChatText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  historyListContent: {
    paddingBottom: 18,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyItemActive: {
    borderColor: '#A5B4FC',
    backgroundColor: '#F8FAFF',
  },
  historyTextWrap: {
    flex: 1,
  },
  historyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  historyTitle: {
    flex: 1,
    color: '#111827',
    fontWeight: '700',
    fontSize: 15,
  },
  historyTime: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  historyPreview: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyHistoryBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryText: {
    color: '#9CA3AF',
  },

  messageListContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  messageRow: {
    marginBottom: 10,
    maxWidth: '86%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  messageBubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAssistant: {
    color: '#1F2937',
  },
  mdBlockWrap: {
    gap: 2,
  },
  mdParagraph: {
    marginBottom: 2,
  },
  mdBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  mdBulletDot: {
    color: '#1F2937',
    marginRight: 6,
    marginTop: 1,
    fontSize: 15,
    lineHeight: 21,
  },
  mdBulletContent: {
    flex: 1,
  },
  mdBold: {
    fontWeight: '700',
  },
  mdItalic: {
    fontStyle: 'italic',
  },
  mdCodeAssistant: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    backgroundColor: '#EEF2FF',
    color: '#3730A3',
  },
  mdCodeUser: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: '#FFFFFF',
  },
  messageTime: {
    marginTop: 3,
    color: '#9CA3AF',
    fontSize: 11,
  },
  emptyChatBlock: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    padding: 16,
  },
  emptyChatTitle: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  emptyChatSubtitle: {
    color: '#4B5563',
    lineHeight: 20,
    fontSize: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  typingText: {
    color: '#6B7280',
    fontSize: 12,
  },
  composerWrap: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickPromptRow: {
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 8,
    gap: 8,
  },
  quickPromptButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickPromptText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  plusButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 96,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
