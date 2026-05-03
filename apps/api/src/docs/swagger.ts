import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config';

const baseUrl = `http://localhost:${config.port || 5000}`;

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Team Hub API',
            version: '1.0.0',
            description: 'API documentation for Team Hub application',
            contact: {
                name: 'Team Hub',
                email: 'support@teamhub.com',
            },
        },
        servers: [
            {
                url: `${baseUrl}`,
                description: 'Development server',
            },
            {
                url: config.frontendUrl || 'https://teamhub.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                        error: {
                            type: 'object',
                            properties: {
                                path: { type: 'string' },
                                message: { type: 'string' },
                            },
                        },
                    },
                },
                    RefreshTokenRequest: {
                    type: 'object',
                    properties: {
                        refreshToken: {
                            type: 'string',
                            description: 'Required only when not sending via cookie',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                    },
                },
                AuthTokenResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Token refreshed' },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                },
                                refreshToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                },
                                user: {
                                    $ref: '#/components/schemas/User',
                                },
                            },
                        },
                    },
                },
                Goal: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        dueDate: { type: 'string', format: 'date-time' },
                        priority: { type: 'string' },
                        status: { type: 'string' },
                        progress: { type: 'number' },
                        workspaceId: { type: 'string' },
                        ownerId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                GoalCreate: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        dueDate: { type: 'string', format: 'date-time' },
                        priority: { type: 'string' },
                        workspaceId: { type: 'string' },
                    },
                    required: ['title', 'workspaceId'],
                },
                Milestone: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        dueDate: { type: 'string', format: 'date-time' },
                        status: { type: 'string' },
                        progress: { type: 'number' },
                        goalId: { type: 'string' },
                    },
                },
                Activity: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        content: { type: 'string' },
                        goalId: { type: 'string' },
                        authorId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Workspace: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        accentColor: { type: 'string' },
                        ownerId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                WorkspaceCreate: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        accentColor: { type: 'string' },
                    },
                    required: ['name'],
                },
                InviteMemberRequest: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
                    },
                    required: ['email'],
                },
                AcceptInviteRequest: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                    },
                    required: ['token'],
                },
                WorkspaceInvite: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
                        status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'EXPIRED'] },
                        workspaceId: { type: 'string' },
                        sender: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        expiresAt: { type: 'string', format: 'date-time' },
                    },
                },
                WorkspaceMember: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
                        userId: { type: 'string' },
                        workspaceId: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                email: { type: 'string' },
                                avatar: { type: 'string' },
                            },
                        },
                    },
                },
                ActionItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        priority: { type: 'string' },
                        status: { type: 'string' },
                        dueDate: { type: 'string', format: 'date-time' },
                        workspaceId: { type: 'string' },
                        assigneeId: { type: 'string' },
                        goalId: { type: 'string' },
                    },
                },
                ActionItemCreate: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        priority: { type: 'string' },
                        dueDate: { type: 'string', format: 'date-time' },
                        workspaceId: { type: 'string' },
                        assigneeId: { type: 'string' },
                        goalId: { type: 'string' },
                    },
                    required: ['title', 'workspaceId'],
                },
                Announcement: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        workspaceId: { type: 'string' },
                        isPinned: { type: 'boolean' },
                        authorId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Comment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        content: { type: 'string' },
                        announcementId: { type: 'string' },
                        parentId: { type: 'string' },
                        authorId: { type: 'string' },
                        mentionedUserIds: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Reaction: {
                    type: 'object',
                    properties: {
                        emoji: { type: 'string' },
                        userId: { type: 'string' },
                    },
                },
                DashboardStats: {
                    type: 'object',
                    properties: {
                        totalGoals: { type: 'number' },
                        completedGoals: { type: 'number' },
                        pendingActionItems: { type: 'number' },
                        membersCount: { type: 'number' },
                    },
                },
                FileUpload: {
                    type: 'object',
                    properties: {
                        filename: { type: 'string' },
                        url: { type: 'string' },
                        mimetype: { type: 'string' },
                        size: { type: 'number' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/app/modules/**/*.ts', './src/app/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options) as any;
