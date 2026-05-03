# Announcements API - Usage Examples

## Authentication
All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Creating and Managing Announcements

### Example 1: Publishing an Announcement

```bash
# Create an announcement
curl -X POST http://localhost:5000/api/announcements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q2 2026 Roadmap Released",
    "content": "<h2>Q2 Priorities</h2><p>We are excited to announce our Q2 roadmap:</p><ul><li>Performance optimization</li><li>New dashboard features</li><li>API improvements</li></ul>",
    "workspaceId": "workspace-123"
  }'

# Response:
{
  "success": true,
  "message": "Announcement published",
  "data": {
    "id": "announcement-001",
    "title": "Q2 2026 Roadmap Released",
    "content": "<h2>Q2 Priorities</h2>...",
    "isPinned": false,
    "createdAt": "2026-04-30T10:00:00Z",
    "updatedAt": "2026-04-30T10:00:00Z",
    "author": {
      "id": "user-123",
      "name": "Admin User",
      "email": "admin@example.com",
      "avatar": "https://..."
    },
    "reactions": [],
    "comments": []
  }
}
```

### Example 2: Pinning an Important Announcement

```bash
# Pin the announcement to the top of the feed
curl -X POST http://localhost:5000/api/announcements/announcement-001/pin \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Announcement pinned",
  "data": {
    "id": "announcement-001",
    "isPinned": true,
    ...
  }
}

# Get announcements - pinned appears first
curl -X GET http://localhost:5000/api/announcements/workspace/workspace-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows pinned announcement first:
{
  "success": true,
  "message": "Announcements retrieved",
  "data": [
    {
      "id": "announcement-001",
      "title": "Q2 2026 Roadmap Released",
      "isPinned": true,  # Pinned announcement
      ...
    },
    {
      "id": "announcement-002",
      "title": "Team Building Event This Friday",
      "isPinned": false,  # Other announcements follow
      ...
    }
  ]
}
```

---

## Team Member Reactions

### Example 3: Adding Emoji Reactions

```bash
# Multiple team members react with emojis
curl -X POST http://localhost:5000/api/announcements/announcement-001/reactions \
  -H "Authorization: Bearer USER_1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "👍"}'

curl -X POST http://localhost:5000/api/announcements/announcement-001/reactions \
  -H "Authorization: Bearer USER_2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "👍"}'

curl -X POST http://localhost:5000/api/announcements/announcement-001/reactions \
  -H "Authorization: Bearer USER_3_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "🎉"}'

curl -X POST http://localhost:5000/api/announcements/announcement-001/reactions \
  -H "Authorization: Bearer USER_4_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "🚀"}'

# Get all reactions
curl -X GET http://localhost:5000/api/announcements/announcement-001/reactions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Reactions retrieved",
  "data": [
    {
      "emoji": "👍",
      "count": 2,
      "users": [
        { "id": "user-1", "name": "John", "avatar": "https://..." },
        { "id": "user-2", "name": "Jane", "avatar": "https://..." }
      ]
    },
    {
      "emoji": "🎉",
      "count": 1,
      "users": [
        { "id": "user-3", "name": "Bob", "avatar": "https://..." }
      ]
    },
    {
      "emoji": "🚀",
      "count": 1,
      "users": [
        { "id": "user-4", "name": "Alice", "avatar": "https://..." }
      ]
    }
  ]
}
```

### Example 4: Toggling Reactions

```bash
# User removes their reaction by sending the same emoji again
curl -X POST http://localhost:5000/api/announcements/announcement-001/reactions \
  -H "Authorization: Bearer USER_1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "👍"}'

# Response:
{
  "success": true,
  "message": "Reaction removed",
  "data": {
    "action": "removed"
  }
}

# Now getting reactions shows only 1 thumbs up
curl -X GET http://localhost:5000/api/announcements/announcement-001/reactions \
  -H "Authorization: Bearer YOUR_TOKEN"
# 👍 count is now 1 (John removed his reaction)
```

---

## Comments & Threaded Discussion

### Example 5: Adding Comments

```bash
# Team member 1 comments
curl -X POST http://localhost:5000/api/announcements/announcement-001/comments \
  -H "Authorization: Bearer USER_1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excited about the performance improvements! When will they be available?"
  }'

# Response:
{
  "success": true,
  "message": "Comment added",
  "data": {
    "id": "comment-001",
    "content": "Excited about the performance improvements! When will they be available?",
    "createdAt": "2026-04-30T11:00:00Z",
    "updatedAt": "2026-04-30T11:00:00Z",
    "user": {
      "id": "user-1",
      "name": "John",
      "avatar": "https://..."
    },
    "replies": []
  }
}

# Team member 2 comments
curl -X POST http://localhost:5000/api/announcements/announcement-001/comments \
  -H "Authorization: Bearer USER_2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is great news for our API clients. Looking forward to the beta release!"
  }'
```

### Example 6: Threaded Replies

