import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import heroImg from '../assets/hero.png';
import { api } from '../services/api';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Tracking active header role indicator ('students' or 'recruiters')
  const [activeRole, setActiveRole] = useState<'students' | 'recruiters'>('students');

  // Stats state for dynamic count
  const [stats, setStats] = useState({ students: 0, recruiters: 0, admins: 0 });

  useEffect(() => {
    api.auth.getStats()
      .then(res => {
        setStats({
          students: res.students || 0,
          recruiters: res.recruiters || 0,
          admins: res.admins || 0
        });
      })
      .catch(err => {
        console.error('Error fetching live stats:', err);
      });
  }, []);

  // Carousel ref for scroll behavior
  const carouselRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to update active header role based on scroll depth
  useEffect(() => {
    const studentsEl = document.getElementById('students-section');
    const recruitersEl = document.getElementById('recruiters-section');

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'students-section') {
            setActiveRole('students');
          } else if (entry.target.id === 'recruiters-section') {
            setActiveRole('recruiters');
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (studentsEl) observer.observe(studentsEl);
    if (recruitersEl) observer.observe(recruitersEl);

    return () => {
      if (studentsEl) observer.unobserve(studentsEl);
      if (recruitersEl) observer.unobserve(recruitersEl);
    };
  }, []);

  // Custom CSS Injection for keyframe animations and scrollbar hider
  useEffect(() => {
    const styles = document.createElement('style');
    styles.id = "custom-home-redesign-styles";
    styles.innerHTML = `
      @keyframes float-blob {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-20px) scale(1.04); }
      }
      .animate-float-blob {
        animation: float-blob 10s infinite ease-in-out;
      }
      .scrollbar-none::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-none {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .hero-title {
        background: none !important;
        background-clip: border-box !important;
        -webkit-background-clip: border-box !important;
        -webkit-text-fill-color: currentColor !important;
      }
    `;
    document.head.appendChild(styles);
    return () => {
      document.getElementById('custom-home-redesign-styles')?.remove();
    };
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 380;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-500 font-sans">

      {/* 2. Floating Pill Navigation Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[1120px] z-50 rounded-full border border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-[#16171b]/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 px-6 py-3 flex justify-between items-center">
        {/* Branding Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
        >
          <img src={logoImg} alt="CareerIQ Logo" className="w-7 h-7 object-contain rounded-md" />
        </div>

        {/* Central Toggle */}
        <div className="flex items-center bg-[#f3f0ea] dark:bg-[#1e2025] rounded-full p-1 border border-slate-200/30 dark:border-white/5 shadow-inner">
          <button
            onClick={() => {
              setActiveRole('students');
              document.getElementById('students-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeRole === 'students'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-[#3b4cb8] dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
          >
            Students
          </button>
          <button
            onClick={() => {
              setActiveRole('recruiters');
              document.getElementById('recruiters-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${activeRole === 'recruiters'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-[#10b981] dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
          >
            Recruiters
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">


          <button
            onClick={() => navigate('/login')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ${theme === 'dark'
              ? 'border border-[#1c223c] hover:bg-[#1c223c]/40 text-white'
              : 'text-slate-600 hover:text-slate-900 border border-slate-300/60 hover:bg-slate-50'
              }`}
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/register')}
            className="bg-[#4b61eb] hover:bg-[#3b51e6] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 shadow-md shadow-[#4b61eb]/25 hover:scale-[1.02] active:scale-95"
          >
            Discover My Potential
          </button>
        </div>
      </header>

      <main className="relative z-10">

        {/* 3. Hero Section (Centered Two-Column Layout) */}
        <section id="students-section" className="pt-28 pb-16 px-6 md:px-12 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-100px)] relative z-10 overflow-hidden">
          {/* Left Text Block */}
          <div className="flex flex-col items-center text-center">
            <h1
              className="font-['Outfit'] text-[38px] md:text-[56px] font-extrabold tracking-tight text-slate-800 dark:text-white leading-[1.12] max-w-[600px] text-center transition-colors duration-500"
              style={{
                background: 'none',
                WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: 'currentColor',
                color: 'currentColor'
              }}
            >
              Know Your Hiring Potential <br />
              Before Recruiters Do
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mt-5 leading-relaxed font-normal transition-colors duration-500 text-center">
              Meet the dynamic career rating engine. Upload your resume, link your profiles, and discover where you stand in seconds.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 bg-[#4b61eb] hover:bg-[#3b51e6] text-white rounded-xl font-bold text-sm shadow-[0_8px_28px_rgba(75,97,235,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] tracking-wide"
              >
                Discover My Potential
              </button>
              <button
                onClick={() => {
                  document.getElementById('recruiters-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-8 py-3.5 text-sm font-bold rounded-xl border transition-all duration-300 ${theme === 'dark'
                  ? 'border-[#1c223c] hover:bg-[#1c223c]/40 text-white'
                  : 'text-slate-600 hover:text-slate-900 border-slate-300/60 hover:bg-slate-50'
                  }`}
              >
                For Recruiters
              </button>
            </div>
          </div>

          {/* Right Column: Group 5-people illustration */}
          <div className="w-full max-w-[640px] relative transition-transform duration-500 hover:scale-[1.01] flex justify-center">
            <img
              src={heroImg}
              alt="Mentorship and Career Guidance Journey"
              className="w-full h-auto object-contain max-h-[60vh] lg:max-h-none mx-auto lg:mr-0"
            />
          </div>
        </section>

        {/* 3b. Stats Bar Section */}
        <section className="py-12 px-6 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5 relative">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400/90">
              Live Database Status
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/40 dark:bg-[#121526]/40 border border-slate-200/30 dark:border-[#1c223c]/40 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#4b61eb]/30">
              <h3 className="text-4xl font-extrabold text-[#4b61eb] dark:text-[#9bb2ff] mb-1">{stats.students}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Candidates</p>
            </div>
            <div className="bg-white/40 dark:bg-[#121526]/40 border border-slate-200/30 dark:border-[#1c223c]/40 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#4b61eb]/30">
              <h3 className="text-4xl font-extrabold text-[#4b61eb] dark:text-[#9bb2ff] mb-1">{stats.recruiters}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Recruiters</p>
            </div>
            <div className="bg-white/40 dark:bg-[#121526]/40 border border-slate-200/30 dark:border-[#1c223c]/40 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#4b61eb]/30">
              <h3 className="text-4xl font-extrabold text-[#4b61eb] dark:text-[#9bb2ff] mb-1">{stats.admins}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Admins</p>
            </div>
          </div>
        </section>

        {/* 3c. Comparison Section ("The Smart Way to Get Hired") */}
        <section className="py-20 px-6 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
              The Smart Way to <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Get Hired</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              The automated verification engine for a faster career path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Screening */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
                ✕ Traditional Screening (Painful)
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span>Manual CV filtering & bias</span>
                </li>
                <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span>No feedback on why you were rejected</span>
                </li>
                <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span>Weeks of waiting for a recruiter response</span>
                </li>
                <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span>Inconsistent profile sections</span>
                </li>
              </ul>
            </div>

            {/* CareerIQ Engine */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#4b61eb]" />
              <h3 className="text-xl font-bold text-emerald-500 mb-6 flex items-center gap-2">
                ✓ CareerIQ Engine (Solution)
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span>Real-time AI profile evaluation</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span>Actionable improvement recommendations</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span>Zero-noise connection with matching roles</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span>24/7 AI Career Coach assistance</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Comprehensive Verification Section */}
        <section className="py-20 px-6 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
              Comprehensive <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Verification</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Verify your coding skills, parse your credentials, and get an objective job readiness rating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Automated Analysis */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-[#1c223c] flex items-center justify-center text-2xl mb-4">
                📄
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">Automated Analysis</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Parse resume content and evaluate skills in seconds.
              </p>
            </div>

            {/* GitHub Evaluation */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-[#1c223c] flex items-center justify-center text-2xl mb-4">
                💻
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">GitHub Evaluation</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Connect your GitHub to calculate real-world coding impact.
              </p>
            </div>

            {/* LinkedIn Verification */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-[#1c223c] flex items-center justify-center text-2xl mb-4">
                🛡️
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">LinkedIn Verification</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Verify employment and academic history.
              </p>
            </div>

            {/* Project Assessment */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-[#1c223c] flex items-center justify-center text-2xl mb-4">
                📁
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">Project Assessment</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Real-time code quality and architectural design reviews.
              </p>
            </div>

            {/* Cert Verification */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-[#1c223c] flex items-center justify-center text-2xl mb-4">
                ✓
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">Cert Verification</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Validate credential links in real time.
              </p>
            </div>

            {/* DSA Evaluation */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-[#1c223c] flex items-center justify-center text-2xl mb-4">
                ⚙️
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">DSA Evaluation</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Test your algorithmic logic through mock challenges.
              </p>
            </div>
          </div>

          {/* Personalized Roadmaps */}
          <div className="mt-8 bg-[#4b61eb]/5 dark:bg-[#4b61eb]/15 border border-[#4b61eb]/15 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-[#4b61eb]/15 dark:bg-[#4b61eb]/25 flex items-center justify-center text-3xl">
              🗺️
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">Personalized Roadmaps</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                A step-by-step training and project plan tailored to your profile goals.
              </p>
            </div>
          </div>
        </section>

        {/* 4b. The Top 1% Talent Section */}
        <section className="py-20 px-6 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
              The <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Top 1%</span> Talent
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Browse candidate ratings based on real verified coding metrics and portfolio reviews.
            </p>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-8 py-5 font-semibold">Candidate</th>
                  <th className="px-8 py-5 font-semibold text-center">Skill Index</th>
                  <th className="px-8 py-5 font-semibold">Top Category</th>
                  <th className="px-8 py-5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-sm">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#4b61eb]/15 flex items-center justify-center text-xs">👨‍💻</span>
                    Alex Rivera
                  </td>
                  <td className="px-8 py-4 text-center font-bold text-[#4b61eb] dark:text-[#9bb2ff]">88.5</td>
                  <td className="px-8 py-4 text-slate-500 dark:text-slate-400">Full Stack React/Node</td>
                  <td className="px-8 py-4">
                    <span className="badge badge-success text-[10px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 rounded-full">Active</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs">👩‍💻</span>
                    Sarah Jenkins
                  </td>
                  <td className="px-8 py-4 text-center font-bold text-emerald-500">92.0</td>
                  <td className="px-8 py-4 text-slate-500 dark:text-slate-400">Python Data Science</td>
                  <td className="px-8 py-4">
                    <span className="badge badge-success text-[10px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 rounded-full">Available</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-xs">👨‍💻</span>
                    Kenji Tanaka
                  </td>
                  <td className="px-8 py-4 text-center font-bold text-amber-500">89.5</td>
                  <td className="px-8 py-4 text-slate-500 dark:text-slate-400">Mobile iOS/Swift</td>
                  <td className="px-8 py-4">
                    <span className="badge badge-warning text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 rounded-full">Interviewing</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Stories of Transformation Section */}
        <section className="py-20 px-4 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5 relative">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-slate-800 dark:text-white text-2xl md:text-3xl font-extrabold">
              Success Stories from our <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Community</span>
            </h2>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                title="Scroll Left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                title="Scroll Right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12 8.25 19.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Testimonial slider / horizontal list */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          >
            {/* Testimonial 1 */}
            <div className="min-w-[280px] md:min-w-[350px] max-w-[370px] bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between snap-start transition-transform duration-300 hover:scale-[1.01]">
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm italic leading-relaxed mb-6">
                "CareerIQ allowed me to skip the entry-level resume screening completely. My verified profile got me interviews at top startups in less than a week."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-B8mvhqHGrNfNMVLzUiNGmhtihHv76-LQTL0C9pKXHm_0-yNwFy1BMykSer7gHnrjJI8so2pST2ny7xJdmRLCBJIKE-4U5zOr2XTlmbOhwm9nd1aqXGF13g6k9Eh7xvQAo-DZ2QrANSK7AX3IUfdqdJvAbvpDPw9zZhRp3xdHu_hii4otDnFDIfIRvZfKGYr2EDSwIm992hLnbv47NsNTxanYmc9EmCE5pSb7ypwJmj5CS6YYTKH8wFOX5MWyKv3MH5WVcTqFtA"
                  alt="Alex Rivera Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-[#4b61eb]/25"
                />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm">Alex Rivera</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="min-w-[280px] md:min-w-[350px] max-w-[370px] bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between snap-start transition-transform duration-300 hover:scale-[1.01]">
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm italic leading-relaxed mb-6">
                "We saved dozens of sourcing hours by filtering for verified candidate portfolios. It cuts out the noise completely."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYvVmG2UfDSHA0KKqeV2LgmvKtKJOdzUHs3ATRujDANTnyAi6GblYzy5WfcM0CM2TPBP0p100OYRyeXCmwl7XVoPdQzt1yiFZhhpAKt2GZgtVYxYk-GllydCh-HnN6fjIdntfcr1AgCvDzBkfvCMFGfDq34ODsoLXAet5mJw_fiyi1sH1L2HaWDPhghiR2JZna0bN11qObC03VQhI0AB0cR1ly_3TxQZZpS76L2o4zBouuyv2rQOjuXU29yustk9SDfbyLPrcNKQ"
                  alt="Sarah Jenkins Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-[#4b61eb]/25"
                />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm">Sarah Jenkins</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">Technical Recruiter</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="min-w-[280px] md:min-w-[350px] max-w-[370px] bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between snap-start transition-transform duration-300 hover:scale-[1.01]">
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm italic leading-relaxed mb-6">
                "The personalized learning path helped me focus on what counted. Within 3 weeks I had my first engineering job."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhE4awAotIqNGnXOYgfjiyghzCdvkclhztsy648spMzK0TE1huuQBxSVRc8SwKon5VHCflD4339jah5aohhiF43Nx_fJc60xkSwjm8_nzlWRs-kg6TsIubeVzWFfUw6PABtQbyiyDaVas5zCCHBbB-SvEmUxDgwXPe4oO0pRA3UIk1GRaMVJsi048wIcZWrzoTTCiJiKUpT85OMMccXleiA8OzxGYQ4ihIYDF1pxRl3JNEjc-5DY9qVDwWF25Y9r5A_Tq-3d5Dhw"
                  alt="Kenji Tanaka Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-[#4b61eb]/25"
                />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm">Kenji Tanaka</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">Frontend Developer</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 6. Supportive Career Coach Section */}
        <section className="py-20 px-4 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left Text */}
          <div className="space-y-6">
            <h2 className="text-slate-800 dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              Your Personal <br /><span className="text-[#4b61eb] dark:text-[#9bb2ff]">Career Strategist</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              The CareerIQ Coach works 24/7 to highlight your strengths, recommend skills, and make sure you're ready to show recruiters your best work.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg">⚡</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Real-Time Readiness</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">
                    Get instant metrics on how market-ready your profile is.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg">⚡</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Job-specific Training</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">
                    Custom roadmaps based on real job descriptions in your field.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right Phone Mockup */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[290px] aspect-[9/18] bg-[#fbf9f6] dark:bg-[#0b0c10] border-[8px] border-slate-800 dark:border-[#1c223c]/85 rounded-[36px] shadow-[0_20px_45px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col relative transition-colors duration-500">

              {/* Camera notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-800 dark:bg-slate-700 rounded-full z-20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-800 mr-6"></div>
                <div className="w-1 h-1 rounded-full bg-slate-900 dark:bg-slate-800"></div>
              </div>

              {/* Chat screen */}
              <div className="flex-1 flex flex-col p-3 pt-8 bg-[#fbf9f6] dark:bg-[#0f111a] text-slate-800 dark:text-slate-200">
                {/* Header inside chat */}
                <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2.5 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>

                  {/* Little Robot Avatar */}
                  <div className="w-7.5 h-7.5 rounded-full bg-[#4b61eb]/15 dark:bg-[#4b61eb]/25 flex items-center justify-center text-xs font-bold text-[#4b61eb] dark:text-[#9bb2ff]">
                    🤖
                  </div>

                  <div className="flex-1">
                    <h4 className="font-extrabold text-[10px] leading-tight">CareerIQ Coach</h4>
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      <span className="text-[7.5px] text-slate-400 leading-none">Online</span>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-grow flex flex-col gap-2.5">
                  {/* Message 1 (Coach) */}
                  <div className="self-start max-w-[85%]">
                    <div className="text-[7.5px] text-slate-400 mb-0.5 ml-1.5 font-semibold">CareerIQ Coach</div>
                    <div className="bg-[#f2efe9] dark:bg-[#1c223c] text-slate-800 dark:text-slate-200 text-[9.5px] p-2.5 rounded-xl rounded-tl-none shadow-sm leading-normal">
                      Hi Alex! Ready to explore some new opportunities today? I see you've been making great progress!
                    </div>
                  </div>

                  {/* Message 2 (User) */}
                  <div className="self-end max-w-[85%] mt-1">
                    <div className="text-[7.5px] text-slate-400 mb-0.5 mr-1.5 text-right font-semibold">Alex</div>
                    <div className="bg-[#4b61eb] text-white text-[9.5px] p-2.5 rounded-xl rounded-tr-none shadow-sm leading-normal">
                      Yes, I'm excited! How can I improve my leadership skills?
                    </div>
                  </div>

                  {/* Message 3 (Coach) */}
                  <div className="self-start max-w-[85%] mt-1">
                    <div className="text-[7.5px] text-slate-400 mb-0.5 ml-1.5 font-semibold">CareerIQ Coach</div>
                    <div className="bg-[#f2efe9] dark:bg-[#1c223c] text-slate-800 dark:text-slate-200 text-[9.5px] p-2.5 rounded-xl rounded-tl-none shadow-sm leading-normal">
                      Great question! Let's connect you with a leadership mentor and explore some tailored resources.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 6b. Recruiter Section ("Hire with Zero Noise") */}
        <section id="recruiters-section" className="py-20 px-6 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup Dashboard on Left */}
          <div className="w-full flex justify-center order-2 lg:order-1">
            <div className="w-full max-w-[460px] bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] shadow-[0_20px_45px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.3)] overflow-hidden p-6 relative">
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="text-xs text-slate-400 font-bold ml-2">Recruiter Dashboard</span>
                </div>
              </div>

              {/* Sample Profile Cards */}
              <div className="space-y-3">
                <div className="bg-slate-50/50 dark:bg-[#1a1f36]/50 border border-slate-200/30 dark:border-white/5 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Alex Rivera</h4>
                    <p className="text-[11px] text-slate-400">Full Stack React/Node</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#4b61eb] dark:text-[#9bb2ff] bg-[#4b61eb]/10 px-2.5 py-1 rounded-md">88.5 Rating</span>
                    <button className="text-[10px] font-bold bg-[#4b61eb] text-white px-3 py-1.5 rounded-lg hover:bg-[#3b51e6] transition-colors">View Profile</button>
                  </div>
                </div>
                <div className="bg-slate-50/50 dark:bg-[#1a1f36]/50 border border-slate-200/30 dark:border-white/5 p-4 rounded-xl flex justify-between items-center opacity-80">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Sarah Jenkins</h4>
                    <p className="text-[11px] text-slate-400">Python Data Scientist</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">92.0 Rating</span>
                    <button className="text-[10px] font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors">View Profile</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text on Right */}
          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">
              Hire with <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Zero Noise</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              Stop digging through thousands of unqualified resumes. CareerIQ delivers verified talent with automated scoring.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-emerald-500 text-lg">✓</span>
                <span>Verified engineering portfolios</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-emerald-500 text-lg">✓</span>
                <span>Autonomous technical reviews</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                <span className="text-emerald-500 text-lg">✓</span>
                <span>Direct talent-recruiter connection</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 6c. Your Path to Hired Section */}
        <section className="py-20 px-6 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
              Your Path to <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Hired</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Five simple steps to unlock and present your verified hiring potential.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.01)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative">
              <div className="w-10 h-10 rounded-full bg-[#4b61eb]/10 text-[#4b61eb] dark:text-[#9bb2ff] font-extrabold text-sm flex items-center justify-center mx-auto mb-4">1</div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Profile</h4>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">Create and import files</p>
            </div>
            {/* Step 2 */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.01)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative">
              <div className="w-10 h-10 rounded-full bg-[#4b61eb]/10 text-[#4b61eb] dark:text-[#9bb2ff] font-extrabold text-sm flex items-center justify-center mx-auto mb-4">2</div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Connect</h4>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">Sync GitHub & LinkedIn</p>
            </div>
            {/* Step 3 */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.01)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative">
              <div className="w-10 h-10 rounded-full bg-[#4b61eb]/10 text-[#4b61eb] dark:text-[#9bb2ff] font-extrabold text-sm flex items-center justify-center mx-auto mb-4">3</div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Score</h4>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">Get calculated rating</p>
            </div>
            {/* Step 4 */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.01)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative">
              <div className="w-10 h-10 rounded-full bg-[#4b61eb]/10 text-[#4b61eb] dark:text-[#9bb2ff] font-extrabold text-sm flex items-center justify-center mx-auto mb-4">4</div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Improve</h4>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">Follow personalized roadmap</p>
            </div>
            {/* Step 5 */}
            <div className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.01)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative">
              <div className="w-10 h-10 rounded-full bg-[#4b61eb]/10 text-[#4b61eb] dark:text-[#9bb2ff] font-extrabold text-sm flex items-center justify-center mx-auto mb-4">5</div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Placement</h4>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">Apply to matching roles</p>
            </div>
          </div>
        </section>

      </main>

      {/* 7. Footer / Bottom CTA */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-white/5 py-16 px-4 max-w-[1100px] mx-auto text-center">

        {/* Footer CTA Block */}
        <div className="bg-[#4b61eb]/5 dark:bg-[#4b61eb]/10 border border-[#4b61eb]/10 rounded-[24px] p-8 md:p-12 mb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-3 font-['Outfit']">
            Turn Your Skills Into <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Opportunities</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-8 max-w-lg mx-auto leading-relaxed">
            Join active candidates who have verified their skills. Start today.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-3.5 bg-[#4b61eb] hover:bg-[#3b51e6] text-white rounded-xl font-bold text-sm shadow-[0_8px_28px_rgba(75,97,235,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] tracking-wide"
          >
            Discover My Potential
          </button>
        </div>

        {/* Footer Navigation links */}
        <div className="flex justify-center gap-8 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-4 mt-12">
          <a href="#students-section" className="hover:text-slate-800 dark:hover:text-white transition-colors">Product</a>
          <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">Company</a>
          <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">Legal</a>
        </div>

        {/* Copyright */}
        <div className="text-slate-400 dark:text-slate-600 text-[10px] mt-6">
          Copyright © CareerIQ reserved.
        </div>
      </footer>

    </div>
  );
};

export default Home;
