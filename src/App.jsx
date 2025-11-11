import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  signUpWithEmail,
  signInWithEmail,
  onAuthChange,
  getCurrentUser,
  upsertTask,
  deleteTask as deleteTaskRow,
  upsertNote,
  deleteNote as deleteNoteRow,
  upsertDeck,
  deleteDeck as deleteDeckRow,
  upsertCard,
  deleteCardRow,
  upsertActivity,
  syncLocalDataToSupabase,
  loadDataFromSupabase,
} from "./dataService";

const IconBase = ({ children, className = "w-6 h-6", ...props }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {children}
  </svg>
);
const AlignLeftIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
    />
  </IconBase>
);
const CheckIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </IconBase>
);
const XIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </IconBase>
);
const RotateCwIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3"
    />
  </IconBase>
);
const FlashcardIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
    />
  </IconBase>
);
const HomeIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </IconBase>
);
const NoteIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487l-8.932 8.931c-.18.18-.324.377-.45.592l-1.036 3.109 3.109-1.036c.215-.071.411-.2.592-.45l8.932-8.931zM18 5.25l-1.5 1.5"
    />
  </IconBase>
);
const TimerIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </IconBase>
);
const AIIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188-2.188-1.25L17 8.562l1.25 2.188zM19.5 21L18 17.25l-1.5 3.75-3.75 1.5L16.5 21l-1.5 3.75 3.75-1.5L22.5 21z"
    />
  </IconBase>
);
const PlusIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </IconBase>
);
const SaveIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </IconBase>
);
const EditIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
    />
  </IconBase>
);
const DeleteIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.502 0c-.34.05-.68.104-1.022.165m10.026 0a48.097 48.097 0 01-3.478-.397m-6.548 0a48.097 48.097 0 00-3.478-.397m12.502 0c.34-.05.68-.104 1.022-.165"
    />
  </IconBase>
);
const PlayIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.985V5.653z"
    />
  </IconBase>
);
const PauseIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 5.25v13.5m-7.5-13.5v13.5"
    />
  </IconBase>
);
const StopIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
    />
  </IconBase>
);
const SkipIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
    />
  </IconBase>
);
const SignOutIcon = () => (
  <IconBase>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l-3-3m0 0l-3 3m3-3V9"
    />
  </IconBase>
);

