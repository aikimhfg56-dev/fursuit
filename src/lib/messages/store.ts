import { getRedisClient } from "@/lib/upstash";

export type ThreadKind = "commission" | "preorder" | "contact";
export type MessageSender = "buyer" | "seller";

export type ThreadRecord = {
  id: string;
  kind: ThreadKind;
  buyerUserId: string;
  buyerName?: string;
  buyerEmail?: string;
  /** "RF-039", etc. — shared with preorder/commission orders' customer-number sequence. Absent for "contact" threads. */
  customerNumber?: string;
  productName: string;
  productSlug?: string;
  referenceCode?: string;
  /** Contact-form threads have no Clerk account to gate on — this unguessable value, carried in the thread's URL, is the only way in. */
  accessToken?: string;
  trackingNumber?: string;
  shippedAt?: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  buyerLastReadAt: string;
  sellerLastReadAt: string;
};

export type MessageRecord = {
  id: string;
  sender: MessageSender;
  text?: string;
  imageUrl?: string;
  createdAt: string;
};

export type StoredMessageImage = { contentType: string; data: string; threadId: string };

const THREAD_KEY = (id: string) => `thread:${id}`;
const THREAD_MESSAGES_KEY = (id: string) => `thread:${id}:messages`;
const BUYER_THREADS_KEY = (userId: string) => `buyer:${userId}:threads`;
const SELLER_THREADS_KEY = "seller:threads";
const MESSAGE_IMAGE_KEY = (imageId: string) => `message:image:${imageId}`;

const MAX_IMAGE_BYTES = 1_500_000;

export type CreateThreadInput = {
  kind: ThreadKind;
  /** Omit for anonymous (contact-form) threads — a synthetic id is generated so the buyer-index key still has something to key off. */
  buyerUserId?: string;
  buyerName?: string;
  buyerEmail?: string;
  /** Assign via lib/customerNumber.ts before calling — for preorder, reuse the number already assigned to its order rather than assigning a second one. */
  customerNumber?: string;
  productName: string;
  productSlug?: string;
  referenceCode?: string;
};

export async function createThread(input: CreateThreadInput): Promise<ThreadRecord> {
  const redis = getRedisClient();
  const now = new Date().toISOString();
  const buyerUserId = input.buyerUserId ?? `anon:${crypto.randomUUID()}`;
  const record: ThreadRecord = {
    id: crypto.randomUUID(),
    kind: input.kind,
    buyerUserId,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    customerNumber: input.customerNumber,
    productName: input.productName,
    productSlug: input.productSlug,
    referenceCode: input.referenceCode,
    accessToken: input.kind === "contact" ? crypto.randomUUID() : undefined,
    createdAt: now,
    lastMessageAt: now,
    lastMessagePreview: "",
    // Both sides start "caught up" — a thread with no messages yet isn't unread for anyone.
    buyerLastReadAt: now,
    sellerLastReadAt: now,
  };

  await redis.set(THREAD_KEY(record.id), record);
  await redis.sadd(BUYER_THREADS_KEY(buyerUserId), record.id);
  await redis.sadd(SELLER_THREADS_KEY, record.id);
  return record;
}

export async function getThread(threadId: string): Promise<ThreadRecord | null> {
  return (await getRedisClient().get<ThreadRecord>(THREAD_KEY(threadId))) ?? null;
}

/** A contact-form thread's only "authentication" is knowing this token, so the comparison must not short-circuit on an empty/undefined value. */
export function isValidThreadToken(thread: ThreadRecord, token: string | null | undefined): boolean {
  return thread.kind === "contact" && Boolean(thread.accessToken) && thread.accessToken === token;
}

/** Records a tracking number and marks the order shipped — seller-only, and only meaningful for threads tied to a physical order (not contact inquiries). */
export async function setTrackingNumber(threadId: string, trackingNumber: string): Promise<ThreadRecord> {
  const redis = getRedisClient();
  const thread = await getThread(threadId);
  if (!thread) throw new Error("Thread not found");

  const updated: ThreadRecord = {
    ...thread,
    trackingNumber,
    shippedAt: new Date().toISOString(),
  };
  await redis.set(THREAD_KEY(threadId), updated);
  return updated;
}

