// Activity feed — chronological list of notification events surfaced by
// the bell icon in the nav rail. Most recent first.
//
// Each event points back to the source chat (and message or channel post)
// where the triggering action happened so the Activity view can load that
// experience in the right-hand canvas when the event is clicked.
//
// Event shape:
//   {
//     id,
//     type: 'reaction' | 'reply' | 'mention',
//     actorId,              // contact id of the person who did the thing
//     chatId,               // source chat (contact id)
//     messageId,            // anchor message id in that chat (for regular chats)
//     postId,               // for channel events: the root post id
//     replyId,              // for channel replies: the specific reply id
//     emoji,                // for type='reaction'
//     time,                 // display label, matches the triggering message style
//     unread,               // true → bold name + unread dot
//   }
//
// Content is hand-authored against existing messages/posts so clicking an
// event scrolls to a real, seeded piece of content and the demo reads true.

export const activityEvents = [
  {
    id: 'a-1',
    type: 'reaction',
    actorId: 3,
    chatId: 3,
    messageId: 15,
    emoji: '🌴',
    time: 'Today 4:30 PM',
    unread: true,
  },
  {
    id: 'a-2',
    type: 'reaction',
    actorId: 7,
    chatId: 8,
    messageId: 13,
    emoji: '💯',
    time: 'Today 2:40 PM',
    unread: true,
  },
  {
    id: 'a-3',
    type: 'reply',
    actorId: 30,
    chatId: 29,
    postId: 'p29-4',
    replyId: 'p29-4-r1',
    time: 'Today 12:34 PM',
    unread: true,
  },
  {
    id: 'a-4',
    type: 'reaction',
    actorId: 10,
    chatId: 10,
    messageId: 18,
    emoji: '👍',
    time: 'Today 11:22 AM',
    unread: true,
  },
  {
    id: 'a-5',
    type: 'reaction',
    actorId: 9,
    chatId: 9,
    messageId: 13,
    emoji: '👍',
    time: 'Today 10:16 AM',
    unread: false,
  },
  {
    id: 'a-6',
    type: 'reply',
    actorId: 12,
    chatId: 27,
    postId: 'p27-3',
    replyId: 'p27-3-r1',
    time: 'Yesterday 5:40 PM',
    unread: false,
  },
  {
    id: 'a-7',
    type: 'reply',
    actorId: 30,
    chatId: 28,
    postId: 'p28-3',
    replyId: 'p28-3-r1',
    time: 'Yesterday 4:45 PM',
    unread: false,
  },
  {
    id: 'a-8',
    type: 'reply',
    actorId: 30,
    chatId: 29,
    postId: 'p29-2',
    replyId: 'p29-2-r1',
    time: '4/18 6:02 PM',
    unread: false,
  },
  {
    id: 'a-9',
    type: 'mention',
    actorId: 12,
    chatId: 11,
    messageId: 9,
    time: 'Mon 10:00 AM',
    unread: false,
  },
  {
    id: 'a-10',
    type: 'reaction',
    actorId: 5,
    chatId: 5,
    messageId: 6,
    emoji: '🤫',
    time: 'Mon 11:32 AM',
    unread: false,
  },
]
