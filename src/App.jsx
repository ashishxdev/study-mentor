import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
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
    loadDataFromSupabase
} from './dataService';

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
const AlignLeftIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></IconBase>;
const CheckIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></IconBase>;
const XIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></IconBase>;
const LayersIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>;
const RotateCwIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3" /></IconBase>;
const FlashcardIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></IconBase>;
const HomeIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></IconBase>;
const NoteIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487l-8.932 8.931c-.18.18-.324.377-.45.592l-1.036 3.109 3.109-1.036c.215-.071.411-.2.592-.45l8.932-8.931zM18 5.25l-1.5 1.5" /></IconBase>;
const TimerIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>;
const AIIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188-2.188-1.25L17 8.562l1.25 2.188zM19.5 21L18 17.25l-1.5 3.75-3.75 1.5L16.5 21l-1.5 3.75 3.75-1.5L22.5 21z" /></IconBase>;
const PlusIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></IconBase>;
const SaveIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>;
const EditIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></IconBase>;
const DeleteIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.502 0c-.34.05-.68.104-1.022.165m10.026 0a48.097 48.097 0 01-3.478-.397m-6.548 0a48.097 48.097 0 00-3.478-.397m12.502 0c.34-.05.68-.104 1.022-.165" /></IconBase>;
const PlayIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.985V5.653z" /></IconBase>;
const PauseIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></IconBase>;
const StopIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></IconBase>;
const SkipIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></IconBase>;
const SignOutIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l-3-3m0 0l-3 3m3-3V9" /></IconBase>;

