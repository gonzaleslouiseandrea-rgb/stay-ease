// src/utils/googleAuth.js
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { sendVerificationEmail } from "./emailService";

const googleProvider = new GoogleAuthProvider();

/**
 * Google sign-in for registration flow. Creates user doc if needed and sends verification email.
 */
export const signInWithGoogleForRegister = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const verificationToken = btoa(`${user.email}:${Date.now()}`).replace(/[+/=]/g, "");
      const baseUrl = window.location.origin;
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

      const userData = {
        fullName: user.displayName || "User",
        email: user.email,
        phone: user.phoneNumber || "",
        address: "",
        role: "guest",
        createdAt: new Date().toISOString(),
        verified: false,
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        authProvider: "google",
        photoURL: user.photoURL || null,
      };

      await setDoc(userDocRef, userData);

      try {
        await sendVerificationEmail(
          user.email,
          user.displayName || "User",
          verificationLink
        );
        console.log("✅ Verification email sent to new Google user");
      } catch (emailError) {
        console.error("⚠️ Failed to send verification email to Google user:", emailError);
      }

      return { user, userData, isNewUser: true };
    }

    const existingData = userDoc.data();
    if (!existingData.authProvider) {
      await setDoc(
        userDocRef,
        {
          authProvider: "google",
          photoURL: user.photoURL || existingData.photoURL || null,
        },
        { merge: true }
      );
    }
    return { user, userData: { ...existingData, ...userDoc.data() }, isNewUser: false };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

/**
 * Google sign-in for login flow. Requires existing verified user in Firestore.
 */
export const signInWithGoogleForLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("No StayEase account found for this Google user. Please register first.");
    }

    const userData = userDoc.data();
    return { user, userData, isNewUser: false };
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