```bash
# John replies to a comment
curl -X POST http://localhost:5000/api/announcements/comments/comment-001/replies \
  -H "Authorization: Bearer USER_1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Thanks for asking! Performance improvements roll out next week."
  }'

# Response:
{
  "success": true,
  "message": "Reply added",
  "data": {
    "id": "comment-001-reply-1",
    "content": "Thanks for asking! Performance improvements roll out next week.",
    "createdAt": "2026-04-30T12:00:00Z",
    "user": {
      "id": "user-1",
      "name": "John",
      "avatar": "https://..."
    }
  }
}

# Another reply to the same comment
curl -X POST http://localhost:5000/api/announcements/comments/comment-001/replies \
  -H "Authorization: Bearer USER_3_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "That is awesome! Can't wait to test it."
  }'

# Get all comments with threaded replies
curl -X GET http://localhost:5000/api/announcements/announcement-001/comments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows threaded structure:
{
  "success": true,
  "message": "Comments retrieved",
  "data": [
    {
      "id": "comment-001",
      "content": "Excited about the performance improvements! When will they be available?",
      "createdAt": "2026-04-30T11:00:00Z",
      "user": {
        "id": "user-1",
        "name": "John",
        "avatar": "https://..."
      },
      "replies": [
        {
          "id": "comment-001-reply-1",
          "content": "Thanks for asking! Performance improvements roll out next week.",
          "createdAt": "2026-04-30T12:00:00Z",
          "user": { "id": "user-1", "name": "John", "avatar": "https://..." }
        },
        {
          "id": "comment-001-reply-2",
          "content": "That is awesome! Can't wait to test it.",
          "createdAt": "2026-04-30T12:15:00Z",
          "user": { "id": "user-3", "name": "Bob", "avatar": "https://..." }
        }
      ]
    },
    {
      "id": "comment-002",
      "content": "This is great news for our API clients...",
      "createdAt": "2026-04-30T11:30:00Z",
      "user": {
        "id": "user-2",
        "name": "Jane",
        "avatar": "https://..."
      },
      "replies": []
    }
  ]
}
```

### Example 7: Editing Comments

```bash
# User edits their comment
curl -X PATCH http://localhost:5000/api/announcements/comments/comment-001 \
  -H "Authorization: Bearer USER_1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excited about the performance improvements! When will they be available in production?"
  }'

# Response:
{
  "success": true,
  "message": "Comment updated",
  "data": {
    "id": "comment-001",
    "content": "Excited about the performance improvements! When will they be available in production?",
    "updatedAt": "2026-04-30T11:05:00Z",
    ...
  }
}
```

### Example 8: Deleting Comments

```bash
# Delete a top-level comment (cascades to all replies)
curl -X DELETE http://localhost:5000/api/announcements/comments/comment-001 \
  -H "Authorization: Bearer USER_1_TOKEN"

# Response:
{
  "success": true,
  "message": "Comment deleted",
  "data": null
}

# Note: All replies to comment-001 are also deleted automatically
```

---

## Analytics & Statistics

### Example 9: Engagement Metrics

```bash
# Get engagement data for an announcement
curl -X GET http://localhost:5000/api/announcements/announcement-001/engagement \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Engagement metrics retrieved",
  "data": {
    "reactions": 12,
    "comments": 8,
    "topLevelComments": 5,
    "totalEngagement": 20
  }
}
```

### Example 10: Workspace Statistics

```bash
# Get announcement statistics for workspace
curl -X GET http://localhost:5000/api/announcements/workspace/workspace-123/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Announcement statistics retrieved",
  "data": {
    "total": 28,
    "pinned": 2,
    "unpinned": 26
  }
}
```

---

## Complete Workflow Example

```bash
# 1. Admin publishes announcement
ANNOUNCEMENT=$(curl -s -X POST http://localhost:5000/api/announcements \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Feature: Real-time Notifications",
    "content": "<h2>Announcing Real-time Notifications</h2><p>We are rolling out real-time notifications...</p>",
    "workspaceId": "ws-123"
  }' | jq -r '.data.id')

echo "Published announcement: $ANNOUNCEMENT"

# 2. Admin pins it
curl -X POST http://localhost:5000/api/announcements/$ANNOUNCEMENT/pin \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Team members react
for USER_TOKEN in "USER_1_TOKEN" "USER_2_TOKEN" "USER_3_TOKEN"; do
  curl -X POST http://localhost:5000/api/announcements/$ANNOUNCEMENT/reactions \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"emoji": "🚀"}'
done

# 4. Team members comment
curl -X POST http://localhost:5000/api/announcements/$ANNOUNCEMENT/comments \
  -H "Authorization: Bearer USER_1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is awesome! When is this available?"}'

# 5. Check engagement
curl -X GET http://localhost:5000/api/announcements/$ANNOUNCEMENT/engagement \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. View full announcement with all data
curl -X GET http://localhost:5000/api/announcements/$ANNOUNCEMENT \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- All timestamps are in ISO 8601 format with UTC timezone
- Emoji reactions are stored as Unicode strings
- Reactions toggle on/off (same emoji removes the reaction)
- Deleting a comment cascades to all replies
- Pinned announcements appear first in workspace feed
- Comments are fetched with threaded replies included
- All endpoints require authentication
- Rich content supports HTML for formatted text
