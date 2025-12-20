package com.skillforge.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenVerifierService {

    // Ensure this matches your frontend EXACTLY
    private static final String CLIENT_ID = "1073323158180-id1th5d1qrdeslj9sopv1g913tjsggnh.apps.googleusercontent.com";

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService() {
        // Build the verifier ONCE to save resources
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory()
        )
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();
    }

    public GoogleIdToken.Payload verify(String idTokenString) {
        GoogleIdToken idToken = null;
        try {
            // This line connects to Google to check the signature
            idToken = verifier.verify(idTokenString);
        } catch (Exception e) {
            // 🔥 THIS LOG IS CRITICAL: It will tell you WHY it failed in your console
            System.err.println("GOOGLE VERIFY CRASH: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Google Verification Error: " + e.getMessage());
        }

        if (idToken == null) {
            System.err.println("GOOGLE VERIFY FAILED: Invalid Token Signature or Audience.");
            throw new RuntimeException("Invalid ID token");
        }

        return idToken.getPayload();
    }
}