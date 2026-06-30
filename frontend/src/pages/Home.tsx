import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import heroImg from '../assets/hero.png';
import { api } from '../services/api';
import { FileText, Code2, ShieldAlert, FolderGit2, CheckSquare, BrainCircuit, Compass, ArrowUpRight } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Tracking active header role indicator ('students' or 'recruiters')
  const [activeRole, setActiveRole] = useState<'students' | 'recruiters'>('students');

  // Stats state for dynamic count
  const [stats, setStats] = useState({ students: 0, recruiters: 0, admins: 0 });
  const [featuredCandidates, setFeaturedCandidates] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Review submission state
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('Software Engineer');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

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

    api.auth.getFeatured()
      .then(res => {
        setFeaturedCandidates(res || []);
      })
      .catch(err => {
        console.error('Error fetching featured candidates:', err);
      });

    api.auth.getReviews()
      .then(res => {
        setReviews(res || []);
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
      });
  }, []);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;
    setIsSubmittingReview(true);
    api.auth.submitReview({
      fullName: newReviewName,
      role: newReviewRole,
      comment: newReviewComment,
      rating: newReviewRating
    })
      .then(newReview => {
        setReviews(prev => [newReview, ...prev]);
        setNewReviewName('');
        setNewReviewComment('');
        setNewReviewRating(5);
        setReviewSubmitSuccess(true);
        setTimeout(() => setReviewSubmitSuccess(false), 5000);
      })
      .catch(err => {
        console.error('Error submitting review:', err);
      })
      .finally(() => {
        setIsSubmittingReview(false);
      });
  };

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
      @media (max-width: 768px) {
        .nav-role-toggle {
          display: none !important;
        }
        .nav-btn-discover {
          display: none !important;
        }
        header {
          padding: 0.5rem 0.75rem !important;
          width: 94% !important;
          top: 1rem !important;
        }
        .nav-btn-topper, .nav-btn-signin {
          padding: 0.4rem 0.75rem !important;
          font-size: 0.75rem !important;
        }
        #students-section {
          padding-top: 4.5rem !important;
          padding-bottom: 2rem !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 1.5rem !important;
          min-height: auto !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        .hero-title {
          font-size: 28px !important;
          line-height: 1.2 !important;
        }
        .hero-desc {
          font-size: 14px !important;
          margin-top: 0.75rem !important;
        }
        .hero-buttons {
          margin-top: 1rem !important;
          gap: 0.75rem !important;
        }
        .hero-buttons button {
          padding: 0.6rem 1.2rem !important;
          font-size: 13px !important;
        }
        .hero-img-container {
          max-height: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-top: 1rem !important;
          overflow: visible !important;
        }
        .hero-img-container img {
          max-height: none !important;
          width: 90% !important;
          height: auto !important;
          object-fit: contain !important;
        }
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
        <div className="nav-role-toggle flex items-center bg-[#f3f0ea] dark:bg-[#1e2025] rounded-full p-1 border border-slate-200/30 dark:border-white/5 shadow-inner">
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
            onClick={() => navigate('/leaderboard')}
            className={`nav-btn-topper text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ${theme === 'dark'
              ? 'border border-[#1c223c] hover:bg-[#1c223c]/40 text-[#fbbf24]'
              : 'text-amber-600 hover:text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Topper Lists
          </button>

          <button
            onClick={() => navigate('/login')}
            className={`nav-btn-signin text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ${theme === 'dark'
              ? 'border border-[#1c223c] hover:bg-[#1c223c]/40 text-white'
              : 'text-slate-600 hover:text-slate-900 border border-slate-300/60 hover:bg-slate-50'
              }`}
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/register')}
            className="nav-btn-discover bg-[#4b61eb] hover:bg-[#3b51e6] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 shadow-md shadow-[#4b61eb]/25 hover:scale-[1.02] active:scale-95"
          >
            Discover My Potential
          </button>
        </div>
      </header>

      <main className="relative z-10">

        {/* 3. Hero Section (Centered Two-Column Layout) */}
        <section id="students-section" className="pt-28 pb-16 px-6 md:px-12 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-100px)] relative z-10 overflow-visible">
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

        {/* 3c. Comparison Section (Replaced by Real-time Candidate Profiles) */}
        <section className="py-20 px-6 max-w-[1100px] mx-auto border-t border-slate-200/50 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
              Real-time <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Talent Registry</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Actual candidate credentials, portfolio scores, and engineering metrics queried dynamically from our MongoDB evaluation pool.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCandidates.length === 0 ? (
              // Fallback loading/empty state cards
              [1, 2, 3].map((num) => (
                <div key={num} className="bg-white/40 dark:bg-[#121526]/40 border border-slate-200/20 dark:border-[#1c223c]/40 rounded-[24px] p-6 backdrop-blur-sm animate-pulse flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-2/3" />
                      <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-1 bg-slate-300 dark:bg-slate-700 rounded w-full my-2" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-5/6" />
                  </div>
                </div>
              ))
            ) : (
              featuredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4b61eb] to-[#9bb2ff]" />

                  <div>
                    {/* Header info */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4b61eb]/15 text-[#4b61eb] dark:text-[#9bb2ff] font-extrabold text-sm flex items-center justify-center">
                          {candidate.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{candidate.fullName}</h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{candidate.githubUsername ? `@${candidate.githubUsername}` : 'Local Candidate'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-extrabold text-[#4b61eb] dark:text-[#9bb2ff] bg-[#4b61eb]/10 px-2 py-0.5 rounded-md">
                          {candidate.overallScore}%
                        </span>
                        <span className="text-[8px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">Readiness</span>
                      </div>
                    </div>

                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Targeting: <span className="text-slate-800 dark:text-slate-200">{candidate.targetRole}</span>
                    </div>

                    {/* Breakdown Scores */}
                    <div className="space-y-2 border-t border-b border-slate-200/30 dark:border-white/5 py-3.5 my-3.5">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>GitHub Score</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{candidate.githubScore || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${candidate.githubScore || 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Resume Score</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{candidate.resumeScore || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-500"
                            style={{ width: `${candidate.resumeScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {candidate.techStacks && candidate.techStacks.length > 0 ? (
                        candidate.techStacks.slice(0, 4).map((tech: string, i: number) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-50 dark:bg-[#1a1f36]/40 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-white/5 rounded-md font-semibold">
                            {tech}
                          </span>
                        ))
                      ) : (
                        ['React', 'Node.js', 'TypeScript', 'CSS'].map((tech: string, i: number) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-50 dark:bg-[#1a1f36]/40 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-white/5 rounded-md font-semibold">
                            {tech}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              ))
            )}
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
            <div className="group bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:border-[#4b61eb]/40 hover:shadow-[0_20px_40px_rgba(75,97,235,0.08)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#4b61eb]/5 rounded-full blur-2xl group-hover:bg-[#4b61eb]/15 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1c223c]/60 flex items-center justify-center mb-6 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <FileText className="w-7 h-7 text-[#4b61eb] dark:text-[#9bb2ff]" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-2 group-hover:text-[#4b61eb] dark:group-hover:text-[#9bb2ff] transition-colors">Automated Analysis</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Parse resume content and evaluate skills in seconds.
              </p>
            </div>

            {/* GitHub Evaluation */}
            <div className="group bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1c223c]/60 flex items-center justify-center mb-6 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Code2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">GitHub Evaluation</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Connect your GitHub to calculate real-world coding impact.
              </p>
            </div>

            {/* LinkedIn Verification */}
            <div className="group bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1c223c]/60 flex items-center justify-center mb-6 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <ShieldAlert className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">LinkedIn Verification</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Verify employment and academic history.
              </p>
            </div>

            {/* Project Assessment */}
            <div className="group bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1c223c]/60 flex items-center justify-center mb-6 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <FolderGit2 className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">Project Assessment</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Real-time code quality and architectural design reviews.
              </p>
            </div>

            {/* Cert Verification */}
            <div className="group bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-[0_20px_40px_rgba(139,92,246,0.08)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1c223c]/60 flex items-center justify-center mb-6 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <CheckSquare className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">Cert Verification</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Validate credential links in real time.
              </p>
            </div>

            {/* DSA Evaluation */}
            <div className="group bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:border-[#3b4cb8]/40 hover:shadow-[0_20px_40px_rgba(59,76,184,0.08)] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#3b4cb8]/5 rounded-full blur-2xl group-hover:bg-[#3b4cb8]/15 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1c223c]/60 flex items-center justify-center mb-6 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <BrainCircuit className="w-7 h-7 text-[#4b61eb] dark:text-[#3b4cb8]" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-2 group-hover:text-[#3b4cb8] dark:group-hover:text-[#9bb2ff] transition-colors">DSA Evaluation</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Test your algorithmic logic through mock challenges.
              </p>
            </div>
          </div>

          {/* Personalized Roadmaps */}
          <div className="mt-12 bg-gradient-to-r from-[#4b61eb]/5 to-[#8b5cf6]/5 dark:from-[#4b61eb]/10 dark:to-[#8b5cf6]/10 border border-[#4b61eb]/15 rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative overflow-hidden group hover:border-[#4b61eb]/30 transition-all duration-500">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#4b61eb] to-[#8b5cf6]" />
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#4b61eb]/10 dark:bg-[#4b61eb]/25 flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110">
                <Compass className="w-7 h-7 text-[#4b61eb]" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-lg mb-1">Personalized Career Roadmaps</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
                  Get a step-by-step custom training and project plan tailored to target role requirements and skill gaps.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-[#4b61eb] hover:bg-[#3b51e6] text-white text-xs font-extrabold rounded-xl shadow-[0_6px_20px_rgba(75,97,235,0.2)] transition-all duration-300 hover:scale-[1.03] active:scale-95 whitespace-nowrap"
            >
              Generate My Roadmap
            </button>
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
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory px-4 -mx-4"
          >
            {reviews.length === 0 ? (
              // Fallback cards with Indian names and no AI images (initials instead)
              [
                { fullName: 'Aarav Patel', role: 'Software Engineer', comment: 'CareerIQ allowed me to skip the entry-level resume screening completely. My verified profile got me interviews at top startups in Bangalore within a week.', rating: 5 },
                { fullName: 'Priya Sharma', role: 'Technical Recruiter', comment: 'We saved dozens of sourcing hours by filtering for verified candidate portfolios. It cuts out the noise completely.', rating: 5 },
                { fullName: 'Rohan Gupta', role: 'Frontend Developer', comment: 'The personalized learning path helped me focus on what counted. Within 3 weeks I had my first engineering job in Mumbai.', rating: 4 }
              ].map((item, idx) => (
                <div key={idx} className="min-w-[280px] md:min-w-[350px] max-w-[370px] bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between snap-start transition-transform duration-300 hover:scale-[1.01]">
                  <div>
                    <div className="flex gap-1 mb-4 text-amber-500">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm italic leading-relaxed mb-6">
                      "{item.comment}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center">
                      {item.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm">{item.fullName}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              reviews.map((item) => (
                <div key={item.id} className="min-w-[280px] md:min-w-[350px] max-w-[370px] bg-white dark:bg-[#121526] border border-slate-200/40 dark:border-[#1c223c]/85 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col justify-between snap-start transition-transform duration-300 hover:scale-[1.01]">
                  <div>
                    <div className="flex gap-1 mb-4 text-amber-500">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm italic leading-relaxed mb-6">
                      "{item.comment}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
                      {item.full_name ? item.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UI'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm">{item.full_name || 'Anonymous User'}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Section */}
          <div className="mt-16 bg-white/40 dark:bg-[#121526]/40 border border-slate-200/30 dark:border-[#1c223c]/60 rounded-3xl p-8 backdrop-blur-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 text-center">
              Share Your <span className="text-[#4b61eb] dark:text-[#9bb2ff]">Experience</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6">
              Let the community know how CareerIQ has helped you verify skills and find opportunities.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="e.g. Aarav Patel"
                    className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-[#4b61eb]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role/Title</label>
                  <select
                    value={newReviewRole}
                    onChange={(e) => setNewReviewRole(e.target.value)}
                    className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-[#4b61eb]/50"
                  >
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Technical Recruiter">Technical Recruiter</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Student / Candidate">Student / Candidate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`text-xl transition-all ${newReviewRating >= star ? 'scale-110 grayscale-0' : 'scale-95 grayscale opacity-40'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Tell us what you liked, how your profile rating helped you, etc..."
                  className="w-full bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-[#4b61eb]/50 resize-none"
                />
              </div>

              {reviewSubmitSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs py-2 px-4 rounded-xl text-center font-semibold animate-pulse">
                  ✓ Review submitted successfully! Thank you for your feedback.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-[#4b61eb] hover:bg-[#3b51e6] disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all active:scale-[0.98]"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
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
            <button
              onClick={() => navigate('/leaderboard')}
              className="mt-6 px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-extrabold rounded-xl shadow-[0_6px_20px_rgba(16,185,129,0.2)] transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center gap-2"
            >
              🏆 View Live Topper Lists <ArrowUpRight size={14} />
            </button>
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
