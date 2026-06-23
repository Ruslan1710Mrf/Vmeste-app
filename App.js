import * as ExpoLinking from 'expo-linking';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, BackHandler, Modal, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from './components/TabBar';
import OnboardingOverlay from './components/OnboardingOverlay';
import PostOptionsMenu from './components/PostOptionsMenu';
import ProfileSetupSheet from './components/ProfileSetupSheet';
import { EVENTS, getEventById } from './data/events';
import { findGuideContext } from './data/immigration';
import { getJobById } from './data/jobs';
import { getMemberById, getMutualConnections } from './data/members';
import { getPostById, POSTS } from './data/posts';
import { DEFAULT_PROFILE } from './data/profile';
import { updateDisplayName } from './lib/authService';
import { DEFAULT_SETTINGS } from './lib/chatUtils';
import { createEvent, fetchEvents } from './lib/eventService';
import { subscribeToConversations } from './lib/messageService';
import { DEV_MODE_SKIP_AUTH } from './lib/devMode';
import { auth } from './lib/firebase';
import { useTheme } from './lib/ThemeContext';
import {
  getFirstName,
  getProfileCityLabel,
  mergeProfiles,
  mergeProfileWithAuth,
  needsProfileSetup,
  profileFromNewUser,
  buildUserProfileDoc,
  profileToFirestoreUpdate,
} from './lib/profileUtils';
import {
  loadAppState,
  loadOnboardingSeen,
  saveAppState,
  saveOnboardingSeen,
} from './lib/storage';
import { getOwnPosts, getPostsByAuthorName, isOwnPost } from './lib/postUtils';
import {
  addReplyToPost,
  createPost,
  deletePost,
  fetchPosts,
  updatePost,
} from './lib/postService';
import {
  createUserProfile,
  fetchUserProfile,
  profileDocToMember,
  updateUserProfile,
} from './lib/userProfileService';
import ChatScreen from './screens/ChatScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import FeedScreen from './screens/FeedScreen';
import GlobalSearchScreen from './screens/GlobalSearchScreen';
import HelpScreen from './screens/HelpScreen';
import HomeScreen from './screens/HomeScreen';
import AiChatScreen from './screens/AiChatScreen';
import ImmigrationScreen from './screens/ImmigrationScreen';
import ImmigrationGuideScreen from './screens/ImmigrationGuideScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import JobsScreen from './screens/JobsScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import MessagesScreen from './screens/MessagesScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import MyPostsScreen from './screens/MyPostsScreen';
import NetworkingScreen from './screens/NetworkingScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import SavedJobsScreen from './screens/SavedJobsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { CHECKLIST_ITEMS } from './data/checklist';
import { NOTIFICATIONS } from './data/notifications';
import { uploadPostImage, uploadProfilePhoto, uploadProfileCover } from './lib/postImageService';

const TAB_BACK_LABELS = {
  home: 'Главная',
  jobs: 'Работа',
  resources: 'Наша база',
  immigration: 'Иммиграция',
  ai: 'AI',
  networking: 'Нетворкинг',
  profile: 'Профиль',
};

const VALID_TABS = Object.keys(TAB_BACK_LABELS);

const VALID_PROFILE_VIEWS = new Set([
  'saved',
  'edit',
  'messages',
  'connections',
  'checklist',
  'feed',
  'events',
  'myPosts',
  'notifications',
  'help',
  'settings',
]);

function restoreTab(value) {
  return VALID_TABS.includes(value) ? value : 'home';
}

function restoreProfileView(value) {
  return VALID_PROFILE_VIEWS.has(value) ? value : null;
}

