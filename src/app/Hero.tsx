import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export function Hero() {
  const { isSignedIn } = useUser();  // Check if the user is signed in
  const router = useRouter();  // To navigate to the dashboard

  const handleButtonClick = () => {
    if (isSignedIn) {
      router.push('/dashboard');  // Navigate to dashboard if signed in
    } else {
      router.push('/sign-in');  // Otherwise, navigate to sign-in page
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
        >
          Simplify Developer
          <span className="text-indigo-600"> Collaboration</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
        >
          Theera streamlines team-based coding projects with automated documentation,
          real-time insights, and powerful collaboration tools.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            onClick={handleButtonClick}  // Handle button click
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center hover:bg-indigo-700 transition-colors"
          >
            {isSignedIn ? 'Go to Dashboard' : 'Sign In'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <img
            src="./meeting.svg"
            alt="Developer Collaboration"
            className="rounded-lg shadow-2xl mx-auto max-w-4xl"
          />
        </motion.div>
      </div>
    </div>
  );
}
