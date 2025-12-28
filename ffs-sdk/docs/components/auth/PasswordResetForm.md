🔐 PasswordResetForm Component

The PasswordResetForm is a reusable, accessible component that allows users to request a password reset by entering their email address. It is designed to work seamlessly with the LoginForm and SignUpForm components as part of Flying Fox Solutions’ auth component trio, forming a complete, modular authentication system.

✨ Overview

The PasswordResetForm provides a simple, single-field form for initiating password reset emails. It follows the same design language and UX patterns as LoginForm and SignUpForm, ensuring a consistent experience across your authentication flow.

📧 Single email field with validation

✅ Real-time inline validation

🔄 Loading state during submission

📬 Success state with confirmation message

♿ Full ARIA accessibility and screen reader support

🌙 Dark mode compatible

🧰 Fully typed in TypeScript

🌀 Works as part of a unified, state-driven auth system

📁 Location
components/auth/PasswordResetForm.tsx

📦 Props
Name Type Required Default Description
handlePasswordReset (email: string) => Promise<void> | void ✅ — Function called on form submission. Connect this to Supabase, Firebase, or your custom backend.
loginHref string | (() => void) ❌ — URL for the “Back to login” link, or a callback to switch views when clicked.
title string ❌ "Reset your password" Title text displayed above the form.
subtitle string ❌ — Subtitle text displayed below the title.
submitLabel string ❌ "Send reset link" Text for the submit button.
initialEmail string ❌ "" Optional pre-filled email value.
className string ❌ — Additional Tailwind classes for the container.
🛠️ Usage – State-Driven Auth Flow

PasswordResetForm is designed to be used with useState (or a router) to switch views dynamically without reloading the page:

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import PasswordResetForm from "@/components/auth/PasswordResetForm";

export default function App() {
const [view, setView] = useState<"login" | "signup" | "reset">("login");

const handlePasswordReset = async (email: string) => {
await supabase.auth.resetPasswordForEmail(email);
};

return (
<main className="min-h-screen grid place-items-center bg-gray-100 dark:bg-gray-950 p-6">
{view === "reset" && (
<PasswordResetForm
handlePasswordReset={handlePasswordReset}
loginHref={() => setView("login")}
title="Forgot your password?"
subtitle="Enter your email and we'll send you a reset link."
/>
)}

      {view === "login" && (
        <LoginForm
          handleLogin={async () => {}}
          forgotPasswordHref={() => setView("reset")}
          title="Welcome back"
          subtitle="Sign in to your account"
        />
      )}

      {view === "signup" && (
        <SignUpForm
          handleSignUp={async () => {}}
          loginHref={() => setView("login")}
          title="Join Flying Fox Solutions"
        />
      )}
    </main>

);
}

✅ Validation

Required: The email field cannot be empty.

Format: Must match a standard email regex pattern.

Real-Time Feedback: Errors appear immediately as the user types.

🔄 States
📤 Loading State

Spinner animation while the form submits

Submit button disabled to prevent double-submissions

Text updates to indicate progress (e.g., “Sending reset link…”)

📬 Success State

Form disappears and is replaced by a confirmation message

Displays the email address where the reset link was sent

“Back to login” link remains visible

Backend-agnostic: Success state works even without a backend, ideal for prototyping

⚠️ Error State

Red error banner displayed if the reset fails

Uses role="alert" for screen readers

Form remains visible for retry

♿ Accessibility

ARIA Labels: All inputs and messages are labeled for screen readers

Error Announcements: Errors and success messages use role="alert"

Keyboard Navigation: Fully keyboard-navigable with focus states

Focus Management: Focus moves intelligently between form elements

Descriptive Errors: aria-describedby links errors to inputs

🎨 Styling

Built with Tailwind CSS and designed to match the existing auth components:

Consistent spacing and typography

Indigo primary and gray secondary color schemes

Responsive design for mobile and desktop

Dark mode support with dark: variants

Easily customizable through className prop

🔌 Integration with Supabase
const handlePasswordReset = async (email: string) => {
const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: `${window.location.origin}/reset-password`,
});

if (error) {
throw new Error(error.message);
}
};

🧠 Notes & Best Practices

🌀 Combine with LoginForm and SignUpForm for a complete auth flow.

🔁 Use a state variable (e.g., view) to switch between forms without full page reloads.

📬 The success state appears automatically — backend optional.

⚙️ Use the initialEmail prop to pre-populate the email field when appropriate.

🧪 Test with valid and invalid emails to verify error handling.

📈 Future Enhancements

Add a “Resend reset link” button.

Include optional password strength hints.

Support custom success message overrides.

Add analytics events for password reset submissions.

✅ Summary:
The PasswordResetForm is a lightweight, accessible, and fully typed atomic component designed to handle password reset requests in a unified authentication system. Reusable across projects and backend-agnostic by default, it pairs perfectly with LoginForm and SignUpForm to provide a complete, professional authentication experience in the Flying Fox Template Library.