const LandingPage = ({ onLogin }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");

  const features = [
    {
      name: "Focus Timer",
      desc: "A beautiful, themed Pomodoro timer to keep you locked in.",
      icon: "🍅",
      gradient: "from-red-500 to-orange-500",
    },
    {
      name: "Notion-Style Notes",
      desc: "A full-screen, distraction-free editor that auto-saves your thoughts.",
      icon: "📝",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "AI Assistant",
      desc: "Get answers, explanations, and quiz questions for any topic.",
      icon: "✨",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Contribution Graph",
      desc: "Visualize your daily study habits with a GitHub-style activity chart.",
      icon: "📊",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      name: "Flashcard Decks",
      desc: "Create and manage decks of flashcards for active recall.",
      icon: "🧠",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      name: "Today's Focus",
      desc: "A simple to-do list to keep track of your daily goals.",
      icon: "✅",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const normalizedEmail = (email || "").trim().toLowerCase();

      if (isSignup) {
        const signupResult = await signUpWithEmail({
          email: normalizedEmail,
          password,
          name,
        });

        if (signupResult.error) {
          if (
            signupResult.error.message
              ?.toLowerCase()
              .includes("already registered") ||
            signupResult.error.message?.toLowerCase().includes("already exists")
          ) {
            setAuthError("Email already exists. Please sign in instead.");
            setIsSignup(false);
            return;
          }
          throw signupResult.error;
        }

        if (
          signupResult.data?.user &&
          !signupResult.data.user.email_confirmed_at
        ) {
          setAuthError(
            "SUCCESS: Account created! Please check your email and click the confirmation link, then sign in."
          );
          setIsSignup(false);
        } else {
          try {
            const signInResult = await signInWithEmail({
              email: normalizedEmail,
              password,
            });

            if (!signInResult.error && signInResult.data?.user) {
              await syncLocalDataToSupabase(signInResult.data.user.id);
              onLogin();
              setShowAuth(false);
            }
          } catch {
            setAuthError(
              "SUCCESS: Account created! Please check your email for confirmation, then sign in."
            );
            setIsSignup(false);
          }
        }
      } else {
        const signInResult = await signInWithEmail({
          email: normalizedEmail,
          password,
        });
        if (signInResult.error) {
          throw signInResult.error;
        }

        onLogin();
        setShowAuth(false);
      }
    } catch (err) {
      const msg = (err?.message || "").toString().toLowerCase();

      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid email or password")
      ) {
        setAuthError("Invalid email or password. Please try again.");
      } else if (msg.includes("email not confirmed")) {
        setAuthError(
          "Please check your email to confirm your account, then sign in."
        );
      } else if (msg.includes("already registered")) {
        setAuthError("Email already exists. Please sign in instead.");
        setIsSignup(false);
      } else {
        setAuthError(
          err?.message || "Authentication failed. Please try again."
        );
      }
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 sm:top-40 right-2 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 sm:-bottom-20 left-1/4 sm:left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="relative z-10 px-3 sm:px-6 lg:px-12 py-4 sm:py-6 flex justify-between items-center backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img
              src="https://img.freepik.com/premium-vector/light-bulb-with-brain-icon-vector-illustration-education-learning-concept_1185634-4382.jpg"
              alt="StudyMentor Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <span className="text-lg sm:text-xl font-bold hidden xs:inline">
            StudyMentor
          </span>
        </div>
        <button
          onClick={() => setShowAuth(true)}
          className="bg-white/5 backdrop-blur-md text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-white/10 transition-all border border-white/30 font-medium text-xs sm:text-sm md:text-base"
        >
          <span className="hidden xs:inline">Get Started</span>
          <span className="xs:hidden">Start</span>
        </button>
      </nav>

      <main className="relative z-10 container mx-auto px-3 sm:px-6 lg:px-12 py-8 sm:py-12 md:py-20 lg:py-32">
        <div className="text-center max-w-6xl mx-auto">
          <div className="inline-block mb-3 sm:mb-4 md:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-xs sm:text-sm font-medium">
              ✨ Your Personal Study Companion
            </span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-3 sm:mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 px-2 sm:px-4">
            Master Your Studies with Intelligence
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 md:mb-12 max-w-4xl mx-auto px-2 sm:px-4 leading-relaxed">
            The ultimate all-in-one platform combining AI-powered learning,
            focus techniques, and smart organization. Track your progress, stay
            motivated, and achieve your academic goals.
          </p>

          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center px-2 sm:px-4">
            <button
              onClick={() => {
                setIsSignup(true);
                setShowAuth(true);
              }}
              className="w-full xs:w-auto bg-blue-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-sm sm:text-base md:text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Start Free Today
            </button>
            <button
              onClick={() => {
                setIsSignup(false);
                setShowAuth(true);
              }}
              className="w-full xs:w-auto bg-blue-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-sm sm:text-base md:text-lg hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Sign In
            </button>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8 mt-8 sm:mt-12 md:mt-20 max-w-4xl mx-auto px-2 sm:px-4">
            <div className="bg-white/5 backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl border border-white/10">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-yellow-200">
                25min
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
                Avg Focus Time
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl border border-white/10">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                3.5x
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
                Retention Boost
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl border border-white/10 xs:col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400">
                85%
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
                Goal Completion
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-20 md:mt-32 lg:mt-40">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-16 text-center px-2 sm:px-4">
            Everything You Need to Excel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-2 sm:px-4">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="group bg-white/5 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`inline-block p-2 sm:p-3 md:p-4 bg-gradient-to-br ${feature.gradient} rounded-xl mb-3 sm:mb-4 md:mb-6 text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
                  {feature.name}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showAuth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 md:p-8 relative animate-scale-in">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>

            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 overflow-hidden">
                <img
                  src="https://img.freepik.com/premium-vector/light-bulb-with-brain-icon-vector-illustration-education-learning-concept_1185634-4382.jpg"
                  alt="StudyMentor Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {isSignup ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                {isSignup
                  ? "Start your learning journey today"
                  : "Sign in to continue learning"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required={isSignup}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="xyz@gmail.com"
                  className="w-full p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                {isSignup ? "Sign Up" : "Sign In"}
              </button>
              {authError && (
                <p
                  className={`text-xs ${
                    authError.startsWith("SUCCESS:")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {authError.replace("SUCCESS: ", "")}
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isSignup
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 20s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
    </div>
  );
};

const mockFirestore = {
  notes: JSON.parse(localStorage.getItem("studyNotes") || "[]"),
  tasks: JSON.parse(localStorage.getItem("studyTasks") || "[]"),
  decks: JSON.parse(localStorage.getItem("flashcardDecks") || "[]"),
  roadmaps: [],
  activities: JSON.parse(localStorage.getItem("studyActivities") || "{}"),
};

const saveToStorage = () => {
  localStorage.setItem(
    "studyActivities",
    JSON.stringify(mockFirestore.activities)
  );
  localStorage.setItem("studyNotes", JSON.stringify(mockFirestore.notes));
  localStorage.setItem("studyTasks", JSON.stringify(mockFirestore.tasks));
  localStorage.setItem("flashcardDecks", JSON.stringify(mockFirestore.decks));
};

const addActivity = async (type) => {
  const today = new Date().toISOString().split("T")[0];
  if (!mockFirestore.activities[today]) {
    mockFirestore.activities[today] = { notes: 0, timer: 0, total: 0 };
  }
  if (type && mockFirestore.activities[today][type] !== undefined) {
    mockFirestore.activities[today][type]++;
  }
  mockFirestore.activities[today].total++;
  saveToStorage();

  window.dispatchEvent(new CustomEvent("activityUpdated"));

  try {
    const user = await getCurrentUser();
    if (user) {
      const a = mockFirestore.activities[today];
      await upsertActivity(user.id, today, {
        notes: a.notes,
        timer: a.timer,
        total: a.total,
      });
    }
  } catch {}
};

const Sidebar = ({
  currentPage,
  setPage,
  onSignOut,
  isMobileOpen,
  setMobileOpen,
}) => {
  const NavItem = ({ pageName, icon, children, badge }) => {
    const isActive = currentPage === pageName;
    return (
      <button
        onClick={() => {
          setPage(pageName);
          setMobileOpen?.(false);
        }}
        className={`group w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
            : "text-slate-300 hover:bg-white/10 hover:text-white hover:scale-105"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`${
              isActive
                ? "text-white"
                : "text-slate-400 group-hover:text-indigo-300"
            } transition-colors`}
          >
            {icon}
          </div>
          <span>{children}</span>
        </div>
        {badge && (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isActive ? "bg-white/20" : "bg-indigo-500/20 text-indigo-300"
            }`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  const NavSection = ({ title, children }) => (
    <div className="mb-8">
      <h3 className="px-4 text-xs text-slate-300 uppercase font-bold tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
  const SidebarBody = (
    <div className="mb-10 flex items-center px-2">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
        <img
          src="https://img.freepik.com/premium-vector/light-bulb-with-brain-icon-vector-illustration-education-learning-concept_1185634-4382.jpg"
          alt="StudyMentor Logo"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
      <div className="ml-4">
        <div className="font-bold text-white text-lg">StudyMentor</div>
        <div className="text-slate-300 text-xs">Your Study Companion</div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex w-68 h-screen bg-gray-900 border-r border-white/20 p-6 flex-col fixed shadow-2xl">
        {SidebarBody}
        <nav className="flex-1 overflow-y-auto">
          <NavSection title="Dashboard">
            <NavItem pageName="home" icon={<HomeIcon />}>
              Home
            </NavItem>
          </NavSection>
          <NavSection title="Study Tools">
            <NavItem pageName="timer" icon={<TimerIcon />}>
              Focus Timer
            </NavItem>
            <NavItem
              pageName="notes"
              icon={<NoteIcon />}
              badge={mockFirestore.notes.length || null}
            >
              My Notes
            </NavItem>
            <NavItem
              pageName="flashcards"
              icon={<FlashcardIcon />}
              badge={
                mockFirestore.decks.reduce(
                  (sum, deck) => sum + (deck.cards?.length || 0),
                  0
                ) || null
              }
            >
              Flashcards
            </NavItem>
            <NavItem pageName="ai" icon={<AIIcon />}>
              AI Assistant
            </NavItem>
          </NavSection>
        </nav>
        <div className="pt-6 border-t border-slate-200">
          <button
            onClick={onSignOut}
            className="group w-full flex items-center space-x-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <SignOutIcon className="text-slate-400 group-hover:text-red-500" />
            <span className="white">Back to Landing</span>
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          ></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 sm:w-80 bg-slate-900 border-r border-white/20 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src="https://img.freepik.com/premium-vector/light-bulb-with-brain-icon-vector-illustration-education-learning-concept_1185634-4382.jpg"
                    alt="StudyMentor Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <div className="font-bold text-white text-base">
                    StudyMentor
                  </div>
                  <div className="text-slate-400 text-xs">
                    Your Study Companion
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                aria-label="Close Menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-6">
              <NavSection title="Dashboard">
                <NavItem pageName="home" icon={<HomeIcon />}>
                  Home
                </NavItem>
              </NavSection>
              <NavSection title="Study Tools">
                <NavItem pageName="timer" icon={<TimerIcon />}>
                  Focus Timer
                </NavItem>
                <NavItem
                  pageName="notes"
                  icon={<NoteIcon />}
                  badge={mockFirestore.notes.length || null}
                >
                  My Notes
                </NavItem>
                <NavItem
                  pageName="flashcards"
                  icon={<FlashcardIcon />}
                  badge={
                    mockFirestore.decks.reduce(
                      (sum, deck) => sum + (deck.cards?.length || 0),
                      0
                    ) || null
                  }
                >
                  Flashcards
                </NavItem>
                <NavItem pageName="ai" icon={<AIIcon />}>
                  AI Assistant
                </NavItem>
              </NavSection>
            </nav>

            <div className="p-6 border-t border-white/10 flex-shrink-0">
              <button
                onClick={() => {
                  onSignOut();
                  setMobileOpen(false);
                }}
                className="group w-full flex items-center space-x-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <SignOutIcon className="text-slate-400 group-hover:text-red-400" />
                <span>Back to Landing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FocusList = () => {
  const [tasks, setTasks] = useState(mockFirestore.tasks);
  const [newTaskText, setNewTaskText] = useState("");

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      created_at: new Date().toISOString(),
    };
    const updatedTasks = [newTask, ...tasks];
    mockFirestore.tasks = updatedTasks;
    setTasks(updatedTasks);
    saveToStorage();
    setNewTaskText("");
    try {
      const user = await getCurrentUser();
      if (user) await upsertTask(user.id, newTask);
    } catch {}
    addActivity("notes");
  };

  const toggleTask = async (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    mockFirestore.tasks = updatedTasks;
    setTasks(updatedTasks);
    saveToStorage();
    try {
      const user = await getCurrentUser();
      if (user) {
        const t = updatedTasks.find((t) => t.id === taskId);
        if (t) await upsertTask(user.id, { ...t });
      }
    } catch {}
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      mockFirestore.tasks = updatedTasks;
      setTasks(updatedTasks);
      saveToStorage();
      try {
        const user = await getCurrentUser();
        if (user) await deleteTaskRow(user.id, taskId);
      } catch {}
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4">Today's Focus</h3>
      <form
        onSubmit={addTask}
        className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-4"
      >
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder:sla te-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors"
          aria-label="Add Task"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>
      {tasks.length > 0 ? (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg group"
            >
              <div className="flex items-center flex-1 mr-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mr-3 h-5 w-5 text-indigo-500 bg-white/10 border-white/20 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span
                  className={`flex-1 break-words ${
                    task.completed
                      ? "line-through text-slate-400"
                      : "text-white"
                  }`}
                >
                  {task.text}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/10 flex-shrink-0"
                aria-label="Delete Task"
              >
                <DeleteIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-300 text-sm text-center py-4">
          No tasks added yet. Add your focus points for today!
        </p>
      )}
    </div>
  );
};

const HomePage = () => {
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalDays: 0,
    bestStreak: 0,
    thisWeek: 0,
  });

  const refreshData = () => {
    const activities = JSON.parse(
      localStorage.getItem("studyActivities") || "{}"
    );
    // --- Stats calculation logic ---
    const dates = Object.keys(activities).sort();
    let bestStreak = 0,
      tempStreak = 0,
      totalDays = 0,
      thisWeek = 0;
    const todayDt = new Date(),
      weekAgo = new Date(todayDt);
    weekAgo.setDate(todayDt.getDate() - 7);
    const todayStr = todayDt.toISOString().split("T")[0];

    dates.forEach((dateStr) => {
      const activity = activities[dateStr];
      if (activity.total > 0) {
        totalDays++;
        tempStreak++;
        if (new Date(dateStr) >= weekAgo) thisWeek += activity.total;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
      }
    });
    bestStreak = Math.max(bestStreak, tempStreak);

    let checkDate = new Date(),
      currentStreak = 0;
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activities[dateStr]?.total > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    if (currentStreak === 0 && activities[todayStr]?.total > 0)
      currentStreak = 1;

    setStats({ currentStreak, totalDays, bestStreak, thisWeek });
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000);

    // Listen for activity updates
    const handleActivityUpdate = () => refreshData();
    window.addEventListener("activityUpdated", handleActivityUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("activityUpdated", handleActivityUpdate);
    };
  }, []);

  const streakIcon = (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L13.09 8.26L22 9L17.5 13.74L18.18 22.5L12 19.77L5.82 22.5L6.5 13.74L2 9L10.91 8.26L12 2Z" />
    </svg>
  );
  const totalIcon = (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM8 13V15H6V13H8ZM13 13V15H11V13H13ZM18 13V15H16V13H18Z" />
    </svg>
  );
  const trophyIcon = (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 9V7C5 5.89543 5.89543 5 7 5H9C10.1046 5 11 5.89543 11 7V9C11 10.1046 10.1046 11 9 11H7C5.89543 11 5 10.1046 5 9ZM13 7C13 5.89543 13.8954 5 15 5H17C18.1046 5 19 5.89543 19 7V9C19 10.1046 18.1046 11 17 11H15C13.8954 11 13 10.1046 13 9V7Z" />
    </svg>
  );
  const weekIcon = (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 13H8V11H6V13ZM11 11V13H13V11H11ZM16 11V13H18V11H16Z" />
    </svg>
  );

  const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-900">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );

  const GlassCard = ({ children, className }) => (
    <div
      className={`bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg ${className}`}
    >
      {children}
    </div>
  );

  const GlassStatCard = ({ title, value, subtitle, icon, color }) => {
    const colorClasses = {
      indigo: "text-indigo-300",
      emerald: "text-emerald-300",
      amber: "text-amber-300",
      rose: "text-rose-300",
    };
    return (
      <GlassCard className="p-6 transition-all duration-300 hover:bg-black/30 hover:border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm text-slate-400 font-medium mb-2">{title}</h4>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          {icon && (
            <div
              className={`p-3 rounded-xl bg-white/10 ${colorClasses[color]}`}
            >
              {icon}
            </div>
          )}
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="relative -mx-4 -my-6 sm:-m-8 lg:-m-12 px-4 py-6 sm:p-8 lg:p-12 min-h-[calc(100vh-104px)]">
      <AnimatedBackground />
      <div className="relative z-10 space-y-6 sm:space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Dashboard
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Here is your study activity at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <GlassCard className="p-4 sm:p-6">
            <FocusList />
          </GlassCard>

          <div className="space-y-4 sm:space-y-6">
            <GlassStatCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              subtitle="Keep it going!"
              icon={streakIcon}
              color="indigo"
            />
            <GlassStatCard
              title="Total Active Days"
              value={`${stats.totalDays} days`}
              subtitle="Days with activity"
              icon={totalIcon}
              color="emerald"
            />
            <GlassStatCard
              title="Best Streak"
              value={`${stats.bestStreak} days`}
              subtitle="Personal record"
              icon={trophyIcon}
              color="amber"
            />
            <GlassStatCard
              title="This Week"
              value={`${stats.thisWeek} activities`}
              subtitle="Last 7 days"
              icon={weekIcon}
              color="rose"
            />
          </div>
        </div>
      </div>
      <style>{`
                @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(40px, -60px) scale(1.1); } 50% { transform: translate(-30px, 30px) scale(0.9); } 75% { transform: translate(60px, 50px) scale(1.05); } }
                .animate-blob { animation: blob 25s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
             `}</style>
    </div>
  );
};

const NoteEditorPage = ({ note, onExit }) => {
  const [currentNoteData, setCurrentNoteData] = useState(
    mockFirestore.notes.find((n) => n.id === note.id) || note
  );
  const [content, setContent] = useState(currentNoteData.content || "");
  const [title, setTitle] = useState(currentNoteData.title || "");
  const [status, setStatus] = useState("Saved");

  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  // const API_KEY = (
  //   import.meta.env.VITE_GEMINI_API_KEY ||
  //   import.meta.env.REACT_APP_GEMINI_API_KEY ||
  //   ""
  // ).trim();

  useEffect(() => {
    if (
      content === currentNoteData.content &&
      title === currentNoteData.title
    ) {
      setStatus("Saved");
      return;
    }
    setStatus("Saving...");
    const handler = setTimeout(() => {
      try {
        const index = mockFirestore.notes.findIndex(
          (n) => n.id === currentNoteData.id
        );
        if (index !== -1) {
          const updatedNote = {
            ...currentNoteData,
            title,
            content,
            timestamp: new Date().toISOString(),
          };
          mockFirestore.notes[index] = updatedNote;
          setCurrentNoteData(updatedNote);
          setStatus("Saved");
          saveToStorage();
          (async () => {
            try {
              const user = await getCurrentUser();
              if (user) await upsertNote(user.id, updatedNote);
            } catch {}
          })();
        } else {
          setStatus("Error");
        }
      } catch (e) {
        setStatus("Error");
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [content, title, currentNoteData]);

  // const handleSummarize = async () => {
  //   if (!content.trim() || isSummarizing) return;

  //   if (!API_KEY) {
  //     setSummary(
  //       "Error: Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables."
  //     );
  //     return;
  //   }

  //   setIsSummarizing(true);
  //   setSummary("Generating summary...");

  //   const prompt =
  //     "Please provide a concise, easy-to-read summary of the following notes in a few key bullet points:\n\n---\n\n" +
  //     content;
  //   const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  //   try {
  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         errorData.error?.message || "Failed to generate summary."
  //       );
  //     }

  //     const data = await response.json();
  //     const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  //     setSummary(summaryText || "Could not extract summary from response.");
  //   } catch (error) {
  //     setSummary(`Error: ${error.message}`);
  //   } finally {
  //     setIsSummarizing(false);
  //   }
  // };

  // REPLACE your old handleSummarize with this new one

const handleSummarize = async () => {
  if (!content.trim() || isSummarizing) return;

  // We removed the API_KEY check, it's now handled on the server

  setIsSummarizing(true);
  setSummary("Generating summary...");

  const prompt =
    "Please provide a concise, easy-to-read summary of the following notes in a few key bullet points:\n\n---\n\n" +
    content;

  try {
    // Call our new /api/summarize backend
    const response = await fetch('/api/summarize', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate summary.");
    }

    const summaryText = data.text;
    setSummary(summaryText || "Could not extract summary from response.");

  } catch (error) {
    setSummary(`Error: ${error.message}`);
  } finally {
    setIsSummarizing(false);
  }
};
  return (
    <div className="flex flex-col h-screen animate-fadeIn">
      <header className="flex-shrink-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-lg border-b border-white/20 z-50 sticky top-0 shadow-lg">
        <div className="px-4 sm:px-8 lg:px-12 py-4 sm:py-6 flex justify-between items-center bg-slate-900">
          <div className="flex items-center space-x-4">
            <button
              onClick={onExit}
              className="flex items-center px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-all border border-white/20"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Back to Notes</span>
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm">Note Editor</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={handleSummarize}
              disabled={!content.trim() || isSummarizing}
              className="flex items-center px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:text-white hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-indigo-500/30"
            >
              <AlignLeftIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">
                {isSummarizing
                  ? "Summarizing..."
                  : !API_KEY
                  ? "Summarize (API Key Required)"
                  : "Summarize"}
              </span>
              <span className="sm:hidden">{isSummarizing ? "..." : "AI"}</span>
            </button>
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === "Saved"
                    ? "bg-green-400"
                    : status === "Saving..."
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
              ></div>
              <span className="text-sm text-slate-300">{status}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-800">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="text-4xl font-bold text-white w-full focus:outline-none mb-4 bg-transparent placeholder-slate-400"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your notes here..."
            className="w-full min-h-[70vh] text-lg text-slate-200 leading-relaxed focus:outline-none resize-none bg-transparent placeholder-slate-400"
          />
        </div>
      </main>

      {summary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-slate-800">Note Summary</h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <p
                className="text-slate-700 whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: summary.replace(/\*/g, "•").replace(/\n/g, "<br />"),
                }}
              ></p>
            </div>
            <div className="p-4 bg-slate-50 border-t rounded-b-2xl text-right">
              <button
                onClick={() => setSummary(null)}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NotesPage = ({ onSelectNote }) => {
  const [notes, setNotes] = useState(mockFirestore.notes);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const checkStorage = () => {
      try {
        const storedNotes = JSON.parse(
          localStorage.getItem("studyNotes") || "[]"
        );
        if (
          storedNotes.length !== notes.length ||
          JSON.stringify(storedNotes) !== JSON.stringify(notes)
        ) {
          setNotes(storedNotes);
          mockFirestore.notes = storedNotes;
        }
      } catch (error) {
        console.error("Error reading notes from localStorage:", error);
      }
    };
    const interval = setInterval(checkStorage, 2000);
    window.addEventListener("focus", checkStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkStorage);
    };
  }, [notes]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNote = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      content: "",
      timestamp: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    mockFirestore.notes = updatedNotes;
    saveToStorage();
    setNotes(updatedNotes);
    setNewTitle("");

    onSelectNote(newNote);
    try {
      const user = await getCurrentUser();
      if (user) await upsertNote(user.id, newNote);
    } catch {}
    addActivity("notes");
  };

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation();
    if (window.confirm("Delete this note?")) {
      const updatedNotes = notes.filter((n) => n.id !== noteId);
      mockFirestore.notes = updatedNotes;
      saveToStorage();
      setNotes(updatedNotes);
      try {
        const user = await getCurrentUser();
        if (user) await deleteNoteRow(user.id, noteId);
      } catch {}
    }
  };

  return (
  <div className="space-y-6 sm:space-y-8 animate-fadeIn">  
      <div className="p-4 sm:p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
        <form
          onSubmit={handleCreateNote}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <input
            type="text"
            placeholder="Create a new note (e.g., 'React Hooks Summary')"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 p-3 sm:p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all font-medium text-sm sm:text-base"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="ml-2">Create</span>
          </button>
        </form>
      </div>

      <div>
        {notes.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 transition-all hover:shadow-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="text-lg sm:text-2xl font-bold text-white break-words flex-1">
                    {note.title || "Untitled"}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl text-red-400 hover:bg-red-500/10 transition-all z-10 flex-shrink-0"
                    aria-label="Delete Note"
                  >
                    <DeleteIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-slate-300">
                  Last edited: {new Date(note.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 rounded-xl sm:rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center px-4">
            <div className="mb-3 sm:mb-4 text-slate-300 w-12 h-12 sm:w-16 sm:h-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              No notes yet
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Create your first note to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TimerPage = () => {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [minutes, setMinutes] = useState(focusDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [mode, setMode] = useState("focus");
  const intervalRef = useRef(null);
  const targetTimeRef = useRef(0);
  const audioRef = useRef(
    new Audio(
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV"
    )
  );

  useEffect(() => {
    if (!isActive) {
      setMinutes(mode === "focus" ? focusDuration : breakDuration);
      setSeconds(0);
    }
  }, [focusDuration, breakDuration, mode]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        const remaining = targetTimeRef.current - Date.now();

        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setIsActive(false);
          audioRef.current.play();

          if (mode === "focus") {
            addActivity("timer");
            setSessions((prev) => prev + 1);
            setMode("break");
            setMinutes(breakDuration);
            setSeconds(0);
          } else {
            setMode("focus");
            setMinutes(focusDuration);
            setSeconds(0);
          }
        } else {
          setMinutes(Math.floor(remaining / 60000));
          setSeconds(Math.floor((remaining % 60000) / 1000));
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, mode, focusDuration, breakDuration]);

  const handleStart = () => {
    const currentTimeSeconds = minutes * 60 + seconds;
    targetTimeRef.current =
      Math.ceil(Date.now() / 1000) * 1000 + currentTimeSeconds * 1000;
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (isPaused) {
      targetTimeRef.current = Date.now() + (minutes * 60 + seconds) * 1000;
      setIsPaused(false);
    } else {
      clearInterval(intervalRef.current);
      const remaining = targetTimeRef.current - Date.now();
      setMinutes(Math.max(0, Math.floor(remaining / 60000)));
      setSeconds(Math.max(0, Math.floor((remaining % 60000) / 1000)));
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setMinutes(mode === "focus" ? focusDuration : breakDuration);
    setSeconds(0);
  };

  const handleSkip = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);

    if (mode === "focus") {
      setMode("break");
      setMinutes(breakDuration);
      setSeconds(0);
    } else {
      setMode("focus");
      setMinutes(focusDuration);
      setSeconds(0);
    }
  };

  const formatTime = (mins, secs) => {
    let totalSeconds = mins * 60 + secs;
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= 24 * 60 * 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= 60 * 60;
    const displayMinutes = Math.floor(totalSeconds / 60);
    const displaySeconds = totalSeconds % 60;

    const sDays = days.toString();
    const sHours = hours.toString().padStart(2, "0");
    const sMinutes = displayMinutes.toString().padStart(2, "0");
    const sSeconds = displaySeconds.toString().padStart(2, "0");

    if (days > 0) return `${sDays}d ${sHours}:${sMinutes}:${sSeconds}`;
    if (hours > 0) return `${sHours}:${sMinutes}:${sSeconds}`;
    return `${sMinutes}:${sSeconds}`;
  };

  const totalDurationSeconds =
    (mode === "focus" ? focusDuration : breakDuration) * 60;
  const timeRemainingSeconds = minutes * 60 + seconds;
  const progress =
    totalDurationSeconds > 0
      ? ((totalDurationSeconds - timeRemainingSeconds) / totalDurationSeconds) *
        100
      : 0;

  return (
    <div className="space-y-4 sm:space-y-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div
          className={`
                    rounded-2xl shadow-2xl p-4 sm:p-8 lg:p-12 transition-all duration-500 ease-in-out
                    bg-white/5 backdrop-blur-md border border-white/10
                `}
        >
          <div className="text-center mb-4 sm:mb-8">
            <h2
              className={`
                            text-xl sm:text-2xl lg:text-3xl font-bold mb-2 transition-colors duration-500
                            text-white
                        `}
            >
              {mode === "focus" ? "🍅 Focus Zone" : "☕ Relax Mode"}
            </h2>
            <p
              className={`
                            text-sm sm:text-base transition-colors duration-500
                            text-slate-300
                        `}
            >
              {mode === "focus"
                ? "Lock in and be productive."
                : "Take a well-deserved break."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-center sm:space-x-4 lg:space-x-6 space-y-3 sm:space-y-0 mb-4 sm:mb-8">
            <div className="text-center">
              <label
                className={`
                                block text-xs sm:text-sm font-medium mb-1 transition-colors duration-500
                                text-slate-300
                            `}
              >
                Focus (min)
              </label>
              <input
                type="number"
                value={focusDuration}
                onChange={(e) =>
                  setFocusDuration(
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                disabled={isActive}
                className={`
                                    w-full sm:w-20 lg:w-24 p-2 sm:p-2.5 text-center text-base sm:text-lg font-semibold rounded-lg transition-all duration-500
                                    disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500
                                    bg-white/10 text-white border border-white/10
                                `}
              />
            </div>
            <div className="text-center">
              <label
                className={`
                                block text-xs sm:text-sm font-medium mb-1 transition-colors duration-500
                                text-slate-300
                            `}
              >
                Break (min)
              </label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) =>
                  setBreakDuration(
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                disabled={isActive}
                className={`
                                    w-full sm:w-20 lg:w-24 p-2 sm:p-2.5 text-center text-base sm:text-lg font-semibold rounded-lg transition-all duration-500
                                    disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500
                                    bg-white/10 text-white border border-white/10
                                `}
              />
            </div>
          </div>

          <div className="relative mb-6 sm:mb-12">
            <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto relative">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className={`
                                        transition-colors duration-500 text-purple-800/50
                                    `}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 45 * (1 - progress / 100)
                  }`}
                  className={`
                                        transition-all duration-1000 ease-linear
                                        ${
                                          mode === "focus"
                                            ? "text-indigo-400"
                                            : "text-emerald-400"
                                        }
                                    `}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-2">
                  <div
                    className={`
                                        text-3xl sm:text-5xl lg:text-6xl font-mono font-bold mb-1 sm:mb-2 transition-colors duration-500 text-white
                                    `}
                  >
                    {formatTime(minutes, seconds)}
                  </div>
                  <div
                    className={`
                                        text-xs sm:text-sm uppercase tracking-wide transition-colors duration-500 text-slate-300
                                    `}
                  >
                    {mode === "focus" ? "Focus Session" : "Break Time"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-8">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all font-medium text-sm sm:text-base"
              >
                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />{" "}
                {minutes ===
                  (mode === "focus" ? focusDuration : breakDuration) &&
                seconds === 0
                  ? "Start"
                  : "Resume"}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-lg transform hover:scale-105 transition-all font-medium text-sm sm:text-base"
                >
                  {isPaused ? (
                    <>
                      <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />{" "}
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />{" "}
                      Pause
                    </>
                  )}
                </button>
                <button
                  onClick={handleStop}
                  className={`
                                        flex items-center px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 rounded-xl transform hover:scale-105 transition-all font-medium text-sm sm:text-base
                                        bg-white/10 text-white hover:bg-white/20
                                    `}
                >
                  <StopIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />{" "}
                  Stop
                </button>
                <button
                  onClick={handleReset}
                  className={`
                                        flex items-center px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 rounded-xl transform hover:scale-105 transition-all font-medium text-sm sm:text-base
                                        bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30
                                    `}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={handleSkip}
                  className={`
                                        flex items-center px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 rounded-xl transform hover:scale-105 transition-all font-medium text-sm sm:text-base
                                        bg-white/10 text-white hover:bg-white/20
                                    `}
                >
                  <SkipIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />{" "}
                  <span className="hidden sm:inline">Skip</span>
                </button>
              </>
            )}
          </div>

          <div className="text-center">
            <div
              className={`
                            text-xs sm:text-sm mb-2 transition-colors duration-500
                            text-slate-300
                        `}
            >
              Sessions Completed Today
            </div>
            <div
              className={`
                            text-2xl sm:text-3xl font-bold transition-colors duration-500
                            text-white
                        `}
            >
              {sessions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content:
        "Hi! I'm your AI study assistant. I can help you with explanations, study strategies, quiz creation, and more. What would you like to learn about today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // const API_KEY = (
  //   import.meta.env.VITE_GEMINI_API_KEY ||
  //   import.meta.env.REACT_APP_GEMINI_API_KEY ||
  //   ""
  // ).trim();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // const callGeminiAPI = async (prompt) => {
  //   if (!API_KEY) {
  //     return "Error: API Key not configured.";
  //   }
  //   setIsLoading(true);

  //   const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;
  //   const payload = {
  //     contents: [{ parts: [{ text: prompt }] }],
  //   };

  //   try {
  //     const response = await fetch(API_URL, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         errorData.error?.message || `HTTP error! status: ${response.status}`
  //       );
  //     }
  //     const data = await response.json();
  //     const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  //     if (!text) {
  //       return "Sorry, I received an unexpected response.";
  //     }
  //     return text;
  //   } catch (error) {
  //     return `Sorry, there was an error: ${error.message}`;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // REPLACE your old callGeminiAPI with this new one

const callGeminiAPI = async (prompt) => {
  setIsLoading(true);

  try {
    // Call our OWN backend API at /api/chat
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt }), // Send the prompt in the body
    });

    const data = await response.json();

    if (!response.ok) {
      // This will show errors from our backend
      throw new Error(data.error || 'Failed to get response from server.');
    }

    return data.text || "Sorry, I received an empty response.";

  } catch (error) {
    // This will now show your backend's errors
    return `Sorry, there was an error: ${error.message}`;
  } finally {
    setIsLoading(false);
  }
};

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    const userMessage = { type: "user", content: userMessageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const aiResponseContent = await callGeminiAPI(userMessageContent);
    setMessages((prev) => [
      ...prev,
      { type: "ai", content: aiResponseContent },
    ]);
  };

  const quickActionHandler = async (prompt) => {
    if (isLoading) return;

    const userMessage = { type: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);

    const aiResponseContent = await callGeminiAPI(prompt);
    setMessages((prev) => [
      ...prev,
      { type: "ai", content: aiResponseContent },
    ]);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10 h-[70vh] sm:h-[75vh] flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center">
              AI Study Assistant
            </h2>
            <p className="text-slate-300">
              Get help with your studies, explanations, and learning strategies
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  <p
                    className="text-sm whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br />"),
                    }}
                  ></p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white px-4 py-3 rounded-2xl border border-white/10">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className="p-6 border-t border-white/10"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  !API_KEY
                    ? "API Key not configured..."
                    : "Ask me anything about your studies..."
                }
                className="flex-1 p-4 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-white/5"
                disabled={isLoading || !API_KEY}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !API_KEY}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                Send
              </button>
            </div>
            {!API_KEY && (
              <p className="text-xs text-amber-300 mt-2">
                AI Assistant is disabled for security. The Gemini API key should
                not be exposed publicly in production.
              </p>
            )}
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-4 sm:px-0">
          <button
            onClick={() => quickActionHandler("Give me study tips")}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !API_KEY}
          >
            <h3 className="font-semibold text-white mb-2">📚 Study Tips</h3>
            <p className="text-sm text-slate-300">
              Get effective study strategies and techniques
            </p>
          </button>
          <button
            onClick={() => quickActionHandler("Help me with math")}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !API_KEY}
          >
            <h3 className="font-semibold text-white mb-2">🔢 Math Help</h3>
            <p className="text-sm text-slate-300">
              Get assistance with mathematical concepts
            </p>
          </button>
          <button
            onClick={() => quickActionHandler("Explain science concepts")}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !API_KEY}
          >
            <h3 className="font-semibold text-white mb-2">🔬 Science Help</h3>
            <p className="text-sm text-slate-300">
              Understand scientific principles and concepts
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

