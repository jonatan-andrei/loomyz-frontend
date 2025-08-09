import {
  Keyboard,
  BookOpen,
  Headphones,
  Speech,
  Captions,
  PencilLine,
  Mic
} from "lucide-react";

export const ACTIVITY_OPTIONS = {
  reading: [
    {
      key: "reading",
      title: "Read",
      desc: "Read a sentence in English while listening to it, with instant translation.",
      icon: BookOpen,
    },
    {
      key: "translating-text",
      title: "Read and Translate",
      desc: "Read in English and test yourself by typing the translation into your native language.",
      icon: Keyboard,
    },
  ],
  listening: [
    {
      key: "listening",
      title: "Listen",
      desc: "Listen to a sentence in English, with instant translation into your native language.",
      icon: Headphones,
    },
    {
      key: "translating-audio",
      title: "Listen and Translate",
      desc: "Listen in English and test yourself by typing the translation into your native language.",
      icon: Keyboard,
    },
  ],
  writing: [
    {
      key: "writing",
      title: "Write",
      desc: "See a sentence in your native language and write it in English.",
      icon: PencilLine,
    },
    {
      key: "transcribing",
      title: "Transcribe",
      desc: "Listen to a sentence in English and write it out in English.",
      icon: Captions,
    },
  ],
  speaking: [
    {
      key: "speaking",
      title: "Speak",
      desc: "See a sentence in your native language and speak it in English.",
      icon: Speech,
    },
    {
      key: "pronunciation",
      title: "Pronunciation",
      desc: "Read a sentence in English and test your pronunciation.",
      icon: Mic,
    },
  ],
};
