'use client'

import React from "react";
import { Button } from "@/components/ui/button";

import { Hero } from "./Hero";
import { Features } from "./Features";
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';


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
      <header className="w-full z-40  top-0 left-0 bg-indigo-100">
        <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
          <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
          </div>
          <div className="flex lg:justify-center">
            <p className="font-semibold">Theera</p>
          </div>
          <div className="flex justify-end w-full gap-4">
            <div className="border-r hidden md:inline"></div>
            {isSignedIn ? <UserButton /> : <Button variant="outline">Sign in</Button>}
            <Button onClick={handleButtonClick}>Create Project</Button>
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