const LandingPage = ({ onLogin }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    // const [verifySent, setVerifySent] = useState(false);
    const [authError, setAuthError] = useState('');

    const features = [
        { name: "Focus Timer", desc: "A beautiful, themed Pomodoro timer to keep you locked in.", icon: "🍅", gradient: "from-red-500 to-orange-500" },
        { name: "Notion-Style Notes", desc: "A full-screen, distraction-free editor that auto-saves your thoughts.", icon: "📝", gradient: "from-blue-500 to-cyan-500" },
        { name: "AI Assistant", desc: "Get answers, explanations, and quiz questions for any topic.", icon: "✨", gradient: "from-purple-500 to-pink-500" },
        { name: "Contribution Graph", desc: "Visualize your daily study habits with a GitHub-style activity chart.", icon: "📊", gradient: "from-emerald-500 to-teal-500" },
        { name: "Flashcard Decks", desc: "Create and manage decks of flashcards for active recall.", icon: "🧠", gradient: "from-violet-500 to-purple-500" },
        { name: "Today's Focus", desc: "A simple to-do list to keep track of your daily goals.", icon: "✅", gradient: "from-amber-500 to-orange-500" }
    ];

    // const handleAuth = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const normalizedEmail = (email || '').trim().toLowerCase();
    //         if (isSignup) {
    //             await signUpWithEmail({ email: normalizedEmail, password, name });
    //             setVerifySent(true);
    //             setAuthError('');
    //             // Do not auto-close or auto-login on signup; user may need to verify email
    //         } else {
    //             await signInWithEmail({ email: normalizedEmail, password });
    //             setAuthError('');
    //             setVerifySent(false);
    //             onLogin();
    //             setShowAuth(false);
    //         }
    //     } catch (err) {
    //         const msg = (err?.message || '').toString();
    //         if (msg.toLowerCase().includes('not found')) {
    //             setAuthError('Email not found. Try signing up first or check the email.');
    //         } else if (msg.toLowerCase().includes('email not confirmed')) {
    //             setAuthError('Email not confirmed. Please verify your email or resend verification.');
    //             setVerifySent(true);
    //         } else {
    //             setAuthError(msg || 'Authentication failed');
    //         }
    //     }
    // };

    // const handleResendVerification = async () => {
    //     try {
    //         await supabase.auth.resend({ type: 'signup', email });
    //         setVerifySent(true);
    //     } catch (err) {
    //         setAuthError(err.message || 'Could not resend verification email');
    //     }
    // };
    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        
        console.log('🚀 Starting auth process...', { isSignup, email: email.trim() });
        
        try {
            const normalizedEmail = (email || '').trim().toLowerCase();
            
            if (isSignup) {
                console.log('📝 Attempting sign-up...');
                const signupResult = await signUpWithEmail({ email: normalizedEmail, password, name });
                console.log('📝 Sign-up result:', signupResult);
                
                if (signupResult.error) {
                    console.error('❌ Sign-up error:', signupResult.error);
                    if (signupResult.error.message?.toLowerCase().includes('already registered') || 
                        signupResult.error.message?.toLowerCase().includes('already exists')) {
                        setAuthError('Email already exists. Please sign in instead.');
                        setIsSignup(false);
                        return;
                    }
                    throw signupResult.error;
                }
                
                console.log('✅ Sign-up successful, checking if email confirmation is needed...');
                
                // Check if user needs email confirmation
                if (signupResult.data?.user && !signupResult.data.user.email_confirmed_at) {
                    console.log('📧 Email confirmation required');
                    setAuthError('Account created! Please check your email and click the confirmation link, then sign in.');
                    setIsSignup(false);
                } else {
                    console.log('✅ No email confirmation needed, attempting auto sign-in...');
                    try {
                        const signInResult = await signInWithEmail({ email: normalizedEmail, password });
                        console.log('🔑 Sign-in result:', signInResult);
                        
                        if (!signInResult.error && signInResult.data?.user) {
                            console.log('✅ User authenticated, syncing data...');
                            // Sync any existing localStorage data to Supabase on first signup
                            await syncLocalDataToSupabase(signInResult.data.user.id);
                            console.log('✅ Data synced, logging in...');
                            onLogin();
                            setShowAuth(false);
                        }
                    } catch (signInError) {
                        console.error('❌ Auto sign-in failed:', signInError);
                        setAuthError('Account created! Please check your email for confirmation, then sign in.');
                        setIsSignup(false);
                    }
                }
            } else {
                console.log('🔑 Attempting sign-in...');
                const signInResult = await signInWithEmail({ email: normalizedEmail, password });
                console.log('🔑 Sign-in result:', signInResult);
                
                if (signInResult.error) {
                    throw signInResult.error;
                }
                
                onLogin();
                setShowAuth(false);
            }
        } catch (err) {
            console.error('❌ Auth error:', err);
            const msg = (err?.message || '').toString().toLowerCase();
            
            if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
                setAuthError('Invalid email or password. Please try again.');
            } else if (msg.includes('email not confirmed')) {
                setAuthError('Please check your email to confirm your account, then sign in.');
            } else if (msg.includes('already registered')) {
                setAuthError('Email already exists. Please sign in instead.');
                setIsSignup(false);
            } else {
                setAuthError(err?.message || 'Authentication failed. Please try again.');
            }
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 px-4 sm:px-6 lg:px-12 py-6 flex justify-between items-center backdrop-blur-sm bg-white/5 border-b border-white/10">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">A</div>
                    <span className="text-xl font-bold hidden sm:inline">StudyHub</span>
                </div>
                <button
                    onClick={() => setShowAuth(true)}
                    className="bg-white/10 backdrop-blur-md text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-white/20 transition-all border border-white/20 font-medium text-sm sm:text-base"
                >
                    Get Started
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20 lg:py-32">
                <div className="text-center max-w-5xl mx-auto">
                    <div className="inline-block mb-4 sm:mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                        <span className="text-xs sm:text-sm font-medium">✨ Your Personal Study Companion</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200 px-4">
                        Master Your Studies with Intelligence
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 leading-relaxed">
                        The ultimate all-in-one platform combining AI-powered learning, focus techniques, and smart organization. 
                        Track your progress, stay motivated, and achieve your academic goals.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                        <button
                            onClick={() => { setIsSignup(true); setShowAuth(true); }}
                            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-base sm:text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl shadow-indigo-500/50"
                        >
                            Start Free Today
                        </button>
                        <button
                            onClick={() => { setIsSignup(false); setShowAuth(true); }}
                            className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white font-bold py-4 px-8 rounded-xl text-base sm:text-lg hover:bg-white/20 transition-all border border-white/20"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-20 max-w-3xl mx-auto px-4">
                        <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/10">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">10K+</div>
                            <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">Active Students</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/10">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">500K+</div>
                            <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">Study Sessions</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400">98%</div>
                            <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-20 sm:mt-32 lg:mt-40">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-16 text-center px-4">Everything You Need to Excel</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
                        {features.map((feature, index) => (
                            <div 
                                key={feature.name} 
                                className="group bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`inline-block p-3 sm:p-4 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4 sm:mb-6 text-3xl sm:text-4xl group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.name}</h3>
                                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {showAuth && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-scale-in">
                        <button
                            onClick={() => setShowAuth(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6 sm:mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg mx-auto mb-4">A</div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
                            <p className="text-sm sm:text-base text-slate-400">{isSignup ? 'Start your learning journey today' : 'Sign in to continue learning'}</p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
                            {isSignup && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
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
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
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
                                {isSignup ? 'Sign Up' : 'Sign In'}
                            </button>
                            {authError && <p className="text-xs text-red-400">{authError}</p>}
                            {/* {isSignup && (
                                <div className="text-xs text-slate-400">
                                    {verifySent ? 'Verification email sent. Please check your inbox.' : 'Email verification may be required depending on project settings.'}
                                    <button type="button" onClick={handleResendVerification} className="ml-2 text-indigo-300 hover:text-white">Resend</button>
                                </div>
                            )} */}
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
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
    notes: JSON.parse(localStorage.getItem('studyNotes') || '[]'),
    tasks: JSON.parse(localStorage.getItem('studyTasks') || '[]'),
    decks: JSON.parse(localStorage.getItem('flashcardDecks') || '[]'),
    roadmaps: [],
    activities: JSON.parse(localStorage.getItem('studyActivities') || '{}')
};

const saveToStorage = () => {
    localStorage.setItem('studyActivities', JSON.stringify(mockFirestore.activities));
    localStorage.setItem('studyNotes', JSON.stringify(mockFirestore.notes));
    localStorage.setItem('studyTasks', JSON.stringify(mockFirestore.tasks));
    localStorage.setItem('flashcardDecks', JSON.stringify(mockFirestore.decks));
};

const addActivity = async (type) => {
    const today = new Date().toISOString().split('T')[0];
    if (!mockFirestore.activities[today]) {
        mockFirestore.activities[today] = { notes: 0, timer: 0, total: 0 };
    }
    if (type && mockFirestore.activities[today][type] !== undefined) {
        mockFirestore.activities[today][type]++;
    }
    mockFirestore.activities[today].total++;
    saveToStorage();
    
    // Trigger stats refresh for all HomePage components
    window.dispatchEvent(new CustomEvent('activityUpdated'));
    
    try {
        const user = await getCurrentUser();
        if (user) {
            const a = mockFirestore.activities[today];
            await upsertActivity(user.id, today, { notes: a.notes, timer: a.timer, total: a.total });
        }
    } catch {}
};

const Sidebar = ({ currentPage, setPage, onSignOut, isMobileOpen, setMobileOpen }) => {
    const NavItem = ({ pageName, icon, children, badge }) => {
        const isActive = currentPage === pageName;
        return (
            <button
                onClick={() => { setPage(pageName); setMobileOpen?.(false); }}
                className={`group w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-105'
                }`}
            >
                <div className="flex items-center space-x-3">
                    <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`}>{icon}</div>
                    <span>{children}</span>
                </div>
                {badge && (<span className={`px-2 py-1 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}>{badge}</span>)}
            </button>
        );
    };

    const NavSection = ({ title, children }) => (
        <div className="mb-8">
            <h3 className="px-4 text-xs text-slate-400 uppercase font-bold tracking-wider mb-3">{title}</h3>
            <div className="space-y-1">{children}</div>
        </div>
    );

    // Desktop Sidebar
    const SidebarBody = (
        <div className="mb-10 flex items-center px-2">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg">A</div>
            <div className="ml-4">
                <div className="font-bold text-slate-800 text-lg">Welcome</div>
                <div className="text-slate-500 text-sm">Study App</div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop (lg+) */}
            <div className="hidden lg:flex w-72 h-screen bg-white/80 backdrop-blur-lg border-r border-slate-200 p-6 flex-col fixed shadow-xl">
                {SidebarBody}
                <nav className="flex-1 overflow-y-auto">
                    <NavSection title="Dashboard">
                        <NavItem pageName="home" icon={<HomeIcon />}>Home</NavItem>
                    </NavSection>
                    <NavSection title="Study Tools">
                        <NavItem pageName="timer" icon={<TimerIcon />}>Focus Timer</NavItem>
                        <NavItem pageName="notes" icon={<NoteIcon />} badge={mockFirestore.notes.length || null}>My Notes</NavItem>
                        <NavItem pageName="flashcards" icon={<FlashcardIcon />} badge={mockFirestore.decks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0) || null}>Flashcards</NavItem>
                        <NavItem pageName="ai" icon={<AIIcon />}>AI Assistant</NavItem>
                    </NavSection>
                </nav>
                <div className="pt-6 border-t border-slate-200">
                    <button onClick={onSignOut} className="group w-full flex items-center space-x-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
                        <SignOutIcon className="text-slate-400 group-hover:text-red-500"/>
                        <span>Back to Landing</span>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white/90 backdrop-blur-lg border-r border-slate-200 p-6 flex flex-col shadow-2xl">
                        {SidebarBody}
                        <nav className="flex-1 overflow-y-auto">
                            <NavSection title="Dashboard">
                                <NavItem pageName="home" icon={<HomeIcon />}>Home</NavItem>
                            </NavSection>
                            <NavSection title="Study Tools">
                                <NavItem pageName="timer" icon={<TimerIcon />}>Focus Timer</NavItem>
                                <NavItem pageName="notes" icon={<NoteIcon />} badge={mockFirestore.notes.length || null}>My Notes</NavItem>
                                <NavItem pageName="flashcards" icon={<FlashcardIcon />} badge={mockFirestore.decks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0) || null}>Flashcards</NavItem>
                                <NavItem pageName="ai" icon={<AIIcon />}>AI Assistant</NavItem>
                            </NavSection>
                        </nav>
                        <div className="pt-6 border-t border-slate-200">
                            <button onClick={onSignOut} className="group w-full flex items-center space-x-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
                                <SignOutIcon className="text-slate-400 group-hover:text-red-500"/>
                                <span>Back to Landing</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ContributionsGraph = ({ year, data, onRefresh }) => {
    const [monthLabels, setMonthLabels] = useState([]);
    const [paddedDates, setPaddedDates] = useState([]);

    const today = new Date().toISOString().split('T')[0]; 
    useEffect(() => {
        const startDate = new Date(year, 0, 1); 
        const endDate = new Date(year, 11, 31);

        const dates = [];
        const mLabels = [];

        const startDay = startDate.getDay(); 
        for (let i = 0; i < startDay; i++) {
            dates.push(null); 
        }

        let currentDate = new Date(startDate);
        let lastMonth = -1;

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));

            const currentMonth = currentDate.getMonth();
            if (currentMonth !== lastMonth) {
                const monthName = currentDate.toLocaleString('default', { month: 'short' });
                const colIndex = Math.floor((dates.length - 1) / 7);

                mLabels.push({
                    name: monthName,
                    colIndex: colIndex 
                });
                lastMonth = currentMonth;
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        setPaddedDates(dates);
        setMonthLabels(mLabels);
    }, [year]); 

    useEffect(() => {
        const interval = setInterval(() => {
            onRefresh();
        }, 60000);
        return () => clearInterval(interval);
    }, [onRefresh]);

    const getLevel = (activity) => {
        if (!activity) return 0;
        const total = activity.total || 0;
        if (total >= 5) return 4;
        if (total >= 3) return 3;
        if (total >= 2) return 2;
        if (total >= 1) return 1;
        return 0;
    };

    const getTooltipText = (activity, date) => {
        if (!date) return '';
        if (!activity || activity.total === 0) {
            return `No activity on ${date.toDateString()}`;
        }
        const parts = [];
        if (activity.notes > 0) parts.push(`${activity.notes} note${activity.notes > 1 ? 's' : ''}`);
        if (activity.timer > 0) parts.push(`${activity.timer} focus session${activity.timer > 1 ? 's' : ''}`);
        return `${parts.join(', ')} on ${date.toDateString()}`;
    };

    const colors = [
        'bg-slate-800 hover:bg-slate-700',
        'bg-emerald-900 hover:bg-emerald-800', 
        'bg-emerald-700 hover:bg-emerald-600', 
        'bg-emerald-500 hover:bg-emerald-400', 
        'bg-emerald-300 hover:bg-emerald-200' 
    ];

    const totalContributions = Object.values(data).reduce((acc, activity) => acc + (activity.total || 0), 0);

    const totalCols = 53;

    return (
        <div className="p-6 bg-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
                {totalContributions} contributions in {year}
            </h3>

            <div
                className="grid text-xs text-slate-500 mb-2"
                style={{
                    paddingLeft: '2.5rem',
                    gridTemplateColumns: `repeat(${totalCols}, calc(0.75rem + 0.25rem))`
                }}
            >
                {monthLabels.map((month, i) => (
                    <span
                        key={i}
                        className="text-left -ml-1"
                        style={{
                            gridColumnStart: month.colIndex + 1
                        }}
                    >
                        {month.name}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-x-4">
                <div className="grid grid-rows-7 gap-y-1 text-xs text-slate-500 pr-2">
                    <div className="h-3"></div>
                    <div className="h-3 flex items-center">Mon</div>
                    <div className="h-3"></div>
                    <div className="h-3 flex items-center">Wed</div>
                    <div className="h-3"></div>
                    <div className="h-3 flex items-center">Fri</div>
                    <div className="h-3"></div>
                </div>

                <div className="relative">
                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                        {paddedDates.map((date, index) => {
                            if (!date) {
                                return <div key={index} className="w-3 h-3 rounded-sm bg-transparent" />;
                            }

                            const dateString = date.toISOString().split('T')[0];
                            const activity = data[dateString];
                            const level = getLevel(activity);

                            return (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer ${colors[level]} ${
                                        dateString === today ? 'ring-2 ring-indigo-400' : ''
                                    }`}
                                    title={getTooltipText(activity, date)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center mt-4">
                <div className="flex items-center text-xs text-slate-500 space-x-2">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-900"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-700"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-300"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon, color = "indigo" }) => {
    const colorClasses = {
        indigo: 'from-indigo-500 to-purple-600',
        emerald: 'from-emerald-500 to-teal-600',
        amber: 'from-amber-500 to-orange-600',
        rose: 'from-rose-500 to-pink-600'
    };

    return (
        <div className="p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-sm text-slate-300 font-medium mb-2">{title}</h4>
                    <p className="text-3xl font-bold text-white mb-1">{value}</p>
                    {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

const FocusList = () => {
    const [tasks, setTasks] = useState(mockFirestore.tasks);
    const [newTaskText, setNewTaskText] = useState('');

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask = {
            id: crypto.randomUUID(),
            text: newTaskText.trim(),
            completed: false,
            created_at: new Date().toISOString()
        };
        const updatedTasks = [newTask, ...tasks];
        mockFirestore.tasks = updatedTasks;
        setTasks(updatedTasks);
        saveToStorage();
        setNewTaskText('');
        try { const user = await getCurrentUser(); if (user) await upsertTask(user.id, newTask); } catch {}
        addActivity('notes'); // Track task creation activity
    };

    const toggleTask = async (taskId) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        mockFirestore.tasks = updatedTasks;
        setTasks(updatedTasks);
        saveToStorage();
        try { const user = await getCurrentUser(); if (user) { const t = updatedTasks.find(t=>t.id===taskId); if (t) await upsertTask(user.id, { ...t }); } } catch {}
    };

    const deleteTask = async (taskId) => {
        if (window.confirm("Delete this task?")) {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            mockFirestore.tasks = updatedTasks;
            setTasks(updatedTasks);
            saveToStorage();
            try { const user = await getCurrentUser(); if (user) await deleteTaskRow(user.id, taskId); } catch {}
        }
    };

    return (
        <div className="p-4 sm:p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Today's Focus</h3>
            <form onSubmit={addTask} className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-4">
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
                   <PlusIcon className="w-5 h-5"/>
                </button>
            </form>
            {tasks.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {tasks.map(task => (
                        <li key={task.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg group">
                            <div className="flex items-center flex-1 mr-2">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                    className="mr-3 h-5 w-5 text-indigo-500 bg-white/10 border-white/20 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className={`flex-1 break-words ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                                    {task.text}
                                </span>
                            </div>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/10"
                                aria-label="Delete Task"
                            >
                               <DeleteIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-300 text-sm text-center py-4">No tasks added yet. Add your focus points for today!</p>
            )}
        </div>
    );
};

// --- [NEW HOMEPAGE - No Contribution Graph] ---
const HomePage = () => {
    // --- All existing state and data logic remains the same ---
    const [stats, setStats] = useState({ currentStreak: 0, totalDays: 0, bestStreak: 0, thisWeek: 0 });

    const refreshData = () => {
        const activities = JSON.parse(localStorage.getItem('studyActivities') || '{}');
        // --- Stats calculation logic ---
        const dates = Object.keys(activities).sort();
        let bestStreak = 0, tempStreak = 0, totalDays = 0, thisWeek = 0;
        const todayDt = new Date(), weekAgo = new Date(todayDt);
        weekAgo.setDate(todayDt.getDate() - 7);
        const todayStr = todayDt.toISOString().split('T')[0];

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

        let checkDate = new Date(), currentStreak = 0;
        while(true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (activities[dateStr]?.total > 0) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (dateStr === todayStr) { checkDate.setDate(checkDate.getDate() - 1); continue; }
                break;
            }
        }
        if (currentStreak === 0 && activities[todayStr]?.total > 0) currentStreak = 1;

        setStats({ currentStreak, totalDays, bestStreak, thisWeek });
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 60000);
        
        // Listen for activity updates
        const handleActivityUpdate = () => refreshData();
        window.addEventListener('activityUpdated', handleActivityUpdate);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('activityUpdated', handleActivityUpdate);
        };
    }, []);

    const streakIcon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L13.09 8.26L22 9L17.5 13.74L18.18 22.5L12 19.77L5.82 22.5L6.5 13.74L2 9L10.91 8.26L12 2Z"/></svg>;
    const totalIcon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM8 13V15H6V13H8ZM13 13V15H11V13H13ZM18 13V15H16V13H18Z"/></svg>;
    const trophyIcon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 9V7C5 5.89543 5.89543 5 7 5H9C10.1046 5 11 5.89543 11 7V9C11 10.1046 10.1046 11 9 11H7C5.89543 11 5 10.1046 5 9ZM13 7C13 5.89543 13.8954 5 15 5H17C18.1046 5 19 5.89543 19 7V9C19 10.1046 18.1046 11 17 11H15C13.8954 11 13 10.1046 13 9V7Z"/></svg>;
    const weekIcon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 13H8V11H6V13ZM11 11V13H13V11H11ZM16 11V13H18V11H16Z"/></svg>;

    // --- NEW: Local components for styling this page ---
    const AnimatedBackground = () => (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-900">
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
    );

    const GlassCard = ({ children, className }) => (
        <div className={`bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg ${className}`}>
            {children}
        </div>
    );

    const GlassStatCard = ({ title, value, subtitle, icon, color }) => {
        const colorClasses = {
            indigo: 'text-indigo-300', emerald: 'text-emerald-300',
            amber: 'text-amber-300', rose: 'text-rose-300'
        };
        return (
            <GlassCard className="p-6 transition-all duration-300 hover:bg-black/30 hover:border-white/20">
                 <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-sm text-slate-400 font-medium mb-2">{title}</h4>
                        <p className="text-3xl font-bold text-white mb-1">{value}</p>
                        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
                    </div>
                    {icon && <div className={`p-3 rounded-xl bg-white/10 ${colorClasses[color]}`}>{icon}</div>}
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="relative -m-12 p-12 min-h-[calc(100vh-104px)]">
            <AnimatedBackground />
            <div className="relative z-10 space-y-8 animate-fade-in">
                
                <div>
                    <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                    <p className="text-slate-400 mt-1">Here is your study activity at a glance.</p>
                </div>
                
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Focus List */}
                    <GlassCard className="p-6">
                        <FocusList />
                    </GlassCard>

                    {/* Right Column: Stats */}
                    <div className="space-y-6">
                         <GlassStatCard title="Current Streak" value={`${stats.currentStreak} days`} subtitle="Keep it going!" icon={streakIcon} color="indigo" />
                         <GlassStatCard title="Total Active Days" value={`${stats.totalDays} days`} subtitle="Days with activity" icon={totalIcon} color="emerald" />
                         <GlassStatCard title="Best Streak" value={`${stats.bestStreak} days`} subtitle="Personal record" icon={trophyIcon} color="amber" />
                         <GlassStatCard title="This Week" value={`${stats.thisWeek} activities`} subtitle="Last 7 days" icon={weekIcon} color="rose" />
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
    const [currentNoteData, setCurrentNoteData] = useState(mockFirestore.notes.find(n => n.id === note.id) || note);
    const [content, setContent] = useState(currentNoteData.content || '');
    const [title, setTitle] = useState(currentNoteData.title || '');
    const [status, setStatus] = useState('Saved');

    const [summary, setSummary] = useState(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const API_KEY = null; // Disabled for security - Gemini API key should not be exposed publicly

    useEffect(() => {
        if (content === currentNoteData.content && title === currentNoteData.title) { setStatus('Saved'); return; }
        setStatus('Saving...');
        const handler = setTimeout(() => {
            try {
                const index = mockFirestore.notes.findIndex(n => n.id === currentNoteData.id);
                if (index !== -1) {
                    const updatedNote = { ...currentNoteData, title, content, timestamp: new Date().toISOString() };
                    mockFirestore.notes[index] = updatedNote;
                    setCurrentNoteData(updatedNote);
                    setStatus('Saved');
                    saveToStorage();
                    (async ()=>{ try { const user = await getCurrentUser(); if (user) await upsertNote(user.id, updatedNote); } catch {} })();
                } else { setStatus('Error'); }
            } catch (e) { setStatus('Error'); }
        }, 1000);
        return () => clearTimeout(handler);
    }, [content, title, currentNoteData]);

    const handleSummarize = async () => {
        if (!content.trim() || !API_KEY || isSummarizing) return;
        
        setIsSummarizing(true);
        setSummary("Generating summary...");
        
        const prompt = "Please provide a concise, easy-to-read summary of the following notes in a few key bullet points:\n\n---\n\n" + content;
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Failed to generate summary.");
            }

            const data = await response.json();
            const summaryText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            setSummary(summaryText || "Could not extract summary from response.");

        } catch (error) {
            console.error("Summarization Error:", error);
            setSummary(`Error: ${error.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen animate-fadeIn">
            <header className="flex-shrink-0 bg-white/5 backdrop-blur-md border-b border-white/10 z-10 sticky top-0">
                <div className="px-12 py-4 flex justify-between items-center">
                    <button onClick={onExit} className="flex items-center text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Notes
                    </button>
                    
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleSummarize}
                            disabled={!content.trim() || isSummarizing || !API_KEY}
                            className="flex items-center text-sm font-medium text-indigo-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <AlignLeftIcon className="w-5 h-5 mr-1" />
                            {isSummarizing ? 'Summarizing...' : 'Summarize'}
                        </button>
                        <div className="text-sm text-slate-300">{status}</div>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Note" className="text-4xl font-bold text-white w-full focus:outline-none mb-4 bg-transparent placeholder-slate-400" />
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing your notes here..." className="w-full min-h-[70vh] text-lg text-slate-200 leading-relaxed focus:outline-none resize-none bg-transparent placeholder-slate-400" />
                </div>
            </main>

            {summary && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-slate-800">Note Summary</h3>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <p className="text-slate-700 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: summary.replace(/\*/g, '•').replace(/\n/g, '<br />') }}></p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t rounded-b-2xl text-right">
                             <button onClick={() => setSummary(null)} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
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
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        const checkStorage = () => {
             try {
                const storedNotes = JSON.parse(localStorage.getItem('studyNotes') || '[]');
                if (storedNotes.length !== notes.length || JSON.stringify(storedNotes) !== JSON.stringify(notes)) {
                   setNotes(storedNotes);
                   mockFirestore.notes = storedNotes;
                }
             } catch (error) {
                 console.error("Error reading notes from localStorage:", error);
             }
        };
        const interval = setInterval(checkStorage, 2000);
        window.addEventListener('focus', checkStorage);

        return () => {
             clearInterval(interval);
             window.removeEventListener('focus', checkStorage);
        };
    }, [notes]);

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const newNote = {
            id: crypto.randomUUID(),
            title: newTitle.trim(),
            content: '',
            timestamp: new Date().toISOString()
        };

        const updatedNotes = [newNote, ...notes];
        mockFirestore.notes = updatedNotes; 
        saveToStorage(); 
        setNotes(updatedNotes); 
        setNewTitle('');

        onSelectNote(newNote); 
        try { const user = await getCurrentUser(); if (user) await upsertNote(user.id, newNote); } catch {}
        addActivity('notes'); // Track note creation activity
    };

    const handleDeleteNote = async (e, noteId) => {
        e.stopPropagation();
        if (window.confirm("Delete this note?")) {
            const updatedNotes = notes.filter(n => n.id !== noteId);
            mockFirestore.notes = updatedNotes;
            saveToStorage();
            setNotes(updatedNotes);
            try { const user = await getCurrentUser(); if (user) await deleteNoteRow(user.id, noteId); } catch {}
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="p-4 sm:p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
                <form onSubmit={handleCreateNote} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Create a new note (e.g., 'React Hooks Summary')"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 p-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                         type="submit"
                         className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all font-medium"
                    >
                        <PlusIcon /> Create
                    </button>
                </form>
            </div>

            <div>
                {notes.length > 0 ? (
                    <div className="space-y-6">
                        {notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => onSelectNote(note)}
                                className="rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-bold text-white">{note.title || 'Untitled'}</h3>
                                    <button
                                         onClick={(e) => handleDeleteNote(e, note.id)}
                                         className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all z-10"
                                         aria-label="Delete Note"
                                    >
                                        <DeleteIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="mt-4 text-sm text-slate-300">
                                    Last edited: {new Date(note.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center">
                        <div className="mb-4 text-slate-300 w-16 h-16">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
                        <p className="text-slate-300">Create your first note to get started!</p>
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
    const [mode, setMode] = useState('focus');
    const intervalRef = useRef(null);
    const targetTimeRef = useRef(0);
    const audioRef = useRef(new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV'));

    useEffect(() => {
        if (!isActive) {
            setMinutes(mode === 'focus' ? focusDuration : breakDuration);
            setSeconds(0);
        }
    }, [focusDuration, breakDuration, mode, isActive]);

    useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => {
                const remaining = targetTimeRef.current - Date.now();

                if (remaining <= 0) {
                    clearInterval(intervalRef.current);
                    setIsActive(false);
                    audioRef.current.play();

                    if (mode === 'focus') {
                        addActivity('timer');
                        setSessions(prev => prev + 1);
                        setMode('break');
                        setMinutes(breakDuration);
                        setSeconds(0);
                    } else {
                        setMode('focus');
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
        const currentTotalSeconds = (mode === 'focus' ? focusDuration : breakDuration) * 60;
        targetTimeRef.current = Date.now() + currentTotalSeconds * 1000;
        setMinutes(mode === 'focus' ? focusDuration : breakDuration); 
        setSeconds(0);
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
        setMinutes(mode === 'focus' ? focusDuration : breakDuration);
        setSeconds(0);
    };

    const handleSkip = () => {
        clearInterval(intervalRef.current);
        setIsActive(false);
        setIsPaused(false);

        if (mode === 'focus') {
            setMode('break');
            setMinutes(breakDuration);
            setSeconds(0);
        } else {
            setMode('focus');
            setMinutes(focusDuration);
            setSeconds(0);
        }
    };

    const formatTime = (mins, secs) => {
        let totalSeconds = (mins * 60) + secs;
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        totalSeconds %= (24 * 60 * 60);
        const hours = Math.floor(totalSeconds / (60 * 60));
        totalSeconds %= (60 * 60);
        const displayMinutes = Math.floor(totalSeconds / 60);
        const displaySeconds = totalSeconds % 60;

        const sDays = days.toString();
        const sHours = hours.toString().padStart(2, '0');
        const sMinutes = displayMinutes.toString().padStart(2, '0');
        const sSeconds = displaySeconds.toString().padStart(2, '0');

        if (days > 0) return `${sDays}d ${sHours}:${sMinutes}:${sSeconds}`;
        if (hours > 0) return `${sHours}:${sMinutes}:${sSeconds}`;
        return `${sMinutes}:${sSeconds}`;
    };

    const totalDurationSeconds = (mode === 'focus' ? focusDuration : breakDuration) * 60;
    const timeRemainingSeconds = minutes * 60 + seconds;
    const progress = totalDurationSeconds > 0 ? ((totalDurationSeconds - timeRemainingSeconds) / totalDurationSeconds) * 100 : 0;


    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                <div className={`
                    rounded-2xl shadow-2xl p-12 transition-all duration-500 ease-in-out
                    bg-white/5 backdrop-blur-md border border-white/10
                `}>
                    <div className="text-center mb-8">
                        <h2 className={`
                            text-3xl font-bold mb-2 transition-colors duration-500
                            text-white
                        `}>
                            {mode === 'focus' ? '🍅 Focus Zone' : '☕ Relax Mode'}
                        </h2>
                        <p className={`
                            transition-colors duration-500
                            text-slate-300
                        `}>
                            {mode === 'focus' ? 'Lock in and be productive.' : 'Take a well-deserved break.'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-center sm:space-x-6 space-y-4 sm:space-y-0 mb-8">
                        <div className="text-center">
                            <label className={`
                                block text-sm font-medium mb-1 transition-colors duration-500
                                text-slate-300
                            `}>
                                Focus (min)
                            </label>
                            <input
                                type="number"
                                value={focusDuration}
                                onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                disabled={isActive}
                                className={`
                                    w-full sm:w-24 p-2 text-center text-lg font-semibold rounded-lg transition-all duration-500
                                    disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500
                                    bg-white/10 text-white border border-white/10
                                `}
                            />
                        </div>
                        <div className="text-center">
                            <label className={`
                                block text-sm font-medium mb-1 transition-colors duration-500
                                text-slate-300
                            `}>
                                Break (min)
                            </label>
                            <input
                                type="number"
                                value={breakDuration}
                                onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                disabled={isActive}
                                className={`
                                    w-full sm:w-24 p-2 text-center text-lg font-semibold rounded-lg transition-all duration-500
                                    disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500
                                    bg-white/10 text-white border border-white/10
                                `}
                            />
                        </div>
                    </div>

                    <div className="relative mb-12">
                        <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto relative">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none"
                                    className={`
                                        transition-colors duration-500 text-white/10
                                    `}
                                />
                                <circle
                                    cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none"
                                    strokeDasharray={`${2 * Math.PI * 45}`}
                                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                                    className={`
                                        transition-all duration-1000 ease-linear
                                        ${mode === 'focus' ? 'text-indigo-400' : 'text-emerald-400'}
                                    `}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`
                                        text-6xl font-mono font-bold mb-2 transition-colors duration-500 text-white
                                    `}>
                                        {formatTime(minutes, seconds)}
                                    </div>
                                    <div className={`
                                        text-sm uppercase tracking-wide transition-colors duration-500 text-slate-300
                                    `}>
                                        {mode === 'focus' ? 'Focus Session' : 'Break Time'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 mb-8">
                        {!isActive ? (
                            <button onClick={handleStart} className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all font-medium">
                                <PlayIcon /> Start
                            </button>
                        ) : (
                            <>
                                <button onClick={handlePause} className="flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-lg transform hover:scale-105 transition-all font-medium">
                                    {isPaused ? <PlayIcon /> : <PauseIcon />} {isPaused ? 'Resume' : 'Pause'}
                                </button>
                                <button
                                    onClick={handleStop}
                                    className={`
                                        flex items-center px-6 py-4 rounded-xl transform hover:scale-105 transition-all font-medium
                                        bg-white/10 text-white hover:bg-white/20
                                    `}
                                >
                                    <StopIcon /> Stop
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className={`
                                        flex items-center px-6 py-4 rounded-xl transform hover:scale-105 transition-all font-medium
                                        bg-white/10 text-white hover:bg-white/20
                                    `}
                                >
                                    <SkipIcon /> Skip
                                </button>
                            </>
                        )}
                    </div>

                    <div className="text-center">
                        <div className={`
                            text-sm mb-2 transition-colors duration-500
                            text-slate-300
                        `}>
                            Sessions Completed Today
                        </div>
                        <div className={`
                            text-3xl font-bold transition-colors duration-500
                            text-white
                        `}>
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
            type: 'ai',
            content: "Hi! I'm your AI study assistant. I can help you with explanations, study strategies, quiz creation, and more. What would you like to learn about today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const API_KEY = null; // Disabled for security - Gemini API key should not be exposed publicly

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const callGeminiAPI = async (prompt) => {
         if (!API_KEY) {
             console.error("API Key not found.");
             return "Error: API Key not configured.";
         }
         setIsLoading(true);

         const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;
         const payload = {
             contents: [{ parts: [{ text: prompt }] }]
         };

         try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
             const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
             if (!text) {
                 console.warn("API response structure unexpected:", data);
                 return "Sorry, I received an unexpected response.";
             }
             return text;

        } catch (error) {
            console.error("Fetch/API Error:", error);
            return `Sorry, there was an error: ${error.message}`;
        } finally {
            setIsLoading(false);
        }
    };


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessageContent = input.trim();
        const userMessage = { type: 'user', content: userMessageContent };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        const aiResponseContent = await callGeminiAPI(userMessageContent);
        setMessages(prev => [...prev, { type: 'ai', content: aiResponseContent }]);
    };

    const quickActionHandler = async (prompt) => {
        if (isLoading) return;

        const userMessage = { type: 'user', content: prompt };
        setMessages(prev => [...prev, userMessage]);

        const aiResponseContent = await callGeminiAPI(prompt);
        setMessages(prev => [...prev, { type: 'ai', content: aiResponseContent }]);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="max-w-4xl mx-auto px-4 sm:px-0">
                <div className="rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10 h-[70vh] sm:h-[75vh] flex flex-col">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <AIIcon className="mr-2"/> 
                            AI Study Assistant
                        </h2>
                        <p className="text-slate-300">Get help with your studies, explanations, and learning strategies</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.type === 'user' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white/10 text-white border border-white/10'}`}>
                                    <p className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}></p> 
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
                    <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={!API_KEY ? "API Key not configured..." : "Ask me anything about your studies..."}
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
                        {!API_KEY && <p className="text-xs text-amber-300 mt-2">AI Assistant is disabled for security. The Gemini API key should not be exposed publicly in production.</p>}
                    </form>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-4 sm:px-0">
                     <button onClick={() => quickActionHandler('Give me study tips')} className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || !API_KEY}>
                        <h3 className="font-semibold text-white mb-2">📚 Study Tips</h3>
                        <p className="text-sm text-slate-300">Get effective study strategies and techniques</p>
                     </button>
                    <button onClick={() => quickActionHandler('Help me with math')} className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || !API_KEY}>
                        <h3 className="font-semibold text-white mb-2">🔢 Math Help</h3>
                        <p className="text-sm text-slate-300">Get assistance with mathematical concepts</p>
                     </button>
                    <button onClick={() => quickActionHandler('Explain science concepts')} className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || !API_KEY}>
                        <h3 className="font-semibold text-white mb-2">🔬 Science Help</h3>
                        <p className="text-sm text-slate-300">Understand scientific principles and concepts</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

const FlashcardsPage = () => {
    const [decks, setDecks] = useState(mockFirestore.decks);
    const [newDeckName, setNewDeckName] = useState('');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [cardFront, setCardFront] = useState('');
    const [cardBack, setCardBack] = useState('');
    const newDeckInputRef = useRef(null);
    
    const [viewMode, setViewMode] = useState('decks'); // 'decks', 'cards', 'study'
    const [studySession, setStudySession] = useState({ cards: [], currentIndex: 0, isFlipped: false, animateOut: null });
    const [studyDeckName, setStudyDeckName] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        const checkStorage = () => {
             try {
                const storedDecks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
                 if (JSON.stringify(storedDecks) !== JSON.stringify(decks)) {
                   setDecks(storedDecks);
                   mockFirestore.decks = storedDecks;
                   if (selectedDeck && !storedDecks.some(d => d.id === selectedDeck.id)) {
                       setSelectedDeck(null); setViewMode('decks');
                   } else if (selectedDeck) {
                        setSelectedDeck(storedDecks.find(d => d.id === selectedDeck.id));
                   }
                }
             } catch (error) { console.error("Error reading decks from localStorage:", error); }
        };
        const interval = setInterval(checkStorage, 2000);
        window.addEventListener('focus', checkStorage);
        return () => { clearInterval(interval); window.removeEventListener('focus', checkStorage); };
    }, [decks, selectedDeck]);

    const createDeck = async (e) => { 
        e.preventDefault(); 
        if (!newDeckName.trim()) return; 
        const newDeck = { id: crypto.randomUUID(), name: newDeckName.trim(), cards: [], created_at: new Date().toISOString() }; 
        const updatedDecks = [newDeck, ...decks]; 
        mockFirestore.decks = updatedDecks; 
        saveToStorage(); 
        setDecks(updatedDecks); 
        setNewDeckName(''); 
        try { const user = await getCurrentUser(); if (user) await upsertDeck(user.id, newDeck); } catch {} 
        addActivity('notes'); // Track deck creation activity
    };
    const deleteDeck = async (deckId) => { if (window.confirm("Delete this deck and all its cards?")) { const updatedDecks = decks.filter(deck => deck.id !== deckId); mockFirestore.decks = updatedDecks; saveToStorage(); setDecks(updatedDecks); if (selectedDeck?.id === deckId) { setSelectedDeck(null); setViewMode('decks'); } try { const user = await getCurrentUser(); if (user) await deleteDeckRow(user.id, deckId); } catch {} } };
    const addCard = async (e) => { 
        e.preventDefault(); 
        if (!selectedDeck || !cardFront.trim() || !cardBack.trim()) return; 
        const newCard = { id: crypto.randomUUID(), front: cardFront.trim(), back: cardBack.trim(), created_at: new Date().toISOString() }; 
        const updatedDecks = decks.map(deck => { 
            if (deck.id === selectedDeck.id) { 
                const existingCards = deck.cards || []; 
                return { ...deck, cards: [newCard, ...existingCards] }; 
            } 
            return deck; 
        }); 
        mockFirestore.decks = updatedDecks; 
        saveToStorage(); 
        setDecks(updatedDecks); 
        setSelectedDeck(updatedDecks.find(d => d.id === selectedDeck.id)); 
        setCardFront(''); 
        setCardBack(''); 
        try { const user = await getCurrentUser(); if (user) await upsertCard(user.id, { id: newCard.id, deckId: selectedDeck.id, front: newCard.front, back: newCard.back, created_at: newCard.created_at }); } catch {} 
        addActivity('notes'); // Track card creation activity
    };
    const deleteCard = async (cardId) => { if (!selectedDeck) return; if (window.confirm("Delete this card?")) { const updatedDecks = decks.map(deck => { if (deck.id === selectedDeck.id) { const updatedCards = (deck.cards || []).filter(card => card.id !== cardId); return { ...deck, cards: updatedCards }; } return deck; }); mockFirestore.decks = updatedDecks; saveToStorage(); setDecks(updatedDecks); setSelectedDeck(updatedDecks.find(d => d.id === selectedDeck.id)); try { const user = await getCurrentUser(); if (user) await deleteCardRow(user.id, cardId); } catch {} } };

    const handleStartStudy = (deck) => {
        if (!deck.cards || deck.cards.length === 0) { alert("This deck has no cards to study!"); return; }
        const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5);
        setStudySession({ cards: shuffledCards, currentIndex: 0, isFlipped: false, animateOut: null });
        setStudyDeckName(deck.name || 'Study');
        setRevealed(false);
        setViewMode('study');
    };
    
    const handleNextCard = (direction) => {
        setStudySession(prev => ({ ...prev, animateOut: direction }));
        setTimeout(() => {
            setStudySession(prev => {
                const nextIndex = (prev.currentIndex + 1) % prev.cards.length;
                return { ...prev, currentIndex: nextIndex, isFlipped: false, animateOut: null };
            });
            setRevealed(false);
        }, 300);
    };

    const handlePrevCard = () => {
        setStudySession(prev => ({ ...prev, animateOut: 'left' }));
        setTimeout(() => {
            setStudySession(prev => {
                const len = prev.cards.length || 1;
                const prevIndex = (prev.currentIndex - 1 + len) % len;
                return { ...prev, currentIndex: prevIndex, isFlipped: false, animateOut: null };
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
    
    if (viewMode === 'study') {
        const currentCard = studySession.cards[studySession.currentIndex];
        const progress = ((studySession.currentIndex + 1) / studySession.cards.length) * 100;
        let cardAnimationClass = 'animate-fade-in-up';
        if (studySession.animateOut === 'right') cardAnimationClass = 'animate-fly-out-right';
        if (studySession.animateOut === 'left') cardAnimationClass = 'animate-fly-out-left';

        if (isCompleted) {
            return (
                <div className="fixed inset-0 flex flex-col items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950" />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Session Complete 🎉</h3>
                        <p className="text-slate-300 mb-6">You reviewed all cards in "{studyDeckName}".</p>
                        <button onClick={() => { setIsCompleted(false); setViewMode('decks'); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition shadow">Back to Decks</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 flex flex-col items-center p-4 animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950" />
                <AnimatedBackground />

                {/* Header */}
                <div className="relative z-10 w-full max-w-3xl">
                    <div className="mt-2 rounded-2xl px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-between">
                        <button onClick={() => setViewMode('decks')} className="inline-flex items-center px-3 py-2 rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition">
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Exit
                        </button>
                        <div className="text-sm sm:text-base font-semibold text-white truncate px-2">{studyDeckName || 'Study'}</div>
                        <div className="text-xs text-slate-300 whitespace-nowrap">{studySession.currentIndex + 1} / {studySession.cards.length}</div>
                    </div>

                    {/* Progress */}
                    <div className="mt-3 px-1">
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div className={`relative z-10 w-full max-w-3xl mt-6 ${cardAnimationClass}`}>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.25)] p-6 sm:p-8">
                        <p className="text-slate-300 text-xs uppercase tracking-wide mb-2">Question</p>
                        <p className="text-2xl sm:text-3xl font-semibold text-white text-center">{currentCard.front}</p>

                        {!revealed && (
                            <div className="mt-6 flex justify-center">
                                <button onClick={() => setRevealed(true)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition shadow">
                                    Reveal Answer
                                </button>
                            </div>
                        )}

                        {revealed && (
                            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
                                <p className="text-slate-300 text-xs uppercase tracking-wide mb-2">Answer</p>
                                <p className="text-xl sm:text-2xl font-medium text-white text-center">{currentCard.back}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="relative z-10 mt-6 flex items-center flex-wrap gap-3 sm:gap-4">
                    <button onClick={handlePrevCard} className="inline-flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20 transition shadow">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                        Previous
                    </button>
                    <button onClick={() => handleNextCard('left')} className="inline-flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-400/50 transition shadow">
                        <XIcon className="w-5 h-5 mr-2"/> {"Didn't Know"}
                    </button>
                    <button onClick={() => handleNextCard('right')} className="inline-flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition shadow">
                        <CheckIcon className="w-5 h-5 mr-2"/> {"I Knew It"}
                    </button>
                    {studySession.currentIndex === (studySession.cards.length - 1) && (
                        <button onClick={() => { setIsCompleted(true); addActivity('notes'); }} className="inline-flex items-center px-5 sm:px-6 py-3 sm:py-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50 transition shadow">
                            Finish Session
                        </button>
                    )}
                </div>
            </div>
    );
    }
    
    if (viewMode === 'cards') {
        return (
            <div className="space-y-8 animate-fade-in">
                <button onClick={() => {setSelectedDeck(null); setViewMode('decks');}} className="flex items-center text-sm font-medium text-slate-300 hover:text-white mb-4">
                     <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Decks
                </button>
                <h2 className="text-3xl font-bold text-white -mt-4">{selectedDeck.name}</h2>
                 <div className="p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
                     <h3 className="text-xl font-bold text-white mb-4">Add New Card</h3>
                     <form onSubmit={addCard} className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-slate-300 mb-1">Front (Question/Term)</label>
                             <textarea value={cardFront} onChange={(e)=> setCardFront(e.target.value)} placeholder="e.g., What is React?" className="w-full p-3 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="2"></textarea>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-300 mb-1">Back (Answer/Definition)</label>
                             <textarea value={cardBack} onChange={(e)=> setCardBack(e.target.value)} placeholder="e.g., A JavaScript library for building user interfaces." className="w-full p-3 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3"></textarea>
                        </div>
                        <button type="submit" className="flex items-center justify-center bg-indigo-500 text-white px-5 py-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium"><PlusIcon className="w-5 h-5 mr-1"/> Add Card</button>
                     </form>
                 </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Cards ({selectedDeck.cards?.length || 0})</h3>
                    {(selectedDeck.cards?.length || 0) > 0 ? ( selectedDeck.cards.map(card => ( <div key={card.id} className="p-4 rounded-lg shadow bg-white/5 backdrop-blur-md border border-white/10 group flex justify-between items-start"> <div className="flex-1 mr-2"><p className="font-semibold text-white mb-1 break-words">{card.front}</p><p className="text-slate-300 break-words">{card.back}</p></div> <button onClick={() => deleteCard(card.id)} className="p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/10 ml-2 flex-shrink-0" aria-label="Delete Card"><DeleteIcon className="w-5 h-5" /></button> </div>)) ) : ( <p className="text-slate-300 text-sm text-center py-4">No cards added yet.</p> )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fadeIn px-4 sm:px-0">
            <div className="p-6 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Create New Deck</h3>
                <form onSubmit={createDeck} className="flex flex-col sm:flex-row gap-4">
                    <input ref={newDeckInputRef} type="text" placeholder="Deck Name (e.g., JavaScript Concepts)" value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} required className="flex-1 p-4 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all font-medium"><PlusIcon /> Create Deck</button>
                </form>
            </div>
             <div>
                 <h3 className="text-2xl font-bold text-white mb-4">Your Decks</h3>
                 {decks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {decks.map((deck, i) => (
                            <div key={deck.id} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 flex flex-col group transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="p-6 flex-1">
                                    <h4 className="text-lg font-bold text-white break-words">{deck.name}</h4>
                                    <p className="text-sm text-slate-300 mt-1">{deck.cards?.length || 0} card{(deck.cards?.length || 0) !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="border-t border-white/10 p-4 flex items-center justify-between bg-white/5 rounded-b-2xl">
                                    <button onClick={() => {setSelectedDeck(deck); setViewMode('cards');}} className="text-sm font-semibold text-indigo-300 hover:text-white">Edit Cards</button>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleStartStudy(deck)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!deck.cards || deck.cards.length === 0}>Study</button>
                                        <button onClick={() => deleteDeck(deck.id)} className="p-2 text-slate-300 rounded-full hover:bg-red-500/10 hover:text-red-400" title="Delete Deck"><DeleteIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                     <div className="text-center py-16 rounded-2xl border border-dashed border-white/20 bg-white/5 backdrop-blur-md">
                        <LayersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
                        <h3 className="text-xl font-semibold text-white mb-2">No decks yet</h3>
                        <p className="text-slate-300 mb-4">Create your first deck to start studying.</p>
                        <button onClick={() => newDeckInputRef.current?.focus()} className="inline-flex items-center px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 shadow transition">
                            <PlusIcon className="w-5 h-5 mr-2"/> Create your first deck
                        </button>
                     </div>
                 )}
             </div>
        </div>
    );
};

const Dashboard = ({ onSignOut }) => {
    const [currentPage, setCurrentPage] = useState('home');
    const [editingNote, setEditingNote] = useState(null);
    const [isMobileOpen, setMobileOpen] = useState(false);

    const pageTitles = {
        home: "Study Activity Dashboard",
        notes: "My Notes",
        timer: "Focus Zone",
        flashcards: "Flashcard Decks",
        ai: "AI Learning Assistant"
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage />;
            case 'notes': return <NotesPage onSelectNote={setEditingNote} />;
            case 'timer': return <TimerPage />;
            case 'flashcards': return <FlashcardsPage />;
            case 'ai': return <AIAssistantPage />;
            default: return <HomePage />;
        }
    };

    if (editingNote) {
        return <NoteEditorPage note={editingNote} onExit={() => setEditingNote(null)} />;
    }
    
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
            <Sidebar currentPage={currentPage} setPage={setCurrentPage} onSignOut={onSignOut} isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
            <main className="flex-1 lg:ml-72">
                <header className="sticky top-0 bg-white/5 backdrop-blur-md border-b border-white/10 z-10">
                    <div className="px-4 sm:px-8 lg:px-12 py-4 sm:py-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20 focus:outline-none" onClick={() => setMobileOpen(true)} aria-label="Open Menu">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{pageTitles[currentPage] || 'Dashboard'}</h1>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-300">Today: {new Date().toLocaleDateString()}</span>
                    </div>
                </header>
                <div className="px-4 sm:px-8 lg:px-12 py-6 lg:py-12">{renderPage()}</div>
            </main>
        </div>
    );
};

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        const sub = onAuthChange(async (user) => {
            if (user) {
                setIsLoadingData(true);
                
                // Load data from Supabase when user logs in
                await loadDataFromSupabase(user.id);
                
                // Sync any existing localStorage data to Supabase (for data created before the fix)
                await syncLocalDataToSupabase(user.id);
                
                // Update mockFirestore from localStorage
                mockFirestore.notes = JSON.parse(localStorage.getItem('studyNotes') || '[]');
                mockFirestore.tasks = JSON.parse(localStorage.getItem('studyTasks') || '[]');
                mockFirestore.decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
                mockFirestore.activities = JSON.parse(localStorage.getItem('studyActivities') || '{}');
                
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
                
                // Sync any existing localStorage data to Supabase (for data created before the fix)
                await syncLocalDataToSupabase(user.id);
                
                mockFirestore.notes = JSON.parse(localStorage.getItem('studyNotes') || '[]');
                mockFirestore.tasks = JSON.parse(localStorage.getItem('studyTasks') || '[]');
                mockFirestore.decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
                mockFirestore.activities = JSON.parse(localStorage.getItem('studyActivities') || '{}');
                
                setIsLoadingData(false);
                setIsLoggedIn(true);
            }
        })();

        return () => sub?.data?.subscription?.unsubscribe?.();
    }, []);

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
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
    
    return <Dashboard onSignOut={async () => { 
        await supabase.auth.signOut(); 
        setIsLoggedIn(false); 
    }} />;
}