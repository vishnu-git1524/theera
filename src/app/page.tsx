'use client'

import React from "react";
import { Button } from "@/components/ui/button";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { Plus } from "lucide-react";

export default function Home() {
  const { isSignedIn } = useUser();  // Check if the user is signed in
  const router = useRouter();  // To navigate to the dashboard

  const handleButtonClick = () => {
    if (isSignedIn) {
      router.push('/create');  // Navigate to dashboard if signed in
    } else {
      router.push('/');  // Otherwise, navigate to sign-in page
    }
  };

  return (
    <>
      <header className="w-full z-40 top-0 left-0 bg-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-20 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex justify-center lg:justify-start w-full">
            <p className="font-semibold text-xl mt-1">Theera</p>
          </div>

          <div className="flex justify-end w-full gap-4 mt-4 lg:mt-0">
            {isSignedIn ? <UserButton /> : <Button variant="outline">Sign in</Button>}
            <Button onClick={handleButtonClick} className="w-full sm:w-auto">
              Create Project <Plus/>
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-white">
        <Hero />
        <Features />
      </div>
    </>
  );
}
