"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function AuthBar() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
        Home
      </Link>

      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-3 py-1.5 rounded-lg bg-brand-teal text-white text-sm hover:opacity-90">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "ring-2 ring-emerald-200 rounded-full" } }} />
      </SignedIn>
    </div>
  );
}
