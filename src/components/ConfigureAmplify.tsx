"use client";

import { Amplify } from "aws-amplify";

// Configure Amplify immediately when this module is imported
// Next.js 14+ requires this to be at the top level for Client Components
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
        },
    },
}, { ssr: true });

export default function ConfigureAmplifyClientSide() {
    return null;
}