function AppContent() {
  const { colors } = useTheme();
  const [tab, setTab] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedChatMemberId, setSelectedChatMemberId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showFeed, setShowFeed] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [menuPost, setMenuPost] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [profileView, setProfileView] = useState(null);
  const [profileReturnTab, setProfileReturnTab] = useState(null);
  const [feedCategory, setFeedCategory] = useState('Все');
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [connectedIds, setConnectedIds] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [checkedChecklistIds, setCheckedChecklistIds] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [posts, setPosts] = useState(POSTS);
  const [events, setEvents] = useState(EVENTS);
  const [conversations, setConversations] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [firestoreMember, setFirestoreMember] = useState(null);
  const [chatMemberProfile, setChatMemberProfile] = useState(null);
  const postsRef = useRef(posts);
  const hydratedUserIdRef = useRef(null);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    loadOnboardingSeen().then((seen) => {
      setShowOnboarding(!seen);
      setOnboardingReady(true);
    });
  }, []);

  const completeOnboarding = async () => {
    await saveOnboardingSeen();
    setShowOnboarding(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      if (!user) setHydrated(false);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!userId && !DEV_MODE_SKIP_AUTH) return undefined;

    let cancelled = false;
    setHydrated(false);

    Promise.all([
      loadAppState(userId),
      userId ? fetchUserProfile(userId).catch(() => null) : Promise.resolve(null),
      fetchPosts().catch(() => null),
      fetchEvents().catch(() => null),
    ]).then(async ([saved, firestoreProfile, firestorePosts, firestoreEvents]) => {
      if (cancelled) return;

      const user = auth.currentUser;
      let mergedProfile;

      if (DEV_MODE_SKIP_AUTH && !userId) {
        mergedProfile = saved.profile ?? DEFAULT_PROFILE;
      } else if (!firestoreProfile && !saved.profile && user) {
        mergedProfile = profileFromNewUser(user, user.displayName ?? '');
        try {
          await createUserProfile(userId, buildUserProfileDoc(userId, mergedProfile));
        } catch {
          // Firestore may be unavailable offline
        }
      } else if (!firestoreProfile && saved.profile && user) {
        mergedProfile = mergeProfileWithAuth(saved.profile, user);
        try {
          await createUserProfile(userId, buildUserProfileDoc(userId, mergedProfile));
        } catch {
          // keep local profile
        }
      } else {
        mergedProfile = mergeProfiles(firestoreProfile, saved.profile, user);
      }

      setProfile(mergedProfile);
      setSavedJobIds(saved.savedJobIds ?? []);
      setConnectedIds(saved.connectedIds ?? []);
      setRegisteredEventIds(saved.registeredEventIds ?? []);
      setReadNotificationIds(saved.readNotificationIds ?? []);
      setCheckedChecklistIds(saved.checkedChecklistIds ?? []);
      setLikedPostIds(saved.likedPostIds ?? []);
      setPosts(firestorePosts ?? POSTS);
      setEvents(firestoreEvents?.length ? [...firestoreEvents, ...EVENTS] : EVENTS);
      setSettings({ ...DEFAULT_SETTINGS, ...saved.settings });
      setShowProfileSetup(false);
      if (hydratedUserIdRef.current !== userId) {
        setTab(restoreTab(saved.tab));
        hydratedUserIdRef.current = userId;
      }
      setProfileView(restoreProfileView(saved.profileView));
      setProfileReturnTab(
        saved.profileReturnTab && VALID_TABS.includes(saved.profileReturnTab)
          ? saved.profileReturnTab
          : null,
      );
      setFeedCategory(
        typeof saved.feedCategory === 'string' ? saved.feedCategory : 'Все',
      );
      setSelectedJobId(null);
      setSelectedEventId(null);
      setSelectedMemberId(null);
      setSelectedChatMemberId(null);
      setSelectedPostId(null);
      setSelectedGuide(null);
      setShowFeed(false);
      setShowCreatePost(false);
      setShowSearch(false);
      setShowNotifications(false);
      setHydrated(true);
      if (needsProfileSetup(mergedProfile)) {
        setShowProfileSetup(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, authReady]);

  useEffect(() => {
    if (!hydrated) return undefined;
    if (!userId && !DEV_MODE_SKIP_AUTH) return undefined;
    if (!userId) return undefined;
    return subscribeToConversations(userId, setConversations);
  }, [hydrated, userId]);

  useEffect(() => {
    if (!selectedMemberId) {
      setFirestoreMember(null);
      return undefined;
    }

    const mockMember = getMemberById(selectedMemberId);
    if (mockMember) {
      setFirestoreMember(null);
      return undefined;
    }

    let cancelled = false;
    fetchUserProfile(selectedMemberId)
      .then((doc) => {
        if (cancelled || !doc) return;
        setFirestoreMember(profileDocToMember(doc));
      })
      .catch(() => {
        if (!cancelled) setFirestoreMember(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMemberId]);

  useEffect(() => {
    if (!selectedChatMemberId) {
      setChatMemberProfile(null);
      return undefined;
    }

    const mockMember = getMemberById(selectedChatMemberId);
    if (mockMember) {
      setChatMemberProfile(mockMember);
      return undefined;
    }

    let cancelled = false;
    fetchUserProfile(selectedChatMemberId)
      .then((doc) => {
        if (cancelled || !doc) return;
        setChatMemberProfile(profileDocToMember(doc));
      })
      .catch(() => {
        if (!cancelled) setChatMemberProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedChatMemberId]);

  useEffect(() => {
    if (!hydrated) return;
    if (!userId && !DEV_MODE_SKIP_AUTH) return;
    saveAppState(userId, {
      profile,
      savedJobIds,
      connectedIds,
      registeredEventIds,
      readNotificationIds,
      checkedChecklistIds,
      likedPostIds,
      settings,
      tab,
      profileView,
      profileReturnTab,
      feedCategory,
    });
  }, [
    hydrated,
    userId,
    profile,
    savedJobIds,
    connectedIds,
    registeredEventIds,
    readNotificationIds,
    checkedChecklistIds,
    likedPostIds,
    settings,
    tab,
    profileView,
    profileReturnTab,
    feedCategory,
  ]);

  const handleSaveProfile = async (nextProfile) => {
    setProfile(nextProfile);
    if (!userId) return;
    try {
      if (nextProfile.name?.trim()) {
        await updateDisplayName(nextProfile.name.trim());
      }

      // Upload profile photo if it's a local URI
      let profilePhotoUri = nextProfile.photoUri;
      if (profilePhotoUri && (profilePhotoUri.startsWith('file://') || profilePhotoUri.startsWith('content://'))) {
        try {
          profilePhotoUri = await uploadProfilePhoto(userId, profilePhotoUri);
        } catch (error) {
          console.error('Failed to upload profile photo:', error);
          // Continue anyway - don't block profile save
        }
      }

      // Upload cover photo if it's a local URI
      let coverPhotoUri = nextProfile.coverPhoto;
      if (coverPhotoUri && (coverPhotoUri.startsWith('file://') || coverPhotoUri.startsWith('content://'))) {
        try {
          coverPhotoUri = await uploadProfileCover(userId, coverPhotoUri);
        } catch (error) {
          console.error('Failed to upload cover photo:', error);
          // Continue anyway - don't block profile save
        }
      }

      const profileToSave = {
        ...profileToFirestoreUpdate(nextProfile),
        photoUri: profilePhotoUri,
        coverPhoto: coverPhotoUri,
      };

      await updateUserProfile(userId, profileToSave);
    } catch {
      // profile saved locally even if cloud sync fails
    }
  };

  const getProfileBackLabel = () =>
    TAB_BACK_LABELS[profileReturnTab ?? 'profile'] ?? 'Профиль';

  const closeProfileView = () => {
    const returnTab = profileReturnTab;
    setProfileView(null);
    setProfileReturnTab(null);
    if (returnTab) {
      setTab(returnTab);
    }
  };

  const openNotifications = () => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedGuide(null);
    setShowFeed(false);
    setShowCreatePost(false);
    setShowSearch(false);
    setProfileView(null);
    setProfileReturnTab(null);
    setShowNotifications(true);
  };

  const openMessages = () => {
    clearOverlays();
    setProfileReturnTab(tab);
    setTab('profile');
    setProfileView('messages');
  };

  const openSavedJobs = () => {
    clearOverlays();
    setTab('profile');
    setProfileView('saved');
  };

  const handleProfileSetupComplete = async (nextProfile) => {
    await handleSaveProfile(nextProfile);
    setShowProfileSetup(false);
  };

  const toggleSaveJob = (id) => {
    setSavedJobIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const connectMember = (id) => {
    setConnectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const registerEvent = (id) => {
    setRegisteredEventIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  const toggleChecklistItem = (id) => {
    setCheckedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const markNotificationRead = (id) => {
    setReadNotificationIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(
      NOTIFICATIONS.filter((n) => n.unread).map((n) => n.id),
    );
  };

  const toggleLikePost = (id) => {
    setLikedPostIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const openChecklistGuide = (guideLink) => {
    const ctx = findGuideContext(guideLink.sectionId, guideLink.title);
    if (ctx) {
      setProfileView(null);
      setTab('immigration');
      setSelectedGuide(ctx);
    }
  };

  const addPost = async ({ content, category, imageUri }) => {
    const text = content.trim();
    if (!text && !imageUri) return;

    const authorId = auth.currentUser?.uid ?? userId;
    if (!authorId) {
      throw new Error('Войдите в аккаунт, чтобы публиковать пост.');
    }

    const firstName = getFirstName(profile, auth.currentUser);

    let remoteImageUri = null;
    if (imageUri) {
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        remoteImageUri = imageUri;
      } else {
        remoteImageUri = await uploadPostImage(authorId, imageUri);
      }
    }

    const payload = {
      author: `${firstName} (вы)`,
      city: getProfileCityLabel(profile),
      content: text,
      category,
      imageUri: remoteImageUri,
    };

    const created = await createPost(authorId, payload);
    setPosts((prev) => [created, ...prev]);
  };

  const closeCreatePost = () => {
    setShowCreatePost(false);
    setEditingPost(null);
  };

  const handlePublishPost = async (input) => {
    await addPost(input);
    closeCreatePost();
  };

  const handleUpdatePost = async (input) => {
    if (!editingPost) return;

    try {
      const updated = await updatePost(editingPost.id, input);
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? updated : p)));
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, content: input.content, category: input.category }
            : p,
        ),
      );
    }
    closeCreatePost();
  };

  const closeCreateEvent = () => setShowCreateEvent(false);

  const handlePublishEvent = async (input) => {
    const authorId = auth.currentUser?.uid ?? userId;
    if (!authorId) {
      throw new Error('Войдите в аккаунт, чтобы создать событие.');
    }

    const host = getFirstName(profile, auth.currentUser);
    const created = await createEvent(authorId, { ...input, host });
    setEvents((prev) => [created, ...prev]);
    closeCreateEvent();
  };

  const currentAuthorId = auth.currentUser?.uid ?? userId ?? 'guest';

  const handleEditPost = () => {
    if (!menuPost) return;
    if (!isOwnPost(menuPost, currentAuthorId)) {
      setMenuPost(null);
      Alert.alert('Недоступно', 'Редактировать можно только свои посты.');
      return;
    }
    setEditingPost(menuPost);
    setMenuPost(null);
    setShowCreatePost(true);
  };

  const handleDeletePost = () => {
    if (!menuPost) return;
    const post = menuPost;

    if (!isOwnPost(post, currentAuthorId)) {
      setMenuPost(null);
      Alert.alert('Недоступно', 'Удалять можно только свои посты.');
      return;
    }

    setMenuPost(null);

    const removePost = async () => {
      try {
        await deletePost(post.id);
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        if (selectedPostId === post.id) {
          setSelectedPostId(null);
        }
      } catch {
        Alert.alert('Ошибка', 'Не удалось удалить пост. Попробуйте позже.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Удалить пост? Пост будет удалён без возможности восстановления.',
      );
      if (confirmed) {
        void removePost();
      }
      return;
    }

    Alert.alert('Удалить пост?', 'Пост будет удалён без возможности восстановления.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          void removePost();
        },
      },
    ]);
  };

  const handleReportPost = () => {
    setMenuPost(null);
    Alert.alert('Спасибо', 'Жалоба отправлена. Мы рассмотрим её в ближайшее время.');
  };

  const addReply = async (postId, reply) => {
    const authorUid = auth.currentUser?.uid ?? userId;
    if (!authorUid) return;

    try {
      const saved = await addReplyToPost(postId, authorUid, {
        author: reply.author,
        text: reply.text,
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, replies: [...(post.replies ?? []), saved] }
            : post,
        ),
      );
    } catch {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, replies: [...(post.replies ?? []), reply] }
            : post,
        ),
      );
    }
  };

  const refreshPosts = async () => {
    try {
      const latest = await fetchPosts();
      setPosts(latest);
    } catch {
      // keep current posts on refresh failure
    }
  };

  const clearOverlays = () => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedGuide(null);
    setShowFeed(false);
    setShowCreatePost(false);
    setShowCreateEvent(false);
    setShowSearch(false);
    setShowNotifications(false);
    setProfileView(null);
    setProfileReturnTab(null);
  };

  const openChecklist = () => {
    clearOverlays();
    setTab('profile');
    setProfileView('checklist');
  };

  const openGuide = (section, item) => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedGuide({ section, item });
  };

  const closeNotifications = () => {
    setShowNotifications(false);
    setProfileView(null);
    setProfileReturnTab(null);
    if (tab !== 'home') {
      setTab('home');
    }
  };

  const handleNavigate = (id) => {
    const routes = {
      work: 'jobs',
      immigration: 'immigration',
      ai: 'ai',
      networking: 'networking',
      profile: 'profile',
    };
    if (routes[id]) {
      clearOverlays();
      setTab(routes[id]);
    }
  };

  const handleTabChange = (nextTab) => {
    clearOverlays();
    setTab(nextTab);
    if (!hydrated) return;
    const uid = userId ?? 'guest';
    saveAppState(uid, {
      profile,
      savedJobIds,
      connectedIds,
      registeredEventIds,
      readNotificationIds,
      checkedChecklistIds,
      likedPostIds,
      settings,
      tab: nextTab,
      profileView: null,
      profileReturnTab: null,
      feedCategory,
    });
  };

  const openJob = (id) => {
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedJobId(id);
  };

  const openEvent = (id) => {
    setSelectedJobId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedEventId(id);
  };

  const openMember = (id) => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedMemberId(id);
  };

  const openOwnProfile = () => {
    clearOverlays();
    setProfileReturnTab(tab);
    setTab('profile');
    setProfileView(null);
  };

  const openTagFeed = (tag) => {
    const category = getCategoryForInterest(tag);
    setFeedCategory(category);
    setTab('profile');
    setProfileView('feed');
  };

  const openCommunityFeed = () => {
    setFeedCategory('Все');
    setTab('profile');
    setProfileView('feed');
  };

  const openProfileSubview = (view) => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedGuide(null);
    setShowFeed(false);
    setShowCreatePost(false);
    setShowSearch(false);
    setShowNotifications(false);
    setTab('profile');
    setProfileView(view);
  };

  const closeTagFeed = () => {
    setProfileView(null);
    setFeedCategory('Все');
  };

  const openPost = (id) => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(id);
  };

  useEffect(() => {
    if (!hydrated) return undefined;

    const openPostFromLink = (parsed) => {
      const rawId = parsed?.queryParams?.post;
      const postId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!postId || !getPostById(postId, postsRef.current)) return;

      setShowCreatePost(false);
      setShowFeed(false);
      setShowSearch(false);
      setProfileView(null);
      setTab('home');
      openPost(postId);
    };

    ExpoLinking.parseInitialURLAsync().then(openPostFromLink);

    const subscription = ExpoLinking.addEventListener('url', ({ url }) => {
      openPostFromLink(ExpoLinking.parse(url));
    });

    return () => subscription.remove();
  }, [hydrated]);

  const openChat = (id) => {
    setSelectedChatMemberId(id);
  };

  const openMessage = (memberId) => {
    setSelectedMemberId(null);
    setSelectedChatMemberId(memberId);
  };

  const selectedJob = selectedJobId ? getJobById(selectedJobId) : null;
  const selectedEvent = selectedEventId ? getEventById(selectedEventId, events) : null;

  useEffect(() => {
    if (Platform.OS !== 'android' || !selectedEvent) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedEventId(null);
      return true;
    });

    return () => subscription.remove();
  }, [selectedEvent]);

  const selectedMember = selectedMemberId
    ? (getMemberById(selectedMemberId) ?? firestoreMember)
    : null;
  const selectedPost = selectedPostId ? getPostById(selectedPostId, posts) : null;
  const chatMember = chatMemberProfile;

  const connectionsCount = connectedIds.length;
  const messagesCount = conversations.filter((conv) => conv.lastMessage?.trim()).length;
  const ownPosts = getOwnPosts(posts, auth.currentUser?.uid ?? userId ?? 'guest');
  const postsCount = ownPosts.length;
  const eventsCount = registeredEventIds.length;
  const unreadCount = NOTIFICATIONS.filter(
    (n) => n.unread && !readNotificationIds.includes(n.id),
  ).length;

  if (showSearch) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <GlobalSearchScreen
          posts={posts}
          authReady={authReady}
          onBack={() => setShowSearch(false)}
          onOpenJob={(id) => {
            setShowSearch(false);
            openJob(id);
          }}
          onOpenEvent={(id) => {
            setShowSearch(false);
            openEvent(id);
          }}
          onOpenPost={(id) => {
            setShowSearch(false);
            openPost(id);
          }}
          onOpenGuide={(section, item) => {
            setShowSearch(false);
            openGuide(section, item);
          }}
          onOpenMember={(id) => {
            setShowSearch(false);
            openMember(id);
          }}
        />
      </SafeAreaView>
    );
  }

  if (selectedGuide) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ImmigrationGuideScreen
          section={selectedGuide.section}
          item={selectedGuide.item}
          onBack={() => setSelectedGuide(null)}
        />
      </SafeAreaView>
    );
  }

  if (selectedJob) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <JobDetailScreen
          job={selectedJob}
          onBack={() => setSelectedJobId(null)}
          isSaved={savedJobIds.includes(selectedJob.id)}
          onToggleSave={toggleSaveJob}
        />
      </SafeAreaView>
    );
  }

  if (selectedEvent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <EventDetailScreen
          event={selectedEvent}
          onBack={() => setSelectedEventId(null)}
          isRegistered={registeredEventIds.includes(selectedEvent.id)}
          onRegister={registerEvent}
        />
      </SafeAreaView>
    );
  }

  if (selectedMember) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <MemberDetailScreen
          member={selectedMember}
          memberPosts={getPostsByAuthorName(posts, selectedMember.name)}
          mutualConnections={getMutualConnections(selectedMember, connectedIds)}
          onBack={() => setSelectedMemberId(null)}
          isConnected={connectedIds.includes(selectedMember.id)}
          onConnect={connectMember}
          onMessage={openMessage}
          onOpenPost={openPost}
          onOpenMember={openMember}
        />
      </SafeAreaView>
    );
  }

  if (selectedPost) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <PostDetailScreen
          post={selectedPost}
          profile={profile}
          onBack={() => setSelectedPostId(null)}
          onAddReply={addReply}
        />
      </SafeAreaView>
    );
  }

  if (chatMember) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ChatScreen
          member={chatMember}
          myName={profile.name}
          userId={userId}
          onBack={() => setSelectedChatMemberId(null)}
        />
      </SafeAreaView>
    );
  }

  const renderProfileContent = () => {
    switch (profileView) {
      case 'saved':
        return (
          <SavedJobsScreen
            savedJobIds={savedJobIds}
            onBack={() => setProfileView(null)}
            onSelectJob={openJob}
            onToggleSave={toggleSaveJob}
          />
        );
      case 'edit':
        return (
          <EditProfileScreen
            profile={profile}
            onBack={() => setProfileView(null)}
            onSave={handleSaveProfile}
          />
        );
      case 'messages':
        return (
          <MessagesScreen
            onBack={profileReturnTab ? closeProfileView : () => setProfileView(null)}
            backLabel={getProfileBackLabel()}
            onOpenChat={openChat}
            userId={userId}
            connectedIds={connectedIds}
          />
        );
      case 'connections':
        return (
          <ConnectionsScreen
            connectedIds={connectedIds}
            onBack={() => setProfileView(null)}
            onOpenMember={openMember}
            onMessage={(id) => {
              setProfileView(null);
              openChat(id);
            }}
          />
        );
      case 'checklist':
        return (
          <ChecklistScreen
            checkedIds={checkedChecklistIds}
            onBack={() => setProfileView(null)}
            onToggle={toggleChecklistItem}
            onOpenGuide={openChecklistGuide}
          />
        );
      case 'feed':
        return (
          <FeedScreen
            posts={posts}
            likedPostIds={likedPostIds}
            onBack={closeTagFeed}
            onOpenCreatePost={() => setShowCreatePost(true)}
            onSelectPost={openPost}
            onOpenMember={openMember}
            onOpenOwnProfile={openOwnProfile}
            onToggleLike={toggleLikePost}
            onOpenPostMenu={setMenuPost}
            onRefresh={refreshPosts}
            backLabel="Профиль"
            initialCategory={feedCategory}
            feedTitle={feedCategory === 'Все' ? 'Лента' : feedCategory}
            feedSubtitle={
              feedCategory === 'Все'
                ? 'Посты от сообщества'
                : `Посты по теме «${feedCategory}»`
            }
          />
        );
      case 'events':
        return (
          <MyEventsScreen
            registeredEventIds={registeredEventIds}
            events={events}
            onBack={() => setProfileView(null)}
            onOpenEvent={openEvent}
            onCreateEvent={() => setShowCreateEvent(true)}
          />
        );
      case 'myPosts':
        return (
          <MyPostsScreen
            posts={ownPosts}
            onBack={() => setProfileView(null)}
            onOpenPost={openPost}
            onOpenCreatePost={() => setShowCreatePost(true)}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={closeNotifications}
            backLabel="Главная"
            readIds={readNotificationIds}
            onAction={() => {}}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
          />
        );
      case 'help':
        return <HelpScreen onBack={() => setProfileView(null)} />;
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setProfileView(null)}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        );
      default:
        return (
          <ProfileScreen
            profile={profile}
            savedCount={savedJobIds.length}
            unreadCount={unreadCount}
            messagesCount={messagesCount}
            registeredEventsCount={registeredEventIds.length}
            connectionsCount={connectionsCount}
            postsCount={postsCount}
            eventsCount={eventsCount}
            checklistDone={checkedChecklistIds.length}
            checklistTotal={CHECKLIST_ITEMS.length}
            onMenuPress={(view) => {
              if (view === 'feed') {
                openCommunityFeed();
                return;
              }
              openProfileSubview(view);
            }}
            onStatPress={(action) => openProfileSubview(action)}
            onOpenTagFeed={openTagFeed}
            onBack={profileReturnTab ? closeProfileView : undefined}
            backLabel={getProfileBackLabel()}
          />
        );
    }
  };

  const renderContent = () => {
    if (showCreatePost) {
      return (
        <CreatePostScreen
          post={editingPost}
          onBack={closeCreatePost}
          onPublish={editingPost ? handleUpdatePost : handlePublishPost}
        />
      );
    }
    if (showCreateEvent) {
      return (
        <CreateEventScreen
          onBack={closeCreateEvent}
          onPublish={handlePublishEvent}
        />
      );
    }
    if (tab === 'home' && showFeed) {
      return (
        <FeedScreen
          posts={posts}
          likedPostIds={likedPostIds}
          onBack={() => setShowFeed(false)}
          onOpenCreatePost={() => setShowCreatePost(true)}
          onSelectPost={openPost}
          onOpenMember={openMember}
          onOpenOwnProfile={openOwnProfile}
          onToggleLike={toggleLikePost}
          onOpenPostMenu={setMenuPost}
          onRefresh={refreshPosts}
        />
      );
    }
    if (tab === 'home') {
      return (
        <HomeScreen
          profile={profile}
          posts={posts}
          userId={userId}
          onOpenFeed={() => setShowFeed(true)}
          onOpenCreatePost={() => setShowCreatePost(true)}
          onOpenPostMenu={setMenuPost}
          onOpenPost={openPost}
          onOpenMember={openMember}
          onOpenOwnProfile={openOwnProfile}
          onOpenSearch={() => setShowSearch(true)}
          onOpenNotifications={openNotifications}
          onOpenMessages={openMessages}
          onToggleLike={toggleLikePost}
          likedPostIds={likedPostIds}
          unreadCount={unreadCount}
          messagesCount={messagesCount}
        />
      );
    }
    if (tab === 'jobs') {
      return (
        <JobsScreen
          onSelectJob={openJob}
          savedJobIds={savedJobIds}
          onToggleSave={toggleSaveJob}
          onRefresh={() => {}}
        />
      );
    }
    if (tab === 'resources') {
      return <ResourcesScreen />;
    }
    if (tab === 'ai') {
      return <AiChatScreen userId={userId} />;
    }
    if (tab === 'networking') {
      return (
        <NetworkingScreen
          events={events}
          onSelectEvent={openEvent}
          onSelectMember={openMember}
          onCreateEvent={() => setShowCreateEvent(true)}
          connectedIds={connectedIds}
          userId={userId}
        />
      );
    }
    if (tab === 'profile') {
      return renderProfileContent();
    }
    if (tab === 'immigration') {
      return <ImmigrationScreen onSelectGuide={openGuide} onRefresh={() => {}} />;
    }
    return null;
  };

  if (!authReady) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={colors.statusBar} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!userId && !DEV_MODE_SKIP_AUTH) {
    return null;
  }

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={colors.statusBar} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />
      <View style={styles.content}>{renderContent()}</View>
      <TabBar active={tab} onChange={handleTabChange} />
      {onboardingReady && showOnboarding ? (
        <OnboardingOverlay onComplete={completeOnboarding} />
      ) : null}
      <PostOptionsMenu
        visible={Boolean(menuPost)}
        onClose={() => setMenuPost(null)}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        onReport={handleReportPost}
      />
      <ProfileSetupSheet
        profile={profile}
        visible={showProfileSetup}
        onComplete={handleProfileSetupComplete}
      />
      <Modal
        visible={showNotifications}
        animationType="slide"
        onRequestClose={closeNotifications}
      >
        <SafeAreaView style={[styles.notificationsOverlay, { backgroundColor: colors.background }]}>
          <NotificationsScreen
            onBack={closeNotifications}
            backLabel="Главная"
            readIds={readNotificationIds}
            onAction={() => {}}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsOverlay: {
    flex: 1,
  },
});

export default function App() {
  return <AppContent />;
}
