import { Theme } from "@/types/event";

export const themes: Theme[] = [
  {
    id: "modern",
    name: "Modern Blue",
    preview: "bg-gradient-to-br from-blue-500 to-cyan-500",
    colors: {
      primary: "#3B82F6",
      secondary: "#06B6D4",
      accent: "#8B5CF6",
      background: "#FFFFFF",
      text: "#1F2937"
    }
  },
  {
    id: "vibrant",
    name: "Vibrant Purple",
    preview: "bg-gradient-to-br from-purple-500 to-pink-500",
    colors: {
      primary: "#A855F7",
      secondary: "#EC4899",
      accent: "#F59E0B",
      background: "#FFFFFF",
      text: "#111827"
    }
  },
  {
    id: "professional",
    name: "Professional Dark",
    preview: "bg-gradient-to-br from-gray-800 to-gray-900",
    colors: {
      primary: "#1F2937",
      secondary: "#4B5563",
      accent: "#3B82F6",
      background: "#F9FAFB",
      text: "#111827"
    }
  },
  {
    id: "fresh",
    name: "Fresh Green",
    preview: "bg-gradient-to-br from-green-500 to-emerald-500",
    colors: {
      primary: "#10B981",
      secondary: "#059669",
      accent: "#F59E0B",
      background: "#FFFFFF",
      text: "#064E3B"
    }
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    preview: "bg-gradient-to-br from-orange-500 to-red-500",
    colors: {
      primary: "#F97316",
      secondary: "#EF4444",
      accent: "#FBBF24",
      background: "#FFFBEB",
      text: "#78350F"
    }
  }
];

export const defaultSections = [
  {
    id: "hero",
    type: "hero" as const,
    title: "Hero Section",
    content: {
      heading: "Welcome to Our Event",
      subheading: "Join us for an amazing experience",
      ctaText: "Register Now",
      backgroundImage: ""
    },
    visible: true,
    order: 0
  },
  {
    id: "about",
    type: "about" as const,
    title: "About",
    content: {
      title: "About This Event",
      description: "Learn more about what makes this event special"
    },
    visible: true,
    order: 1
  },
  {
    id: "speakers",
    type: "speakers" as const,
    title: "Speakers",
    content: {
      title: "Meet Our Speakers",
      speakers: []
    },
    visible: false,
    order: 2
  },
  {
    id: "agenda",
    type: "agenda" as const,
    title: "Agenda",
    content: {
      title: "Event Schedule",
      schedule: []
    },
    visible: false,
    order: 3
  },
  {
    id: "faq",
    type: "faq" as const,
    title: "FAQ",
    content: {
      title: "Frequently Asked Questions",
      faqs: []
    },
    visible: false,
    order: 4
  },
  {
    id: "registration",
    type: "registration" as const,
    title: "Registration",
    content: {
      title: "Register for the Event",
      fields: [
        { name: "full_name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: false }
      ]
    },
    visible: true,
    order: 5
  }
];
