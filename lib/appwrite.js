import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.uzairahmedk.nexa',  // Corrected 'plateform' to 'platform'
    projectId: '66b75a770024ed65102c',
    databaseId: '66b75c1d003bb0d43fb5',
    userCollectionId: '66b75c4f0037c88e1918',
    postCollectionId: '66b75c9e00134a81ad02',
    storageId: '66b75ea7001b2074ceac'
}

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client)

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountid: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    // Create a new session with email and password
    const session = await account.createEmailPasswordSession(email, password);
    console.log('Session created:', session);
    return session;
  } catch (error) {
    console.error('Error in signIn:', error);
    throw new Error(error);
  }
}


  // Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw new Error("No account found");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountid", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) {
      throw new Error("User not found in the database");
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.orderDesc("$createdAt"),  // Ensuring posts are ordered by creation date in descending order
        Query.limit(7)  // Adjust this to the number of latest posts you want to fetch
      ]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(`Failed to fetch latest posts: ${error.message}`);
  }
}

// Get video posts that matches search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}


export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("Creator", userId)]  // Replace "Creator" with the correct field storing user ID
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign Out
export async function signOut() {
  try {
    // Ensure that there is an active session before deleting
    const session = await account.getSession('current');
    
    if (!session) {
      console.error('No active session to log out from.');
      return;  // Don't throw an error if no session exists
    }

    // Delete the current session if one exists
    const deletedSession = await account.deleteSession('current');
    console.log('Session deleted:', deletedSession);
    return deletedSession;
  } catch (error) {
    console.error('Error in signOut:', error.message || error);
    throw new Error(error);
  }
}

//sign in works perfectly, need to implement sighn out and see if errors pop up, prpfile section had an error about an id null

// Create Video Post
export async function createVideoPost(form) {
  try {
    // Use description instead of prompt
    const [thumbnailUrl, postUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.post, "video"),  // Changed from video to post
    ]);

    // Create new post document
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        post: postUrl,  // Changed from video to post
        description: form.description,  // Changed from prompt to description
        Creator: form.accountid 
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }
}

// Upload File
export async function uploadFile(file, type) {
  if (!file) return;

  const asset = {
    name: file.fileName || 'unknown_file_name', // Ensure fileName is valid
    type: file.mimeType || 'application/octet-stream', // Default to generic type
    size: file.fileSize || 0,  // Handle missing size
    uri: file.uri,
  };

  try {
    // Upload file to storage
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    // Get preview or viewable URL for the file
    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    // Get file preview for post (video) or image
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);  // No changes here
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error("File preview not available");

    return fileUrl;
  } catch (error) {
    throw new Error(`Failed to get file preview: ${error.message}`);
  }
}