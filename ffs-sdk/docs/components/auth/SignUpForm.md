✨ Features

📧 Email, password, and confirm password fields

✅ Inline validation (email format, minimum length, matching passwords)

🔄 Loading state with spinner

♿ Fully accessible with ARIA attributes and screen reader support

🖼️ Responsive and mobile-friendly layout

🌙 Dark mode compatible

🔌 handleSignUp prop for backend integration

🔗 Optional “Already have an account?” login link

🔁 Compatible with state-based view switching in App.tsx

📦 Props
Name Type Required Description
handleSignUp (email: string, password: string) => void | Promise<void> ✅ Called when the form submits successfully. Use this to integrate with Supabase or another backend.
loginHref string ❌ Optional URL for the “Already have an account?” login link.
title string ❌ Optional heading to display above the form. Defaults to “Create an Account.”

import { useState } from "react";
import SignUpForm from "@/components/auth/SignUpForm";

const handleSignUp = async (email: string, password: string) => {
// Replace with your Supabase logic:
await supabase.auth.signUp({ email, password });
};

export default function App() {
const [showSignUp, setShowSignUp] = useState<boolean>(false);

return (
<main className="min-h-screen grid place-items-center bg-gray-100 dark:bg-gray-950 p-6">
{showSignUp ? (
<SignUpForm
          handleSignUp={handleSignUp}
          loginHref="#"
          title="Join Flying Fox Solutions"
        />
) : (
// other views (e.g., LoginForm) here
)}

      <button
        onClick={() => setShowSignUp((prev: boolean) => !prev)}
        className="mt-6 text-blue-600 underline"
      >
        {showSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
      </button>
    </main>

);
}

🧠 Notes

Designed as an atomic component — small, focused, and reusable across multiple apps.

Works seamlessly with state-based view toggling (useState) in App.tsx.

Connect it to Supabase, Firebase, or a custom API via the handleSignUp prop.

Pairs with LoginForm and PasswordResetForm to form a complete authentication flow.

Can be refactored later to use a shared FormField or Button component.

📈 Future Enhancements

Add password strength meter and feedback.

Add support for additional fields (e.g., name, role, terms acceptance).

Add form analytics or conversion event tracking.
