import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Background grid pattern */}
      <div className="absolute z-[-1] bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_80%)]"></div>

      {/* Main content */}
      <div className="min-h-screen flex flex-col items-center pt-56 relative z-[10]">
        {/* Heading */}
        <h1 className="bg-gradient-to-r text-center from-gray-600 font-bold text-4xl sm:text-5xl md:text-6xl to-gray-900 inline-block text-transparent bg-clip-text px-4">
          Revolutionizing Developer Collaboration
        </h1>


        <div className="h-4"></div>

        <h2 className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-200 text-center font-bold text-2xl inline-block text-transparent bg-clip-text">
          Welcome to Theera
          <span>💗</span>
        </h2>


        <div className="h-4"></div>

        {/* Subheading */}
        <p className="text-xl mb-8 text-gray-600 max-w-xl text-center">
          Theera was born out of a desire to simplify and enhance developer collaboration. By addressing common pain points in team-based coding projects, we’ve created a platform that fosters efficiency, transparency, and streamlined workflows.
        </p>

        {/* Buttons */}
        <div className="space-x-4">
          <Button>
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Link href="dashboard">
            <Button variant="outline">Learn More</Button>
          </Link>
        </div>

        {/* Features Section */}

        {/* Features Section */}
        <div className="mt-12 max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">What Theera Offers 🧑🏻‍💻</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card A */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-indigo-600">A</span>utomated Code Documentation
              </h3>
              <p className="text-gray-600">
                Save time and reduce onboarding friction with dynamically generated, comprehensive documentation that captures your codebase’s structure and intent.
              </p>
            </Card>
            {/* Card R */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-indigo-600">R</span>eal-Time Meeting Insights
              </h3>
              <p className="text-gray-600">
                Access real-time contextual meeting notes and searchable insights, ensuring critical information is always at your fingertips.
              </p>
            </Card>
            {/* Card S */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-indigo-600">S</span>eamless Team Collaboration
              </h3>
              <p className="text-gray-600">
                Collaborate effortlessly with tools that integrate documentation, meeting notes, and code insights into a unified platform.
              </p>
            </Card>
            {/* Card H */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-indigo-600">H</span>ighly Secure Integration
              </h3>
              <p className="text-gray-600">
                Ensure your data stays protected with enterprise-grade encryption and customizable access controls for secure integrations.
              </p>
            </Card>
            {/* Card I */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-indigo-600">I</span>ntelligent Code Search
              </h3>
              <p className="text-gray-600">
                Leverage context-aware search tools to locate specific functions, variables, or files instantly—no matter how large your repository grows.
              </p>
            </Card>
            {/* Card Y */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-indigo-600">Y</span>our Personalized Dashboard
              </h3>
              <p className="text-gray-600">
                Get an overview of your tasks, meeting notes, and team progress in a single, customizable dashboard tailored to your workflow.
              </p>
            </Card>
            {/* Card A */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-indigo-600">A</span>I-Powered Commit Summaries
              </h3>
              <p className="text-gray-600">
                Stay informed with concise, AI-generated commit summaries that keep everyone on the same page without reading lengthy logs.
              </p>
            </Card>
            {/* Card 💘 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                <span className="font-extrabold text-pink-600">💘</span> Tailored Team Insights
              </h3>
              <p className="text-gray-600">
                Strengthen team dynamics with personalized insights and actionable recommendations, fostering collaboration and productivity.
              </p>
            </Card>
          </div>
        </div>

        {/* Demo Image */}
        <Image
          src="/bg.png"
          alt="theera"
          width={1000}
          height={1000}
          className="my-12 border rounded-md transition-all hover:shadow-2xl hover:scale-[102%] shadow-xl w-[70vw] h-auto"
        />

        {/* Footer Links */}
        <div className="flex flex-col items-center space-y-6 mb-10">
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="default" className="px-6 py-2">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" className="px-6 py-2">
                Sign Up
              </Button>
            </Link>
          </div>
          <Separator className="w-full max-w-xs border-t border-gray-300" />
          <div className="text-sm text-gray-500">
            Theera 💞 <span className="font-semibold">V 22.04</span>
          </div>
        </div>
      </div>

    </>
  );
}
