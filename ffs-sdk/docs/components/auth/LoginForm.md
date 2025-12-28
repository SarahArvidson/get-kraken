🧱 LoginForm Component

The LoginForm component is a reusable, accessible authentication form with built-in validation and flexible props. It’s designed as part of Flying Fox Solutions’ auth component trio — working seamlessly with SignUpForm and PasswordResetForm to deliver a complete, modular authentication flow.

✨ Overview

The LoginForm handles all front-end concerns for user sign-in:

📧 Email + password inputs with accessible labels

✅ Client-side validation with helpful error messages

🔄 Loading state with spinner during submission

🔗 Optional “Forgot password?” link that can either navigate to a URL or trigger a view change

🖼️ Customizable title, subtitle, and submit button label

🎨 Tailwind-only styling for seamless integration

🌀 Works as part of a view-switched auth system with SignUpForm and PasswordResetForm

📁 Location
components/auth/LoginForm.tsx

📦 Props
Name Type Required Default Description
handleLogin (email: string, password: string) => Promise<void> | void ✅ — Called when the form is submitted. Connect this to Supabase, Firebase, or a custom backend.
forgotPasswordHref string | (() => void) ❌ — If a string is provided, renders a traditional “Forgot password?” link. If a function is provided, it will be called on click — e.g., () => setView("reset") for switching views without navigation.
title string ❌ "Welcome back" Title text displayed above the form.
subtitle string ❌ "Please sign in to your account" Subtitle text displayed below the title.
submitLabel string ❌ "Sign in" Text for the submit button.
initialEmail string ❌ "" Optional prefilled email value.
className string ❌ — Additional Tailwind classes for the container.
🛠️ Usage Example – View-Switched Auth Flow

The LoginForm is designed to be used alongside SignUpForm and PasswordResetForm in a state-driven authentication flow. Here’s an example using useState to control which view is visible:

import { useState } from "react";
import { LoginForm, SignUpForm, PasswordResetForm } from "@ffx/sdk";

const handleLogin: HandleLogin = async (email, password) => {
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) throw new Error(error.message);
console.log("Logged in as:", data.user?.email);
};

const handleSignUp = async (email: string, password: string) => {
await supabase.auth.signUp({ email, password });
};

const handlePasswordReset = async (email: string) => {
await supabase.auth.resetPasswordForEmail(email);
};

export default function AuthPage() {
const [view, setView] = useState<"login" | "signup" | "reset">("login");

return (

<main className="min-h-screen grid place-items-center bg-gray-100 dark:bg-gray-950 p-6">
{view === "login" && (
<LoginForm
handleLogin={handleLogin}
forgotPasswordHref={() => setView("reset")}
title="Sign in to your account"
subtitle="Use your email and password to continue"
submitLabel="Log In"
/>
)}

      {view === "signup" && (
        <SignUpForm
          handleSignUp={handleSignUp}
          loginHref={() => setView("login")}
          title="Join Flying Fox Solutions"
        />
      )}

      {view === "reset" && (
        <PasswordResetForm
          handlePasswordReset={handlePasswordReset}
          loginHref={() => setView("login")}
        />
      )}
    </main>

);
}
