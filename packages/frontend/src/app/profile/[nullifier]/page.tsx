"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { FileUploader } from "@/components/FileUploader";
import { ImageDisplay } from "@/components/ImageDisplay";
import { PostItem } from "@/components/PostItem";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useSuggestedUsers } from "@/hooks/useProfile";
import { useFeed } from "@/hooks/useFeed";
import { useFollow, useBlock } from "@/hooks/useSocial";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useCreateConversation } from "@/hooks/useConversations";
import { useToast } from "@/providers/ToastProvider";
import { apiFetch } from "@/lib/api";
import { formatBalance, weiToEth } from "@/lib/format";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getTierName } from "@/lib/tiers";
import type { Post, CursorPage, Gender } from "@/lib/types";

const TABS = ["Posts", "Replies", "Media", "Likes"] as const;
type Tab = (typeof TABS)[number];

/* ------------------------------------------------------------------ */
/*  Right sidebar                                                      */
/* ------------------------------------------------------------------ */
function ProfileRightSidebar() {
  const { isAuthenticated } = useAuth();
  const { data: suggested } = useSuggestedUsers();
  const follow = useFollow();

  return (
    <>
      {isAuthenticated && (
        <section className="glass-panel p-6">
          <h3 className="font-bold text-lg mb-6 tracking-tight text-primary matrix-glow">
            Suggested for You
          </h3>
          <div className="space-y-4">
            {suggested?.map((u) => (
              <div key={u.nullifier} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 border border-outline flex items-center justify-center">
                    <Icon name="person" className="text-on-surface-variant/60 text-sm" />
                  </div>
                  <p className="text-sm font-bold text-primary matrix-glow">
                    {formatBalance(u.public_balance)}
                  </p>
                </div>
                <button
                  onClick={() => follow.mutate(u.nullifier)}
                  disabled={follow.isPending}
                  className="px-4 py-1 border border-primary text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors uppercase tracking-widest disabled:opacity-50"
                >
                  Follow
                </button>
              </div>
            ))}
            {(!suggested || suggested.length === 0) && (
              <p className="text-xs text-on-surface-variant/50 font-mono">No suggestions yet</p>
            )}
          </div>
        </section>
      )}

      <footer className="px-5 text-[10px] text-on-surface-variant/50 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest font-mono">
        <p className="w-full mb-2">&copy; 2024 TERMINAL.GHOSTBALANCE.CHAT</p>
        <a className="hover:text-primary transition-colors" href="#">
          PRIVACY_MASK
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          TERMS_OF_SERVICE
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          KERNEL_STATUS
        </a>
      </footer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit profile form                                                  */
/* ------------------------------------------------------------------ */
function EditProfileForm({
  initialBio,
  initialGender,
  initialAge,
  initialAvatarKey,
  initialBannerKey,
  onCancel,
  onSaved,
}: {
  initialBio: string;
  initialGender: Gender | null;
  initialAge: number | null;
  initialAvatarKey: string | null;
  initialBannerKey: string | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [bio, setBio] = useState(initialBio);
  const [gender, setGender] = useState<Gender | "">(initialGender ?? "");
  const [age, setAge] = useState(initialAge?.toString() ?? "");
  const [editAvatarKey, setEditAvatarKey] = useState(initialAvatarKey);
  const [editBannerKey, setEditBannerKey] = useState(initialBannerKey);
  const updateProfile = useUpdateProfile();
  const { toastSuccess } = useToast();

  const handleSave = () => {
    updateProfile.mutate(
      {
        bio: bio || null,
        gender: gender || undefined,
        age: age ? parseInt(age, 10) : null,
        avatar_key: editAvatarKey,
        banner_key: editBannerKey,
      } as any,
      {
        onSuccess: () => {
          toastSuccess("Profile updated");
          onSaved();
        },
      },
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Banner upload */}
      <div>
        <label className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest block mb-1">
          Banner
        </label>
        <FileUploader
          onComplete={(key) => setEditBannerKey(key)}
          className="h-32 w-full bg-surface-container border border-dashed border-outline hover:border-primary/60 transition-colors flex items-center justify-center"
        >
          {editBannerKey ? (
            <ImageDisplay uploadKey={editBannerKey} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <Icon name="add_a_photo" className="text-2xl text-on-surface-variant/60 mb-1" />
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold font-mono">
                Upload Banner
              </p>
            </div>
          )}
        </FileUploader>
      </div>

      {/* Avatar upload */}
      <div>
        <label className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest block mb-1">
          Avatar
        </label>
        <FileUploader
          onComplete={(key) => setEditAvatarKey(key)}
          className="h-20 w-20 bg-surface-container border-2 border-outline hover:border-primary/60 transition-colors flex items-center justify-center overflow-hidden"
        >
          {editAvatarKey ? (
            <ImageDisplay uploadKey={editAvatarKey} className="w-full h-full object-cover" />
          ) : (
            <Icon name="camera" className="text-2xl text-on-surface-variant/60" />
          )}
        </FileUploader>
      </div>

      <div>
        <label className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest block mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full bg-surface-container border border-outline p-3 text-sm font-mono text-on-surface resize-none focus:border-primary focus:outline-none transition-colors"
          placeholder="Write something about yourself..."
        />
        <p className="text-[10px] text-on-surface-variant/40 font-mono text-right mt-1">
          {bio.length}/500
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest block mb-1">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | "")}
            className="w-full bg-surface-container border border-outline p-2 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest block mb-1">
            Age (optional)
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={13}
            max={150}
            className="w-full bg-surface-container border border-outline p-2 text-sm font-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
            placeholder="--"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="px-6 py-2 bg-primary text-black text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {updateProfile.isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-outline text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Post list for a tab                                                */
/* ------------------------------------------------------------------ */
function PostList({ posts, isLoading }: { posts: Post[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="divide-y divide-outline/50">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-primary/10 w-1/3" />
                <div className="h-3 bg-primary/5 w-full" />
                <div className="h-3 bg-primary/5 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-on-surface-variant/50 text-sm font-mono">No posts yet</p>
      </div>
    );
  }

  return (
    <section className="divide-y divide-outline/50">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab content                                                        */
/* ------------------------------------------------------------------ */
function TabContent({ tab, nullifier }: { tab: Tab; nullifier: string }) {
  const postsQuery = useFeed({ author: nullifier });
  const repliesQuery = useFeed({ type: "replies", author: nullifier });
  const mediaQuery = useFeed({ type: "media", author: nullifier });
  const likesQuery = useQuery<CursorPage<Post>>({
    queryKey: ["profile", nullifier, "likes"],
    queryFn: () => apiFetch<CursorPage<Post>>(`/profiles/${nullifier}/likes`),
    enabled: tab === "Likes",
  });

  switch (tab) {
    case "Posts": {
      const posts = postsQuery.data?.pages.flatMap((p) => p.data) ?? [];
      return <PostList posts={posts} isLoading={postsQuery.isLoading} />;
    }
    case "Replies": {
      const posts = repliesQuery.data?.pages.flatMap((p) => p.data) ?? [];
      return <PostList posts={posts} isLoading={repliesQuery.isLoading} />;
    }
    case "Media": {
      const posts = mediaQuery.data?.pages.flatMap((p) => p.data) ?? [];
      return <PostList posts={posts} isLoading={mediaQuery.isLoading} />;
    }
    case "Likes": {
      const posts = likesQuery.data?.data ?? [];
      return <PostList posts={posts} isLoading={likesQuery.isLoading} />;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-40 bg-primary/5 border-b border-outline" />
      <div className="px-6 -mt-12 relative">
        <div className="w-24 h-24 bg-primary/10 border-2 border-outline" />
        <div className="mt-4 space-y-3">
          <div className="h-7 bg-primary/10 w-32" />
          <div className="h-3 bg-primary/5 w-48" />
          <div className="h-3 bg-primary/5 w-full" />
          <div className="h-3 bg-primary/5 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */
export default function ProfilePage({
  params,
}: {
  params: Promise<{ nullifier: string }>;
}) {
  const { nullifier } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: profile, isLoading, isError } = useProfile(nullifier);
  const follow = useFollow();
  const block = useBlock();
  const createConversation = useCreateConversation();
  const { toastSuccess, toastError } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("Posts");
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnProfile = user?.nullifier === nullifier;

  // Close menu on outside click
  useClickOutside(menuRef, useCallback(() => setMenuOpen(false), []), menuOpen);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${nullifier}`);
    toastSuccess("Profile link copied");
    setMenuOpen(false);
  };

  const handleBlock = () => {
    block.mutate(nullifier, {
      onSuccess: (data) => {
        toastSuccess(data.blocked ? "User blocked" : "User unblocked");
        setBlockConfirmOpen(false);
        setMenuOpen(false);
        if (data.blocked) router.push("/");
      },
      onError: (err) => toastError(err.message),
    });
  };

  // Reset local follow state when navigating to a different profile
  useEffect(() => { setIsFollowing(null); }, [nullifier]);

  // Use local state if user clicked, otherwise use server state
  const followState = isFollowing ?? profile?.viewer_following ?? false;

  const handleMessage = () => {
    createConversation.mutate(
      { participant: nullifier },
      {
        onSuccess: (data) => {
          router.push(`/conversations/${data.id}`);
        },
      }
    );
  };

  const handleFollow = () => {
    follow.mutate(nullifier, {
      onSuccess: (data) => {
        setIsFollowing(data.following);
      },
    });
  };

  const headerTitle = profile ? formatBalance(profile.public_balance) : "Profile";
  const headerSubtitle = profile ? "Verified Node Status" : undefined;

  return (
    <AppLayout rightSidebar={<ProfileRightSidebar />}>
      <PageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        showBack
        onBack={() => router.back()}
        rightContent={
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-primary cursor-pointer"
            >
              <Icon name="more_vert" className="text-xl" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-outline shadow-lg z-50">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="link" className="text-sm" />
                  Copy Link
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/profile/${nullifier}`;
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this profile on GhostBalance")}`, "_blank");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="open_in_new" className="text-sm" />
                  Share on X
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/profile/${nullifier}`;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Check out this profile on GhostBalance")}`, "_blank");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="send" className="text-sm" />
                  Share on Telegram
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/profile/${nullifier}`;
                    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent("Check out this profile on GhostBalance")}&embeds[]=${encodeURIComponent(url)}`, "_blank");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="hub" className="text-sm" />
                  Share on Warpcast
                </button>
                {isAuthenticated && !isOwnProfile && (
                  <>
                    <div className="border-t border-outline" />
                    <button
                      onClick={() => { setBlockConfirmOpen(true); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Icon name="block" className="text-sm" />
                      Block User
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        }
      />

      {/* Loading state */}
      {isLoading && <ProfileSkeleton />}

      {/* Not found state */}
      {!isLoading && (isError || !profile) && (
        <div className="p-12 text-center space-y-4">
          <Icon name="person_off" className="text-5xl text-on-surface-variant/30" />
          <p className="text-on-surface-variant/60 font-mono text-sm uppercase tracking-widest">
            Profile not found
          </p>
          <p className="text-on-surface-variant/40 font-mono text-xs">
            This node may have been decommissioned or never existed.
          </p>
        </div>
      )}

      {/* Profile content */}
      {!isLoading && profile && (
        <>
          {/* Banner */}
          <section>
            <div className="relative h-40 w-full bg-background overflow-hidden border-b border-outline">
              {profile.banner_key ? (
                <ImageDisplay
                  uploadKey={profile.banner_key}
                  className="w-full h-full object-cover"
                  fallback={<div className="w-full h-full bg-primary/5" />}
                />
              ) : (
                <div className="w-full h-full bg-primary/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="px-6 -mt-12 relative">
              <div className="flex justify-between items-end">
                <div className="relative">
                  <div className="w-24 h-24 border-2 border-primary overflow-hidden bg-background shadow-2xl shadow-primary/20 flex items-center justify-center">
                    {profile.avatar_key ? (
                      <ImageDisplay
                        uploadKey={profile.avatar_key}
                        className="w-full h-full object-cover"
                        fallback={<Icon name="person" className="text-on-surface-variant/60 text-4xl" />}
                      />
                    ) : (
                      <Icon name="person" className="text-on-surface-variant/60 text-4xl" />
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mb-2 flex gap-2">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-1.5 border border-primary text-primary text-xs font-bold hover:bg-primary/10 transition-colors uppercase tracking-widest"
                      >
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </button>
                      <button
                        onClick={() => router.push("/setup?reprove=true")}
                        className="px-4 py-1.5 bg-primary/10 border border-primary text-primary text-xs font-bold hover:bg-primary/20 transition-colors uppercase tracking-widest"
                      >
                        Update Balance
                      </button>
                    </>
                  ) : isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleMessage}
                        disabled={createConversation.isPending}
                        className="h-9 w-9 flex items-center justify-center border border-primary bg-background text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                        title="Message"
                      >
                        <Icon name="mail" className="text-sm" />
                      </button>
                      <button
                        onClick={handleFollow}
                        disabled={follow.isPending}
                        className={
                          followState
                            ? "h-9 min-w-[110px] px-4 flex items-center justify-center bg-primary text-black text-xs font-bold hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest disabled:opacity-50"
                            : "h-9 min-w-[110px] px-4 flex items-center justify-center border border-primary bg-background text-primary text-xs font-bold hover:bg-primary/10 transition-colors uppercase tracking-widest disabled:opacity-50"
                        }
                      >
                        {follow.isPending ? "..." : followState ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Edit form OR profile info */}
              {isEditing && isOwnProfile ? (
                <EditProfileForm
                  initialBio={profile.bio ?? ""}
                  initialGender={profile.gender}
                  initialAge={profile.age}
                  initialAvatarKey={profile.avatar_key}
                  initialBannerKey={profile.banner_key}
                  onCancel={() => setIsEditing(false)}
                  onSaved={() => setIsEditing(false)}
                />
              ) : (
                <>
                  <div className="mt-4 flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-primary matrix-glow">
                      {formatBalance(profile.public_balance)}
                    </h2>
                    <p className="text-[10px] text-on-surface-variant/60 font-mono tracking-widest">
                      {getTierName(weiToEth(profile.public_balance)).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/60 font-mono tracking-widest">
                      NODE_VERIFIED_BLOCK_{profile.block_number}
                    </p>
                  </div>

                  {profile.bio && (
                    <p className="mt-4 text-sm leading-relaxed text-on-surface-variant font-mono italic">
                      {profile.bio}
                    </p>
                  )}

                  {/* Gender & Age */}
                  {(profile.gender !== "other" || profile.age) && (
                    <div className="mt-3 flex gap-4 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50">
                      {profile.gender !== "other" && (
                        <span>{profile.gender}</span>
                      )}
                      {profile.age && (
                        <span>AGE_{profile.age}</span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-4 flex gap-6 text-xs font-mono uppercase tracking-wider">
                    <div className="flex gap-1 items-center cursor-pointer hover:text-primary transition-colors">
                      <span className="font-bold text-primary">{profile.follower_count}</span>
                      <span className="text-on-surface-variant/60">Followers</span>
                    </div>
                    <div className="flex gap-1 items-center cursor-pointer hover:text-primary transition-colors">
                      <span className="font-bold text-primary">{profile.following_count}</span>
                      <span className="text-on-surface-variant/60">Following</span>
                    </div>
                    <div className="flex gap-1 items-center cursor-pointer hover:text-primary transition-colors">
                      <span className="font-bold text-primary">{profile.post_count}</span>
                      <span className="text-on-surface-variant/60">Posts</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Tabs */}
          <nav className="mt-8 flex border-b border-outline">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center text-xs font-medium uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "text-primary font-bold border-b-2 border-primary matrix-glow"
                    : "text-on-surface-variant/60 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <TabContent tab={activeTab} nullifier={nullifier} />
        </>
      )}
      <ConfirmDialog
        open={blockConfirmOpen}
        title="Block User"
        message="They won't be able to see your posts or interact with you. Mutual follows will be removed."
        confirmLabel="Block"
        onConfirm={handleBlock}
        onCancel={() => setBlockConfirmOpen(false)}
      />
    </AppLayout>
  );
}