async function saveMessageImage(dataUrl: string, threadId: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
  if (!match) throw new Error("Unsupported image format");

  const [, contentType, data] = match;
  if (Buffer.byteLength(data, "base64") > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large after compression — try a smaller photo");
  }

  const imageId = crypto.randomUUID();
  await getRedisClient().set<StoredMessageImage>(MESSAGE_IMAGE_KEY(imageId), { contentType, data, threadId });
  return `/api/messages/images/${imageId}`;
}

export async function getMessageImage(imageId: string): Promise<StoredMessageImage | null> {
  return (await getRedisClient().get<StoredMessageImage>(MESSAGE_IMAGE_KEY(imageId))) ?? null;
}

export type AddMessageInput = {
  sender: MessageSender;
  text?: string;
  /** A "data:image/...;base64,..." URL from the client-side resize helper. */
  imageDataUrl?: string;
};

export async function addMessage(threadId: string, input: AddMessageInput): Promise<MessageRecord> {
  const redis = getRedisClient();
  const thread = await getThread(threadId);
  if (!thread) throw new Error("Thread not found");

  const imageUrl = input.imageDataUrl ? await saveMessageImage(input.imageDataUrl, threadId) : undefined;
  const text = input.text?.trim() || undefined;
  if (!text && !imageUrl) throw new Error("Message must have text or an image");

  const message: MessageRecord = {
    id: crypto.randomUUID(),
    sender: input.sender,
    text,
    imageUrl,
    createdAt: new Date().toISOString(),
  };

  await redis.rpush<MessageRecord>(THREAD_MESSAGES_KEY(threadId), message);

  const updated: ThreadRecord = {
    ...thread,
    lastMessageAt: message.createdAt,
    lastMessagePreview: message.text ?? "📷",
    // Sending a message trivially marks it read on your own side.
    ...(input.sender === "buyer" ? { buyerLastReadAt: message.createdAt } : { sellerLastReadAt: message.createdAt }),
  };
  await redis.set(THREAD_KEY(threadId), updated);

  return message;
}

export async function listMessages(threadId: string): Promise<MessageRecord[]> {
  const redis = getRedisClient();
  return redis.lrange<MessageRecord>(THREAD_MESSAGES_KEY(threadId), 0, -1);
}

export async function listThreadsForBuyer(userId: string): Promise<ThreadRecord[]> {
  const redis = getRedisClient();
  const ids = await redis.smembers(BUYER_THREADS_KEY(userId));
  if (ids.length === 0) return [];

  const records = await Promise.all(ids.map((id) => getThread(id)));
  return records
    .filter((record): record is ThreadRecord => Boolean(record))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export async function listThreadsForSeller(): Promise<ThreadRecord[]> {
  const redis = getRedisClient();
  const ids = await redis.smembers(SELLER_THREADS_KEY);
  if (ids.length === 0) return [];

  const records = await Promise.all(ids.map((id) => getThread(id)));
  return records
    .filter((record): record is ThreadRecord => Boolean(record))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export async function markRead(threadId: string, side: MessageSender): Promise<void> {
  const redis = getRedisClient();
  const thread = await getThread(threadId);
  if (!thread) return;

  const now = new Date().toISOString();
  await redis.set<ThreadRecord>(THREAD_KEY(threadId), {
    ...thread,
    ...(side === "buyer" ? { buyerLastReadAt: now } : { sellerLastReadAt: now }),
  });
}

/** A thread is unread for `side` whenever the latest message arrived after that side last read it — sending a message updates your own read marker, so this needs no separate "who sent it" check. */
export function isThreadUnread(thread: ThreadRecord, side: MessageSender): boolean {
  const lastReadAt = side === "buyer" ? thread.buyerLastReadAt : thread.sellerLastReadAt;
  return thread.lastMessageAt > lastReadAt;
}
