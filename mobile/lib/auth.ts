import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth } from './firebase'

const THREAD_KEY = 'chat_thread_id'

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(THREAD_KEY)
  await firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getStoredThreadId(): Promise<string | null> {
  return AsyncStorage.getItem(THREAD_KEY)
}

export async function setStoredThreadId(id: string): Promise<void> {
  await AsyncStorage.setItem(THREAD_KEY, id)
}

export async function clearStoredThreadId(): Promise<void> {
  await AsyncStorage.removeItem(THREAD_KEY)
}

export type { User }
