import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '679694876927-f0h7oive0boe8o7hfj71ir4dioeatfbq.apps.googleusercontent.com';
const redirectUri = AuthSession.makeRedirectUri({ useProxy: true, 
  native: 'https://auth.expo.io/@greenrent/greenrent'
});

console.log('Using Expo Proxy Redirect URI:', redirectUri);

export const configureGoogle = () => {
  console.log('Google Auth configured with Expo proxy');
};

export async function googleSignIn() {
  try {
    console.log('Starting Google Sign-In with Expo proxy');
    
    // Use the newer approach with useAuthRequest hook style
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: true,
      extraParams: {
        prompt: 'select_account',
        access_type: 'offline'
      },
    });

    // Initialize the request
    await request.makeAuthUrlAsync(discovery);

    console.log('Auth URL created');

    // Use promptAsync instead of startAsync
    const result = await request.promptAsync(discovery, {
      useProxy: true
    });

    console.log('Auth result type:', result.type);

    if (result.type === 'success' && result.params.code) {
      console.log('Received authorization code, exchanging for tokens...');
      
      // Exchange the code for tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          redirectUri: redirectUri,
          code: result.params.code,
          extraParams: {
            code_verifier: request.codeVerifier || '',
          },
        },
        discovery
      );

      console.log('Token exchange successful:', tokenResult);
      
      if (tokenResult.idToken) {
        return { 
          idToken: tokenResult.idToken,
          accessToken: tokenResult.accessToken,
          user: tokenResult
        };
      } else {
        throw new Error('No ID token received from Google');
      }
    } else if (result.type === 'cancel') {
      throw new Error('User cancelled authentication');
    } else {
      throw new Error(`Authentication failed: ${result.type}`);
    }

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}