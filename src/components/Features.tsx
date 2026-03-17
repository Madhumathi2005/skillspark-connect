import { motion } from "framer-motion";
import { Brain, MessageCircle, Users, Globe, Star, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Skill Matching",
    description: "Our intelligent algorithm finds your perfect learning partner based on skills, interests, and goals.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "Adaptive Assessments",
    description: "Take smart quizzes that gauge your proficiency and place you at just the right level.",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: MessageCircle,
    title: "AI Chat Assistant",
    description: "Get 24/7 help from our AI tutor — ask questions, get resources, and stay on track.",
    color: "bg-secondary/40 text-secondary-foreground",
  },
  {
    icon: Users,
    title: "Real-Time Sessions",
    description: "Chat, message, and learn together in real-time with built-in communication tools.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Star,
    title: "Reviews & Trust",
    description: "Sentiment-analyzed reviews ensure quality and help you find the best learning partners.",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Filter by language and location to find partners worldwide or right in your neighborhood.",
    color: "bg-secondary/40 text-secondary-foreground",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Features = () => {
  return (
    <section id="features" className="section-padding bg-card">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to learn smarter
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From AI-powered matching to real-time sessions, SkillSwap gives you the tools to learn anything from anyone.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="bg-background rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
