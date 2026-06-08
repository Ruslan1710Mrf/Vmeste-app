import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import TabBar from './components/TabBar';
import OnboardingOverlay from './components/OnboardingOverlay';
import ProfileSetupSheet from './components/ProfileSetupSheet';
import { getEventById } from './data/events';
import { findGuideContext } from './data/immigration';
import { getJobById } from './data/jobs';
import { getMemberById } from './data/members';
import { getPostById, POSTS } from './data/posts';
import { DEFAULT_PROFILE } from './data/profile';
import { updateDisplayName } from './lib/authService';
import { DEFAULT_SETTINGS, mergeChatThreads, countActiveConversations } from './lib/chatUtils';
import { auth } from './lib/firebase';
import {
  getFirstName,
  getProfileCityLabel,
  mergeProfiles,
  mergeProfileWithAuth,
  needsProfileSetup,
  profileFromNewUser,
  profileToFirestoreDoc,
} from './lib/profileUtils';
import { loadAppState, saveAppState } from './lib/storage';
import {
  addReplyToPost,
  createPost,
  fetchPosts,
} from './lib/postService';
import {
  createUserProfile,
  fetchUserProfile,
  updateUserProfile,
} from './lib/userProfileService';
import ChatScreen from './screens/ChatScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import FeedScreen from './screens/FeedScreen';
import GlobalSearchScreen from './screens/GlobalSearchScreen';
import HelpScreen from './screens/HelpScreen';
import HomeScreen from './screens/HomeScreen';
import ImmigrationScreen from './screens/ImmigrationScreen';
import ImmigrationGuideScreen from './screens/ImmigrationGuideScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import JobsScreen from './screens/JobsScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import MessagesScreen from './screens/MessagesScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import NetworkingScreen from './screens/NetworkingScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import SavedJobsScreen from './screens/SavedJobsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { CHECKLIST_ITEMS } from './data/checklist';
import { NOTIFICATIONS } from './data/notifications';

