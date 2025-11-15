/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.verifyEmail = onRequest(async (req, res) => {
  try {
    const email = req.query.email;
    const token = req.query.token;

    if (!email || !token) {
      res.status(400).json({success: false, message: "Missing email or token"});
      return;
    }

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res
        .status(404)
        .json({success: false, message: "User not found. Please register again."});
      return;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.verified === true) {
      res.json({
        success: true,
        alreadyVerified: true,
        message: "Your email has already been verified. You are registered!",
      });
      return;
    }

    if (userData.verificationToken !== token) {
      res.status(400).json({
        success: false,
        message: "Invalid verification token. The link may have expired or been used.",
      });
      return;
    }

    if (userData.verificationTokenExpiry) {
      const expiryDate = new Date(userData.verificationTokenExpiry);
      if (expiryDate < new Date()) {
        res.status(400).json({
          success: false,
          message:
            "Verification link has expired. Please request a new verification email.",
        });
        return;
      }
    }

    await userDoc.ref.update({
      verified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      verifiedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      alreadyVerified: false,
      message: "Your email has been successfully verified! You are now registered.",
    });
  } catch (err) {
    console.error("verifyEmail function error:", err);
    res
      .status(500)
      .json({success: false, message: "Server error during verification."});
  }
});
