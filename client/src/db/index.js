import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateGraphQL } from 'rxdb/plugins/replication-graphql';

// Schema definitions
const postSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: ['share', 'need']
    },
    userId: {
      type: 'string'
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    }
  },
  required: ['id', 'title', 'description', 'type', 'userId', 'createdAt']
};

const messageSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    conversationId: {
      type: 'string'
    },
    senderId: {
      type: 'string'
    },
    receiverId: {
      type: 'string'
    },
    content: {
      type: 'string'
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    }
  },
  required: ['id', 'conversationId', 'senderId', 'receiverId', 'content', 'createdAt']
};

let dbPromise = null;

const createDb = async () => {
  const db = await createRxDatabase({
    name: 'sharedandneedsdb',
    storage: getRxStorageDexie()
  });

  // Create collections
  await db.addCollections({
    posts: {
      schema: postSchema
    },
    messages: {
      schema: messageSchema
    }
  });

  // Setup replication
  const syncPosts = replicateGraphQL({
    collection: db.posts,
    url: process.env.REACT_APP_API_URL || 'http://localhost:3000/graphql',
    pull: {
      queryBuilder: (lastPulledId) => {
        return {
          query: `
            query SyncPosts($lastId: String) {
              posts(lastId: $lastId) {
                id
                title
                description
                type
                userId
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            lastId: lastPulledId
          }
        };
      },
      modifier: (doc) => doc
    },
    push: {
      queryBuilder: (doc) => {
        return {
          query: `
            mutation SyncPost($post: PostInput!) {
              syncPost(post: $post) {
                id
                title
                description
                type
                userId
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            post: doc
          }
        };
      }
    },
    live: true,
    retryTime: 1000 * 60, // 1 minute
    waitForLeadership: true
  });

  // Handle replication errors
  syncPosts.error$.subscribe(error => {
    console.error('Replication error:', error);
  });

  return db;
};

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = createDb();
  }
  return dbPromise;
};

// Helper functions for posts
export const getPosts = async () => {
  const db = await getDb();
  return db.posts.find().exec();
};

export const createPost = async (postData) => {
  const db = await getDb();
  const post = {
    ...postData,
    id: `post_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return db.posts.insert(post);
};

// Helper functions for messages
export const getMessages = async (conversationId) => {
  const db = await getDb();
  return db.messages
    .find({
      selector: { conversationId }
    })
    .sort({ createdAt: 'asc' })
    .exec();
};

export const createMessage = async (messageData) => {
  const db = await getDb();
  const message = {
    ...messageData,
    id: `msg_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  return db.messages.insert(message);
};

// Subscribe to changes
export const subscribeToMessages = (conversationId, callback) => {
  getDb().then(db => {
    db.messages
      .find({
        selector: { conversationId }
      })
      .$.subscribe(callback);
  });
};

export const subscribeToAllPosts = (callback) => {
  getDb().then(db => {
    db.posts
      .find()
      .$.subscribe(callback);
  });
};
