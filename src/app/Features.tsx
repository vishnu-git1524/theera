import { motion } from 'framer-motion';
import {
  BookOpen,
  Video,
  Users,
  Shield,
  Search,
  LayoutDashboard,
  GitCommit,
  Heart
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
    title: "Automated Code Documentation",
    description: "Save time with dynamically generated, comprehensive documentation that captures your codebase's structure and intent."
  },
  {
    icon: <Video className="w-6 h-6 text-indigo-600" />,
    title: "Real-Time Meeting Insights",
    description: "Access real-time contextual meeting notes and searchable insights, ensuring critical information is always available."
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-600" />,
    title: "Seamless Team Collaboration",
    description: "Collaborate effortlessly with tools that integrate documentation, meeting notes, and code insights."
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-600" />,
    title: "Highly Secure Integration",
    description: "Ensure your data stays protected with enterprise-grade encryption and customizable access controls."
  },
  {
    icon: <Search className="w-6 h-6 text-indigo-600" />,
    title: "Intelligent Code Search",
    description: "Leverage context-aware search tools to locate specific functions, variables, or files instantly."
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-indigo-600" />,
    title: "Your Personalized Dashboard",
    description: "Get an overview of your tasks, meeting notes, and team progress in a single, customizable dashboard."
  },
  {
    icon: <GitCommit className="w-6 h-6 text-indigo-600" />,
    title: "AI-Powered Commit Summaries",
    description: "Stay informed with concise, AI-generated commit summaries that keep everyone on the same page."
  },
  {
    icon: <Heart className="w-6 h-6 text-indigo-600" />,
    title: "Tailored Team Insights",
    description: "Strengthen team dynamics with personalized insights and actionable recommendations."
  }
];

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Theera Offers 🧑🏻‍💻
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Theera can transform your development workflow with our comprehensive suite of features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}