-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'STATUS_CHANGE';

-- AlterTable
ALTER TABLE "ActionItem" ADD COLUMN     "order" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ActionItem_workspaceId_idx" ON "ActionItem"("workspaceId");

-- CreateIndex
CREATE INDEX "ActionItem_assigneeId_idx" ON "ActionItem"("assigneeId");

-- CreateIndex
CREATE INDEX "ActionItem_goalId_idx" ON "ActionItem"("goalId");

-- CreateIndex
CREATE INDEX "ActionItem_status_idx" ON "ActionItem"("status");

-- CreateIndex
CREATE INDEX "ActionItem_dueDate_idx" ON "ActionItem"("dueDate");

-- CreateIndex
CREATE INDEX "Announcement_workspaceId_idx" ON "Announcement"("workspaceId");

-- CreateIndex
CREATE INDEX "Announcement_isPinned_idx" ON "Announcement"("isPinned");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_idx" ON "AuditLog"("workspaceId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "Comment_announcementId_idx" ON "Comment"("announcementId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Goal_workspaceId_idx" ON "Goal"("workspaceId");

-- CreateIndex
CREATE INDEX "Goal_ownerId_idx" ON "Goal"("ownerId");

-- CreateIndex
CREATE INDEX "Goal_dueDate_idx" ON "Goal"("dueDate");

-- CreateIndex
CREATE INDEX "Goal_status_idx" ON "Goal"("status");

-- CreateIndex
CREATE INDEX "Goal_workspaceId_status_idx" ON "Goal"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "GoalActivity_goalId_idx" ON "GoalActivity"("goalId");

-- CreateIndex
CREATE INDEX "GoalActivity_userId_idx" ON "GoalActivity"("userId");

-- CreateIndex
CREATE INDEX "Milestone_goalId_idx" ON "Milestone"("goalId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_workspaceId_idx" ON "WorkspaceInvite"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_email_idx" ON "WorkspaceInvite"("email");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
