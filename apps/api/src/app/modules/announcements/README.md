# Announcements Module Implementation

## Overview
The Announcements module provides rich-text announcement publishing with team member reactions (emoji) and commenting capabilities. Admins can pin important announcements to the top of the feed.

## Features

### 1. Announcements
- **Admin Publishing**: Admins can publish workspace-wide announcements
- **Rich Content**: Support for rich-text content (HTML/JSON)
- **Pinning**: Pin important announcements to appear at the top
- **Status**: Track creation and update timestamps
- **Authorship**: Each announcement tracks the author

### 2. Reactions
- **Emoji Support**: Team members can react with emoji
- **Toggle Reactions**: Same emoji-user combo removes the reaction
- **Grouped Display**: Reactions grouped by emoji with user lists
- **Unique Constraints**: One reaction per user-announcement-emoji combination

### 3. Comments & Threaded Replies
- **Top-Level Comments**: Comments on announcements
- **Threaded Replies**: Reply to individual comments
- **User Attribution**: Each comment shows who posted it and when
- **Edit & Delete**: Comments can be updated or deleted
- **Cascade Delete**: Deleting a comment removes all replies

## API Endpoints

### Announcement Management

#### Create Announcement
```
POST /announcements
Headers: Authorization: Bearer <token>
Body: {
  "title": "Q2 Roadmap Released",
  "content": "<h2>Q2 Priorities</h2><p>Focus on performance improvements...</p>",
  "workspaceId": "workspace-uuid"
}
Response: 201 Created
```

#### Get Announcement by ID
```
GET /announcements/:announcementId
Returns: Announcement with all reactions and comments
```

#### Get Announcements in Workspace
```
GET /announcements/workspace/:workspaceId
Returns: Array of announcements (pinned first, then by newest)
```

#### Update Announcement
```
PATCH /announcements/:announcementId
Body: {
  "title": "Updated Q2 Roadmap",
  "content": "<h2>Q2 Priorities - Updated</h2>...",
  "isPinned": true
}
```

#### Delete Announcement
```
DELETE /announcements/:announcementId
Cascade deletes: All reactions and comments
```

#### Pin Announcement
```
POST /announcements/:announcementId/pin
Moves announcement to top of workspace feed
```

#### Unpin Announcement
```
POST /announcements/:announcementId/unpin
Removes announcement from pinned section
```

#### Get Announcement Statistics
```
GET /announcements/workspace/:workspaceId/stats
Returns: {
  "total": 25,
  "pinned": 3,
  "unpinned": 22
}
```

### Reaction Management

#### Add/Toggle Reaction
```
POST /announcements/:announcementId/reactions
Body: {
  "emoji": "👍"
}
Returns: 200 OK (adds reaction if new, removes if already exists)
```

#### Get Reactions for Announcement
```
GET /announcements/:announcementId/reactions
Returns: Array of reaction groups with users
[
  {
    "emoji": "👍",
    "count": 5,
    "users": [
      { "id": "user-1", "name": "John", "avatar": "..." },
      { "id": "user-2", "name": "Jane", "avatar": "..." }
    ]
  },
  {
    "emoji": "🎉",
    "count": 2,
    "users": [...]
  }
]
```

### Comment Management

#### Create Comment
```
POST /announcements/:announcementId/comments
Body: {
  "content": "Great initiative! Looking forward to this."
}
Returns: 201 Created (top-level comment)
```

#### Get Comments for Announcement
```
GET /announcements/:announcementId/comments
Returns: Array of top-level comments with threaded replies
[
  {
    "id": "comment-1",
    "content": "Great initiative!",
    "user": { "id": "user-1", "name": "John", "avatar": "..." },
    "createdAt": "2026-04-30T10:00:00Z",
    "updatedAt": "2026-04-30T10:00:00Z",
    "replies": [
      {
        "id": "comment-1-reply-1",
        "content": "I agree! Let's discuss in the meeting.",
        "user": { "id": "user-2", "name": "Jane", "avatar": "..." },
        "createdAt": "2026-04-30T11:00:00Z"
      }
    ]
  }
]
```