export default function App() {
  const [tab, setTab] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedChatMemberId, setSelectedChatMemberId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showFeed, setShowFeed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [profileView, setProfileView] = useState(null);
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
  const [chatThreads, setChatThreads] = useState({});
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      if (!user) setHydrated(false);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authReady || !userId) return undefined;

    let cancelled = false;
    setHydrated(false);

    Promise.all([
      loadAppState(userId),
      fetchUserProfile(userId).catch(() => null),
      fetchPosts().catch(() => null),
    ]).then(async ([saved, firestoreProfile, firestorePosts]) => {
      if (cancelled) return;

      const user = auth.currentUser;
      let mergedProfile;

      if (!firestoreProfile && !saved.profile && user) {
        mergedProfile = profileFromNewUser(user, user.displayName ?? '');
        try {
          await createUserProfile(userId, profileToFirestoreDoc(mergedProfile));
        } catch {
          // Firestore may be unavailable offline
        }
      } else if (!firestoreProfile && saved.profile && user) {
        mergedProfile = mergeProfileWithAuth(saved.profile, user);
        try {
          await createUserProfile(userId, profileToFirestoreDoc(mergedProfile));
        } catch {
          // keep local profile
        }
      } else {
        mergedProfile = mergeProfiles(firestoreProfile, saved.profile, user);
      }

      setShowOnboarding(!saved.onboardingDone);
      setProfile(mergedProfile);
      setSavedJobIds(saved.savedJobIds ?? []);
      setConnectedIds(saved.connectedIds ?? []);
      setRegisteredEventIds(saved.registeredEventIds ?? []);
      setReadNotificationIds(saved.readNotificationIds ?? []);
      setCheckedChecklistIds(saved.checkedChecklistIds ?? []);
      setLikedPostIds(saved.likedPostIds ?? []);
      setPosts(firestorePosts ?? POSTS);
      setChatThreads(mergeChatThreads(saved.chatThreads, saved.connectedIds ?? []));
      setSettings(saved.settings ?? DEFAULT_SETTINGS);
      setShowProfileSetup(false);
      setTab('home');
      setSelectedJobId(null);
      setSelectedEventId(null);
      setSelectedMemberId(null);
      setSelectedChatMemberId(null);
      setSelectedPostId(null);
      setSelectedGuide(null);
      setShowFeed(false);
      setShowSearch(false);
      setProfileView(null);
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
    if (!hydrated || !userId) return;
    saveAppState(userId, {
      onboardingDone: !showOnboarding,
      profile,
      savedJobIds,
      connectedIds,
      registeredEventIds,
      readNotificationIds,
      checkedChecklistIds,
      likedPostIds,
      chatThreads,
      settings,
    });
  }, [
    hydrated,
    userId,
    showOnboarding,
    profile,
    savedJobIds,
    connectedIds,
    registeredEventIds,
    readNotificationIds,
    checkedChecklistIds,
    likedPostIds,
    chatThreads,
    settings,
  ]);

  const handleSaveProfile = async (nextProfile) => {
    setProfile(nextProfile);
    if (!userId) return;
    try {
      if (nextProfile.name?.trim()) {
        await updateDisplayName(nextProfile.name.trim());
      }
      await updateUserProfile(userId, profileToFirestoreDoc(nextProfile));
    } catch {
      // profile saved locally even if cloud sync fails
    }
  };

  const sendChatMessage = (memberId, text) => {
    connectMember(memberId);
    const message = {
      id: String(Date.now()),
      from: 'me',
      text,
      time: new Date().toISOString(),
    };
    setChatThreads((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] ?? []), message],
    }));
  };

  const openNotifications = () => {
    clearOverlays();
    setTab('profile');
    setProfileView('notifications');
  };

  const openMessages = () => {
    clearOverlays();
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

  const addPost = async (content) => {
    const firstName = getFirstName(profile);
    const payload = {
      author: `${firstName} (вы)`,
      city: getProfileCityLabel(profile),
      content,
      category: 'Сообщество',
    };

    try {
      const created = await createPost(userId, payload);
      setPosts((prev) => [created, ...prev]);
    } catch {
      setPosts((prev) => [
        {
          id: String(Date.now()),
          ...payload,
          time: 'Только что',
          likes: 0,
          replies: [],
        },
        ...prev,
      ]);
    }
  };

  const addReply = async (postId, reply) => {
    try {
      const saved = await addReplyToPost(postId, userId, {
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

  const simulateRefresh = () => new Promise((resolve) => setTimeout(resolve, 800));

  const clearOverlays = () => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(null);
    setSelectedGuide(null);
    setShowFeed(false);
    setShowSearch(false);
    setProfileView(null);
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

  const handleNotificationAction = (action) => {
    setProfileView(null);
    setSelectedGuide(null);
    switch (action.type) {
      case 'job':
        setTab('jobs');
        openJob(action.id);
        break;
      case 'event':
        setTab('networking');
        openEvent(action.id);
        break;
      case 'chat':
        connectMember(action.memberId);
        setTab('profile');
        openChat(action.memberId);
        break;
      case 'guide': {
        const ctx = findGuideContext(action.sectionId, action.title);
        if (ctx) {
          setTab('immigration');
          setSelectedGuide(ctx);
        }
        break;
      }
      case 'tab':
        setTab(action.tab);
        break;
      case 'profile':
        setTab('profile');
        setProfileView(action.view);
        break;
      default:
        break;
    }
  };

  const handleNavigate = (id) => {
    const routes = {
      work: 'jobs',
      immigration: 'immigration',
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

  const openPost = (id) => {
    setSelectedJobId(null);
    setSelectedEventId(null);
    setSelectedMemberId(null);
    setSelectedChatMemberId(null);
    setSelectedPostId(id);
  };

  const openChat = (id) => {
    setSelectedChatMemberId(id);
  };

  const openMessage = (memberId) => {
    setSelectedMemberId(null);
    setSelectedChatMemberId(memberId);
  };

  const selectedJob = selectedJobId ? getJobById(selectedJobId) : null;
  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;
  const selectedMember = selectedMemberId ? getMemberById(selectedMemberId) : null;
  const selectedPost = selectedPostId ? getPostById(selectedPostId, posts) : null;
  const chatMember = selectedChatMemberId ? getMemberById(selectedChatMemberId) : null;

  const connectionsCount = connectedIds.length;
  const postsCount = posts.length;
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
          onBack={() => setSelectedMemberId(null)}
          isConnected={connectedIds.includes(selectedMember.id)}
          onConnect={connectMember}
          onMessage={openMessage}
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
          messages={chatThreads[chatMember.id] ?? []}
          onSendMessage={(text) => sendChatMessage(chatMember.id, text)}
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
            connectedIds={connectedIds}
            chatThreads={chatThreads}
            onBack={() => setProfileView(null)}
            onOpenChat={openChat}
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
            onBack={() => setProfileView(null)}
            onAddPost={addPost}
            onSelectPost={openPost}
            onToggleLike={toggleLikePost}
            onRefresh={refreshPosts}
            backLabel="Профиль"
          />
        );
      case 'events':
        return (
          <MyEventsScreen
            registeredEventIds={registeredEventIds}
            onBack={() => setProfileView(null)}
            onOpenEvent={openEvent}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => setProfileView(null)}
            onAction={handleNotificationAction}
            readIds={readNotificationIds}
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
            messagesCount={countActiveConversations(chatThreads, connectedIds)}
            registeredEventsCount={registeredEventIds.length}
            connectionsCount={connectionsCount}
            postsCount={postsCount}
            eventsCount={eventsCount}
            checklistDone={checkedChecklistIds.length}
            checklistTotal={CHECKLIST_ITEMS.length}
            onMenuPress={setProfileView}
          />
        );
    }
  };

  const renderContent = () => {
    if (tab === 'home' && showFeed) {
      return (
        <FeedScreen
          posts={posts}
          likedPostIds={likedPostIds}
          onBack={() => setShowFeed(false)}
          onAddPost={addPost}
          onSelectPost={openPost}
          onToggleLike={toggleLikePost}
          onRefresh={refreshPosts}
        />
      );
    }
    if (tab === 'home') {
      return (
        <HomeScreen
          profile={profile}
          posts={posts}
          onNavigate={handleNavigate}
          onOpenJob={openJob}
          onOpenEvent={openEvent}
          onOpenFeed={() => setShowFeed(true)}
          onOpenPost={openPost}
          onOpenSearch={() => setShowSearch(true)}
          onOpenChecklist={openChecklist}
          onOpenProfileSetup={() => setShowProfileSetup(true)}
          onOpenNotifications={openNotifications}
          onOpenMessages={openMessages}
          onOpenSaved={openSavedJobs}
          unreadCount={unreadCount}
          messagesCount={countActiveConversations(chatThreads, connectedIds)}
          checklistDone={checkedChecklistIds.length}
          checklistTotal={CHECKLIST_ITEMS.length}
          registeredEventIds={registeredEventIds}
          savedJobsCount={savedJobIds.length}
        />
      );
    }
    if (tab === 'jobs') {
      return (
        <JobsScreen
          onSelectJob={openJob}
          savedJobIds={savedJobIds}
          onToggleSave={toggleSaveJob}
          onRefresh={simulateRefresh}
        />
      );
    }
    if (tab === 'networking') {
      return (
        <NetworkingScreen
          onSelectEvent={openEvent}
          onSelectMember={openMember}
          connectedIds={connectedIds}
        />
      );
    }
    if (tab === 'profile') {
      return renderProfileContent();
    }
    return <ImmigrationScreen onSelectGuide={openGuide} />;
  };

  if (!authReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return null;
  }

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>{renderContent()}</View>
      <TabBar active={tab} onChange={handleTabChange} />
      {showOnboarding && (
        <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />
      )}
      <ProfileSetupSheet
        profile={profile}
        visible={showProfileSetup}
        onComplete={handleProfileSetupComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
