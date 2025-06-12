import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  AppleAuthProvider,
} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appleAuth, {
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';

export async function onAppleButtonPressAndroid() {
  // Start the sign-in request
  const rawNonce = uuid();
  const state = uuid();
  appleAuthAndroid.configure({
    // The Service ID you registered with Apple
    clientId: 'com.legendmotorsglobal.sso',

    // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
    // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
    redirectUri: 'https://legendmotorsglobal.com/__/auth/handler',

    // The type of response requested - code, id_token, or both.
    responseType: appleAuthAndroid.ResponseType.ALL,

    // The amount of user information requested from Apple.
    scope: appleAuthAndroid.Scope.ALL,

    // Random nonce value that will be SHA256 hashed before sending to Apple.
    nonce: rawNonce,

    // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
    state,
  });
  const response = await appleAuthAndroid.signIn();
  // Create a Firebase credential from the response
  const {id_token, nonce} = response;
  const appleCredential = AppleAuthProvider.credential(id_token, nonce);

  // Sign the user in with the credential
  return signInWithCredential(getAuth(), appleCredential);
}
export async function onAppleButtonPressIOS() {
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });
  const {identityToken, nonce} = appleAuthRequestResponse;
  const appleCredential = AppleAuthProvider.credential(identityToken, nonce);
  return signInWithCredential(getAuth(), appleCredential);
}
export async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  // Get the users ID token
  const signInResult = await GoogleSignin.signIn();

  // Try the new style of google-sign in result, from v13+ of that module
  let idToken = signInResult.data?.idToken;
  if (!idToken) {
    // if you are using older versions of google-signin, try old style result
    idToken = signInResult.idToken;
  }

  if (!idToken) {
    throw new Error('No ID token found');
  }

  // Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(
    signInResult.data.idToken,
  );

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), googleCredential);
}