#### Update Comment
```
PATCH /announcements/comments/:commentId
Body: {
  "content": "Updated comment text"
}
```

#### Delete Comment
```
DELETE /announcements/comments/:commentId
Cascade deletes: All replies to this comment
```

#### Reply to Comment (Threaded)
```
POST /announcements/comments/:commentId/replies
Body: {
  "content": "Great point! I agree."
}
Returns: 201 Created (threaded reply)
```

### Engagement Analytics

#### Get Engagement Metrics
```
GET /announcements/:announcementId/engagement
Returns: {
  "reactions": 12,
  "comments": 8,
  "topLevelComments": 5,
  "totalEngagement": 20
}
```

## Data Model

### Announcement
```typescript
{
  id: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
  title: string
  content: string (rich text - HTML/JSON)
  isPinned: boolean (default: false)
  workspaceId: string (UUID)
  authorId: string (UUID)
  
  // Relations
  author: User
  workspace: Workspace
  reactions: Reaction[]
  comments: Comment[]
}
```

### Reaction
```typescript
{
  id: string (UUID)
  emoji: string
  userId: string (UUID)
  announcementId: string (UUID)
  
  // Relations
  user: User
  announcement: Announcement
  
  // Unique constraint on (userId, announcementId, emoji)
}
```

### Comment
```typescript
{
  id: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
  content: string
  userId: string (UUID)
  announcementId: string (UUID)
  parentId?: string (UUID) // For threaded replies
  
  // Relations
  user: User
  announcement: Announcement
  parent?: Comment (if reply)
  replies: Comment[] (if parent)
  mentions: Mention[]
}
```

## Business Logic

### Pinning System
- Pinned announcements appear first in workspace feed
- Ordering: Pinned (desc) → Created Date (desc)
- Admins only can pin/unpin

### Reaction Toggling
- Same emoji-user pair acts as a toggle
- First request adds reaction
- Second request removes reaction
- Prevents duplicate reactions per user per emoji

### Comment Threading
- Comments belong to announcements
- Replies belong to a parent comment
- Deleting parent comment cascades to all replies
- Fetched with nested structure (replies included)

### Engagement Tracking
- Reactions count: Total emoji reactions
- Comments count: All comments + replies
- Top-level comments: Only direct comments on announcement

## Error Handling

All endpoints use the `catchAsync` middleware:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing auth)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Authentication

All endpoints require authentication via the `auth()` middleware:
- Checks for valid JWT token
- Extracts user ID from token
- Passes user to request object

## Access Control

### Current Implementation
- All authenticated users can: View, comment, react, create announcements
- Future enhancement: Role-based access (only admins create/pin)

### Recommended Enhancement
```typescript
// Add authorization middleware for admin-only operations
router.post('/:announcementId/pin', auth(), adminOnly(), controller);
```

## Performance Considerations

1. **Indexes**:
   - workspaceId (for workspace queries)
   - isPinned (for sorting)

2. **N+1 Query Prevention**:
   - All fetches use `.include()` for related data
   - Reactions grouped client-side for efficiency

3. **Pagination Future**:
   - Announcements could be paginated by date
   - Comments could be paginated for large threads

## Future Enhancements

1. **Permission System**: Role-based pin/delete permissions
2. **Rich Text Editor**: WYSIWYG editor support
3. **Attachments**: Support for images/files
4. **Search**: Full-text search for announcements
5. **Notifications**: Notify workspace on new announcement
6. **Mentions**: @mention specific users with notifications
7. **Read Status**: Track who has read announcements
8. **Scheduling**: Schedule announcements for future publish
9. **Categories**: Organize announcements by category
10. **Reaction Limits**: Configurable emoji reactions
11. **Comment Moderation**: Flag/report inappropriate comments
12. **Pagination**: For large comment threads and announcement lists
13. **Soft Delete**: Archive instead of hard delete
14. **Edit History**: Track announcement edits
