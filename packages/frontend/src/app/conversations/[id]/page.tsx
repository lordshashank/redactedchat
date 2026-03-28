"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { FileUploader } from "@/components/FileUploader";
import { ImageDisplay } from "@/components/ImageDisplay";
import { formatBalance, formatRelativeTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import {
  useMessages,
  useSendMessage,
  useMarkConversationRead,
} from "@/hooks/useConversations";
import type { Message } from "@/lib/types";

export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const messages = useMessages(id);
  const sendMessage = useSendMessage(id);
  const markRead = useMarkConversationRead(id);
  const [inputText, setInputText] = useState("");
  const [attachmentKey, setAttachmentKey] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/setup");
    }
  }, [authLoading, isAuthenticated, router]);

  // Mark conversation as read on mount
  useEffect(() => {
    if (id && isAuthenticated) {
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  // Reverse messages (API returns newest-first, we want oldest-first)
  const allMessages: Message[] = (
    messages.data?.pages?.flatMap((p) => p.data) ?? []
  )
    .slice()
    .reverse();

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = () => {
    if (!inputText.trim() && !attachmentKey) return;
    sendMessage.mutate(
      {
        body: inputText || undefined,
        attachment_key: attachmentKey || undefined,
      },
      {
        onSuccess: () => {
          setInputText("");
          setAttachmentKey(null);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const myNullifier = user?.nullifier;

  if (authLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Messages"
          showBack
          onBack={() => router.back()}
        />
        <div className="p-12 text-center">
          <p className="text-sm font-mono text-on-surface-variant/60">
            Loading...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Messages"
        subtitle="Conversation"
        showBack
        onBack={() => router.push("/conversations")}
      />

      {/* Message Area */}
      <div className="flex flex-col h-[calc(100vh-64px-72px)] overflow-y-auto">
        {/* Loading */}
        {messages.isLoading && (
          <div className="p-12 text-center flex-1 flex items-center justify-center">
            <p className="text-sm font-mono text-on-surface-variant/60">
              Loading messages...
            </p>
          </div>
        )}

        {/* Load older messages */}
        {messages.hasNextPage && (
          <div className="p-4 text-center">
            <button
              onClick={() => messages.fetchNextPage()}
              disabled={messages.isFetchingNextPage}
              className="px-4 py-1 border border-outline text-on-surface-variant/60 text-[10px] font-mono uppercase tracking-widest hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
            >
              {messages.isFetchingNextPage
                ? "LOADING..."
                : "LOAD OLDER MESSAGES"}
            </button>
          </div>
        )}

        {/* Empty */}
        {!messages.isLoading && allMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon
                name="chat"
                className="text-4xl text-on-surface-variant/30 mb-4"
              />
              <p className="text-sm font-mono text-on-surface-variant/60">
                No messages yet. Say hello!
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 space-y-3">
          {allMessages.map((msg) => {
            const isMe = msg.sender_nullifier === myNullifier;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => router.push(`/profile/${msg.sender_nullifier}`)}
                      className="text-[10px] font-bold text-primary matrix-glow mb-1 font-mono hover:underline hover:underline-offset-2 transition-colors cursor-pointer"
                    >
                      {formatBalance(msg.public_balance)}
                    </button>
                  )}
                  <div
                    className={`px-4 py-2.5 font-mono text-sm ${
                      isMe
                        ? "bg-primary/10 border border-primary/30 text-on-surface"
                        : "bg-surface-container border border-outline text-on-surface"
                    }`}
                  >
                    {msg.body}
                    {msg.attachment_key && (
                      <div className="mt-2 max-w-xs">
                        <ImageDisplay uploadKey={msg.attachment_key} className="w-full rounded" />
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-[9px] text-on-surface-variant/40 font-mono mt-1 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {formatRelativeTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-outline">
        {/* Attachment Preview */}
        {attachmentKey && (
          <div className="px-4 pt-3 pb-2 flex items-center gap-3">
            <div className="w-16 h-16 border border-outline overflow-hidden shrink-0">
              <ImageDisplay uploadKey={attachmentKey} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest flex-1">
              Image attached
            </span>
            <button
              onClick={() => setAttachmentKey(null)}
              className="text-on-surface-variant/60 hover:text-red-400 transition-colors"
            >
              <Icon name="close" className="text-base" />
            </button>
          </div>
        )}
        <div className="flex gap-3 items-end p-4">
          <FileUploader
            onComplete={(key) => setAttachmentKey(key)}
            className="shrink-0"
          >
            <div className="px-3 py-3 border border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer">
              <Icon name="image" className="text-lg" />
            </div>
          </FileUploader>
          <textarea
            className="flex-1 bg-surface-container border border-outline text-sm text-on-surface font-mono resize-none px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/30"
            placeholder="Type a message..."
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !attachmentKey) || sendMessage.isPending}
            className="px-4 py-3 bg-primary/10 border border-primary text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon
              name="send"
              className="text-lg"
            />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
