import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from 'react-native-appwrite';

export const config = {
  endpoint: process.env.EXPO_PUBLIC_AW_ENDPOINT,
  platform: process.env.EXPO_PUBLIC_AW_PLATFORM,
  projectId: process.env.EXPO_PUBLIC_AW_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_AW_DATABASE_ID,
  userCollectionId: process.env.EXPO_PUBLIC_AW_USER_COLLECTION_ID,
  videoCollectionId: process.env.EXPO_PUBLIC_AW_VIDEO_COLLECTION_ID,
  videoLikesCollectionId: process.env.EXPO_PUBLIC_AW_VIDEO_LIKES_COLLECTION_ID,
  storageId: process.env.EXPO_PUBLIC_AW_STORAGE_ID,
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  videoLikesCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    console.log('AAA newAccount :', newAccount);

    if (!newAccount) throw Error;

    const avatarUrl = await avatars.getInitials(username);
    await signIn(email, password);
    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    console.log('AAA newUser :', newUser);

    return newUser;
  } catch (error) {
    console.log('error :', error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) return;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log('error :', error);
    /* throw new Error(error.message); */
  }
};

export const getAllPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc('$createdAt'),
    ]);

    return posts.documents;
  } catch (error) {
    console.log('error :', error);
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc('$createdAt', Query.limit(7)),
    ]);

    return posts.documents;
  } catch (error) {
    console.log('error :', error);
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search('title', query),
    ]);

    return posts.documents;
  } catch (error) {
    console.log('error :', error);
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal('creator', userId),
    ]);

    return posts.documents;
  } catch (error) {
    console.log('error :', error);
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession('current');
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;
  try {
    if (type === 'video') {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === 'image') {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        'top',
        100
      );
    } else {
      throw new Error('Invalid file type');
    }

    if (!fileId) throw new Error('No file id');

    return fileUrl;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );
    console.log('aaa uploadedFile :', uploadedFile);
    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    console.log('aaa fileUrl :', fileUrl);

    return fileUrl;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createPost = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        video: videoUrl,
        thumbnail: thumbnailUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};