const FlashcardsPage = ({ setMobileOpen }) => {
  const [decks, setDecks] = useState(mockFirestore.decks);
  const [newDeckName, setNewDeckName] = useState("");
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const newDeckInputRef = useRef(null);

  const [viewMode, setViewMode] = useState("decks");
  const [studySession, setStudySession] = useState({
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    animateOut: null,
  });
  const [studyDeckName, setStudyDeckName] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const checkStorage = () => {
      try {
        const storedDecks = JSON.parse(
          localStorage.getItem("flashcardDecks") || "[]"
        );
        if (JSON.stringify(storedDecks) !== JSON.stringify(decks)) {
          setDecks(storedDecks);
          mockFirestore.decks = storedDecks;
          if (
            selectedDeck &&
            !storedDecks.some((d) => d.id === selectedDeck.id)
          ) {
            setSelectedDeck(null);
            setViewMode("decks");
          } else if (selectedDeck) {
            setSelectedDeck(storedDecks.find((d) => d.id === selectedDeck.id));
          }
        }
      } catch (error) {
        console.error("Error reading decks from localStorage", error);
      }
    };
    const interval = setInterval(checkStorage, 2000);
    window.addEventListener("focus", checkStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkStorage);
    };
  }, [decks, selectedDeck]);

  const createDeck = async (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const newDeck = {
      id: crypto.randomUUID(),
      name: newDeckName.trim(),
      cards: [],
      created_at: new Date().toISOString(),
    };
    const updatedDecks = [newDeck, ...decks];
    mockFirestore.decks = updatedDecks;
    saveToStorage();
    setDecks(updatedDecks);
    setNewDeckName("");
    try {
      const user = await getCurrentUser();
      if (user) await upsertDeck(user.id, newDeck);
    } catch {}
    addActivity("notes");
  };
  const deleteDeck = async (deckId) => {
    if (window.confirm("Delete this deck and all its cards?")) {
      const updatedDecks = decks.filter((deck) => deck.id !== deckId);
      mockFirestore.decks = updatedDecks;
      saveToStorage();
      setDecks(updatedDecks);
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
        setViewMode("decks");
      }
      try {
        const user = await getCurrentUser();
        if (user) await deleteDeckRow(user.id, deckId);
      } catch {}
    }
  };
  const addCard = async (e) => {
    e.preventDefault();
    if (!selectedDeck || !cardFront.trim() || !cardBack.trim()) return;
    const newCard = {
      id: crypto.randomUUID(),
      front: cardFront.trim(),
      back: cardBack.trim(),
      created_at: new Date().toISOString(),
    };
    const updatedDecks = decks.map((deck) => {
      if (deck.id === selectedDeck.id) {
        const existingCards = deck.cards || [];
        return { ...deck, cards: [newCard, ...existingCards] };
      }
      return deck;
    });
    mockFirestore.decks = updatedDecks;
    saveToStorage();
    setDecks(updatedDecks);
    setSelectedDeck(updatedDecks.find((d) => d.id === selectedDeck.id));
    setCardFront("");
    setCardBack("");
    try {
      const user = await getCurrentUser();
      if (user)
        await upsertCard(user.id, {
          id: newCard.id,
          deckId: selectedDeck.id,
          front: newCard.front,
          back: newCard.back,
          created_at: newCard.created_at,
        });
    } catch {}
    addActivity("notes");
  };
  const deleteCard = async (cardId) => {
    if (!selectedDeck) return;
    if (window.confirm("Delete this card?")) {
      const updatedDecks = decks.map((deck) => {
        if (deck.id === selectedDeck.id) {
          const updatedCards = (deck.cards || []).filter(
            (card) => card.id !== cardId
          );
          return { ...deck, cards: updatedCards };
        }
        return deck;
      });
      mockFirestore.decks = updatedDecks;
      saveToStorage();
      setDecks(updatedDecks);
      setSelectedDeck(updatedDecks.find((d) => d.id === selectedDeck.id));
      try {
        const user = await getCurrentUser();
        if (user) await deleteCardRow(user.id, cardId);
      } catch {}
    }
  };

  const handleStartStudy = (deck) => {
    if (!deck.cards || deck.cards.length === 0) {
      alert("This deck has no cards to study!");
      return;
    }
    const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5);
    setStudySession({
      cards: shuffledCards,
      currentIndex: 0,
      isFlipped: false,
      animateOut: null,
    });
    setStudyDeckName(deck.name || "Study");
    setRevealed(false);
    setViewMode("study");
  };

  const handleNextCard = (direction) => {
    setStudySession((prev) => ({ ...prev, animateOut: direction }));
    setTimeout(() => {
      setStudySession((prev) => {
        const nextIndex = (prev.currentIndex + 1) % prev.cards.length;
        return {
          ...prev,
          currentIndex: nextIndex,
          isFlipped: false,
          animateOut: null,
        };
      });
      setRevealed(false);
    }, 300);
  };

  const handlePrevCard = () => {
    setStudySession((prev) => ({ ...prev, animateOut: "left" }));
    setTimeout(() => {
      setStudySession((prev) => {
        const len = prev.cards.length || 1;
        const prevIndex = (prev.currentIndex - 1 + len) % len;
        return {
          ...prev,
          currentIndex: prevIndex,
          isFlipped: false,
          animateOut: null,
        };
      });
      setRevealed(false);
    }, 300);
  };

  const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-900">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );

  if (viewMode === "study") {
    const currentCard = studySession.cards[studySession.currentIndex];
    const progress =
      ((studySession.currentIndex + 1) / studySession.cards.length) * 100;
    let cardAnimationClass = "animate-fade-in-up";
    if (studySession.animateOut === "right")
      cardAnimationClass = "animate-fly-out-right";
    if (studySession.animateOut === "left")
      cardAnimationClass = "animate-fly-out-left";

    if (isCompleted) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-6 z-50">
          <div className="absolute inset-0 bg-slate-900" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Session Complete 🎉
            </h3>
            <p className="text-slate-300 mb-6">
              You reviewed all cards in "{studyDeckName}".
            </p>
            <button
              onClick={() => {
                setIsCompleted(false);
                setViewMode("decks");
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition shadow"
            >
              Back to Decks
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col animate-fade-in overflow-y-auto">
        <div className="absolute inset-0 bg-purple-900 -z-20" />
        <div className="absolute inset-0 -z-10">
          <AnimatedBackground />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-6 flex-shrink-0">
          <div className="text-center max-w-5xl mx-auto">
            {" "}
            <div className="text-lg text-slate-300 mb-4">
              {studyDeckName || "Study Session"} • Card{" "}
              {studySession.currentIndex + 1} of {studySession.cards.length}
            </div>
            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Progress</span>
                <span className="text-indigo-300">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden shadow-inner border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setViewMode("decks")}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white transition-all duration-200 border border-white/20"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="font-medium">Exit Study</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full">
            <div className={`${cardAnimationClass}`}>
              <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 sm:p-12 min-h-[400px] flex flex-col justify-center">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium mb-4">
                    Question
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {currentCard.front}
                  </h2>
                </div>

                {!revealed && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setRevealed(true)}
                      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-xl"
                    >
                      <span className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Reveal Answer
                      </span>
                    </button>
                  </div>
                )}

                {revealed && (
                  <div className="mt-8 rounded-2xl border border-white/20 bg-white/5 p-6 sm:p-8">
                    <div className="text-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium mb-4">
                        Answer
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-relaxed">
                        {currentCard.back}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={handlePrevCard}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20 hover:text-white transition-all duration-200 shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Previous</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleNextCard("right");
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30 hover:border-red-400/60 hover:text-red-100 transition-all duration-200 shadow-lg font-medium"
                  disabled={!revealed}
                >
                  <XIcon className="w-5 h-5 mr-2" />
                  <span>Didn't Know</span>
                </button>
                <button
                  onClick={() => {
                    handleNextCard("right");
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 hover:border-emerald-400/60 hover:text-emerald-100 transition-all duration-200 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!revealed}
                >
                  <CheckIcon className="w-5 h-5 mr-2" />
                  <span>I Knew It</span>
                </button>
              </div>

              {studySession.currentIndex === studySession.cards.length - 1 &&
                revealed && (
                  <button
                    onClick={() => {
                      setIsCompleted(true);
                      addActivity("notes");
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-400/50 text-white hover:from-indigo-600 hover:to-purple-700 hover:border-indigo-300/60 transition-all duration-200 shadow-xl font-bold"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Finish Session
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "cards") {
    return (
      <div className="space-y-8 animate-fade-in">
        <button
          onClick={() => {
            setSelectedDeck(null);
            setViewMode("decks");
          }}
          className="flex items-center text-sm font-medium text-slate-300 hover:text-white mb-4"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Decks
        </button>
        <h2 className="text-3xl font-bold text-white -mt-4">
          {selectedDeck.name}
        </h2>
        <div className="p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Add New Card</h3>
          <form onSubmit={addCard} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Front (Question/Term)
              </label>
              <textarea
                value={cardFront}
                onChange={(e) => setCardFront(e.target.value)}
                placeholder="e.g., What is React?"
                className="w-full p-3 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="2"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Back (Answer/Definition)
              </label>
              <textarea
                value={cardBack}
                onChange={(e) => setCardBack(e.target.value)}
                placeholder="e.g., A JavaScript library for building user interfaces."
                className="w-full p-3 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              ></textarea>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center bg-indigo-500 text-white px-5 py-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5 mr-1" /> Add Card
            </button>
          </form>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">
            Cards ({selectedDeck.cards?.length || 0})
          </h3>
          {(selectedDeck.cards?.length || 0) > 0 ? (
            selectedDeck.cards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-lg shadow bg-white/5 backdrop-blur-md border border-white/10 group flex justify-between items-start"
              >
                {" "}
                <div className="flex-1 mr-2">
                  <p className="font-semibold text-white mb-1 break-words">
                    {card.front}
                  </p>
                  <p className="text-slate-300 break-words">{card.back}</p>
                </div>{" "}
                <button
                  onClick={() => deleteCard(card.id)}
                  className="p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/10 ml-2 flex-shrink-0"
                  aria-label="Delete Card"
                >
                  <DeleteIcon className="w-5 h-5" />
                </button>{" "}
              </div>
            ))
          ) : (
            <p className="text-slate-300 text-sm text-center py-4">
              No cards added yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn px-4 sm:px-0">
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="font-medium">Menu</span>
        </button>
      </div>
      <div className="p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Create New Deck</h3>
        <form onSubmit={createDeck} className="flex flex-col sm:flex-row gap-4">
          <input
            ref={newDeckInputRef}
            type="text"
            placeholder="Deck Name (e.g., JavaScript Concepts)"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            required
            className="flex-1 p-4 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all font-medium"
          >
            <PlusIcon /> Create Deck
          </button>
        </form>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Your Decks</h3>
        {decks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck, i) => (
              <div
                key={deck.id}
                className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 flex flex-col group transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="p-6 flex-1">
                  <h4 className="text-lg font-bold text-white break-words">
                    {deck.name}
                  </h4>
                  <p className="text-sm text-slate-300 mt-1">
                    {deck.cards?.length || 0} card
                    {(deck.cards?.length || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="border-t border-white/10 p-4 flex items-center justify-between bg-white/5 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setSelectedDeck(deck);
                      setViewMode("cards");
                    }}
                    className="text-sm font-semibold text-indigo-300 hover:text-white"
                  >
                    Edit Cards
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartStudy(deck)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!deck.cards || deck.cards.length === 0}
                    >
                      Study
                    </button>
                    <button
                      onClick={() => deleteDeck(deck.id)}
                      className="p-2 text-slate-300 rounded-full hover:bg-red-500/10 hover:text-red-400"
                      title="Delete Deck"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-white/20 bg-white/5 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-2">
              No decks yet
            </h3>
            <p className="text-slate-300 mb-4">
              Create your first deck to start studying.
            </p>
            <button
              onClick={() => newDeckInputRef.current?.focus()}
              className="inline-flex items-center px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 shadow transition"
            >
              <PlusIcon className="w-5 h-5 mr-2" /> Create your first deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ onSignOut }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("studyMentorCurrentPage") || "home";
  });
  const [editingNote, setEditingNote] = useState(null);
  const [isMobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("studyMentorCurrentPage", currentPage);
  }, [currentPage]);

  const pageTitles = {
    home: "Study Activity Dashboard",
    notes: "My Notes",
    timer: "Focus Zone",
    flashcards: "Flashcard Decks",
    ai: "AI Learning Assistant",
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "notes":
        return <NotesPage onSelectNote={setEditingNote} />;
      case "timer":
        return <TimerPage />;
      case "flashcards":
        return <FlashcardsPage setMobileOpen={setMobileOpen} />;
      case "ai":
        return <AIAssistantPage />;
      default:
        return <HomePage />;
    }
  };

  if (editingNote) {
    return (
      <NoteEditorPage note={editingNote} onExit={() => setEditingNote(null)} />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar
        currentPage={currentPage}
        setPage={setCurrentPage}
        onSignOut={onSignOut}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main className="flex-1 lg:ml-68">
        <header className="sticky top-0 w-full bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-lg border-b border-white/20 z-50 shadow-lg">
          <div className="w-full px-3 sm:px-6 lg:px-12 py-3 sm:py-4 lg:py-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                className="lg:hidden inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 focus:outline-none transition-all"
                onClick={() => setMobileOpen(!isMobileOpen)}
                aria-label="Toggle Menu"
              >
                {isMobileOpen ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full sm:rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://img.freepik.com/premium-vector/light-bulb-with-brain-icon-vector-illustration-education-learning-concept_1185634-4382.jpg"
                    alt="StudyMentor Logo"
                    className="w-full h-full object-cover rounded-full sm:rounded-xl"
                  />
                </div>
                <h1 className="text-base sm:text-xl lg:text-3xl font-extrabold text-white truncate max-w-[120px] sm:max-w-none">
                  {pageTitles[currentPage] || "Dashboard"}
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white/10 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-lg sm:rounded-xl border border-white/20 shadow-lg">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-300 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                    <span className="hidden sm:inline">Today: </span>
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="px-4 sm:px-8 lg:px-12 py-6 lg:py-12 relative">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("✅ Successful");
      }
    };

    if (window.location.pathname === "/auth/callback") {
      handleAuthCallback();
    }
  }, []);

  useEffect(() => {
  const sub = onAuthChange(async (user) => {
    if (user) {
      setIsLoadingData(true);
      await loadDataFromSupabase(user.id);
      await syncLocalDataToSupabase(user.id);

      mockFirestore.notes = JSON.parse(
        localStorage.getItem("studyNotes") || "[]"
      );
      mockFirestore.tasks = JSON.parse(
        localStorage.getItem("studyTasks") || "[]"
      );
      mockFirestore.decks = JSON.parse(
        localStorage.getItem("flashcardDecks") || "[]"
      );
      mockFirestore.activities = JSON.parse(
        localStorage.getItem("studyActivities") || "{}"
      );

      setIsLoadingData(false);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  });

    (async () => {
  const user = await getCurrentUser();
  if (user) {
    setIsLoadingData(true);
    await loadDataFromSupabase(user.id);
    await syncLocalDataToSupabase(user.id);

    mockFirestore.notes = JSON.parse(
      localStorage.getItem("studyNotes") || "[]"
    );
    mockFirestore.tasks = JSON.parse(
      localStorage.getItem("studyTasks") || "[]"
    );
    mockFirestore.decks = JSON.parse(
      localStorage.getItem("flashcardDecks") || "[]"
    );
    mockFirestore.activities = JSON.parse(
      localStorage.getItem("studyActivities") || "{}"
    );

    setIsLoadingData(false);
    setIsLoggedIn(true);
  }
})();

    return () => sub?.data?.subscription?.unsubscribe?.();
  }, []);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LandingPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Dashboard
      onSignOut={async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
      }}
    />
  );
}
