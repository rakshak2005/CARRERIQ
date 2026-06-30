import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Target, 
  GitBranch, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  X,
  LayoutDashboard,
  Rocket,
  Award,
  TrendingUp,
  Map,
  Lightbulb
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

interface WelcomeTourModalProps {
  onClose: () => void;
  role: 'student' | 'recruiter';
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ onClose, role }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const studentSteps = [
    {
      title: "Welcome to CareerIQ!",
      subtitle: "Your AI-powered career growth copilot.",
      description: "Let's take a quick interactive tour to explore your dashboard features and see how to systematically boost your readiness score.",
      icon: Sparkles,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)",
      targetId: "" // Centered modal
    },
    {
      title: "Dashboard Overview",
      subtitle: "Welcome to your command center.",
      description: "This header shows your target career path and options to update profiles, export analytical reports, or trigger improvements.",
      icon: LayoutDashboard,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
      targetId: "dashboard-header"
    },
    {
      title: "Career Readiness Score",
      subtitle: "Your real-time employability index.",
      description: "Track your overall rating out of 100 alongside your skill footprint. We compare your code and resume to current industry standards.",
      icon: Target,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)",
      targetId: "readiness-score-card"
    },
    {
      title: "GitHub Analytics",
      subtitle: "Deep repository complexity audit.",
      description: "Here you can see parsed languages, code complexity scores, repo quality metrics, and details of your top repositories.",
      icon: GitBranch,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      targetId: "github"
    },
    {
      title: "Resume AI Analysis",
      subtitle: "ATS audit and NLP keywords.",
      description: "Review automated ATS evaluation scores, missing keyword suggestions, core strengths, and improvement suggestions.",
      icon: FileText,
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
      targetId: "resume"
    },
    {
      title: "Projects Portfolio",
      subtitle: "Verified portfolio complexity.",
      description: "Manage your portfolio projects. We scan project repositories to evaluate design patterns, code volume, and quality.",
      icon: Rocket,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      targetId: "projects"
    },
    {
      title: "Project Recommendation",
      subtitle: "Tailored career progression ideas.",
      description: "Explore AI-recommended projects customized to bridge technical concept gaps and boost your employability rating.",
      icon: Lightbulb,
      color: "#fb7185",
      gradient: "linear-gradient(135deg, #fb7185 0%, #fda4af 100%)",
      targetId: "project-recommendations"
    },
    {
      title: "Certifications",
      subtitle: "Showcase credentials.",
      description: "Link your verified certifications. Toggle whether to include them in your score calculation.",
      icon: Award,
      color: "#38bdf8",
      gradient: "linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%)",
      targetId: "certificates"
    },
    {
      title: "Career Match",
      subtitle: "Real-time hiring relevance.",
      description: "See how closely your technical credentials match active recruiter queries and role expectations.",
      icon: TrendingUp,
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
      targetId: "career-match"
    },
    {
      title: "AI Growth Roadmap",
      subtitle: "Tailored career progression path.",
      description: "Your personalized, step-by-step improvement roadmap. Complete these suggestions to boost your readiness score.",
      icon: Map,
      color: "#14b8a6",
      gradient: "linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)",
      targetId: "roadmap"
    }
  ];

  const recruiterSteps = [
    {
      title: "Welcome to CareerIQ Recruit!",
      subtitle: "Deep talent verification.",
      description: "Let's take a quick walk through the interface to see how you can evaluate candidates based on real-world engineering metrics.",
      icon: Sparkles,
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
      targetId: ""
    },
    {
      title: "Candidate Search & Filters",
      subtitle: "Pinpoint exact capabilities.",
      description: "Use full-text search, filter by target roles, set minimum readiness scores, or check for verified DSA experience.",
      icon: Target,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
      targetId: "candSearch"
    },
    {
      title: "Employability Scores",
      subtitle: "Objective readiness rankings.",
      description: "Candidate scores are computed directly from GitHub code quality, repo complexity, and parsed resume factors.",
      icon: GitBranch,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)",
      targetId: "minScore"
    },
    {
      title: "Detailed Candidate Audits",
      subtitle: "Deep-dive profiles.",
      description: "Explore the candidate lists below. Click on any candidate profile card to expand their technical capabilities, code repository reports, active resume evaluations, and verified credentials.",
      icon: Rocket,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      targetId: "candidate-list-section"
    },
    {
      title: "Secure Verification Pipeline",
      subtitle: "Verified recruiting.",
      description: "Evaluate candidates based on objective metrics. Direct integration with GitHub API, ATS keywords, and verified certifications guarantees authenticity.",
      icon: Award,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      targetId: ""
    }
  ];

  const steps = role === 'student' ? studentSteps : recruiterSteps;
  const step = steps[currentStep];
  const StepIcon = step.icon;

  // Update rect on step change, resize, or scroll
  useEffect(() => {
    let animationFrameId: number;

    const updateRect = () => {
      if (!step.targetId) {
        setTargetRect(null);
        return;
      }

      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        setTargetRect(null);
      }
    };

    // Scroll the target element into view (align top with offset for header)
    if (step.targetId) {
      const element = document.getElementById(step.targetId);
      if (element) {
        const yOffset = -110;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    // Continuously update position to track smooth scroll in real time at 60fps
    const start = Date.now();
    const track = () => {
      updateRect();
      if (Date.now() - start < 1000) {
        animationFrameId = requestAnimationFrame(track);
      }
    };
    track();

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStep, step.targetId]);

  const handleClose = () => {
    localStorage.setItem('careeriq_tour_completed', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Determine tooltip placement based on screen position
  const isCentered = !targetRect;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isCentered ? 'rgba(3, 7, 18, 0.85)' : 'transparent',
      backdropFilter: isCentered ? 'blur(16px)' : 'none',
      zIndex: 9999,
      pointerEvents: 'none',
      transition: 'all 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.05); opacity: 0.3; }
        }
        .tour-modal-floating {
          background: linear-gradient(145deg, #0a0e1a 0%, #03060b 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.15);
          border-radius: 20px;
          width: 90%;
          max-width: 460px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 10000;
          transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .glow-sphere-floating {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          filter: blur(60px);
          z-index: 0;
          pointer-events: none;
          animation: pulseGlow 4s infinite ease-in-out;
        }
        .spotlight-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 9998;
          transition: all 0.3s ease;
        }
        .tour-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .tour-dot.active {
          width: 20px;
          border-radius: 4px;
          background: #3b82f6;
        }
        .btn-tour {
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          border: none;
        }
        .btn-tour-next {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .btn-tour-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
          filter: brightness(1.1);
        }
        .btn-tour-prev {
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .btn-tour-prev:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        @media (max-width: 600px) {
          .tour-modal-floating {
            position: fixed !important;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 24px 24px 0 0 !important;
            padding: 1.5rem 1rem !important;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.95) !important;
            animation: slideUpMobile 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          }
          @keyframes slideUpMobile {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>

      {/* Spotlight highlight overlay */}
      {targetRect && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9997,
          boxSizing: 'border-box'
        }}>
          {/* Spotlight Highlight Ring */}
          <div style={{
            position: 'fixed',
            left: targetRect.left - 12,
            top: targetRect.top - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            borderRadius: '24px',
            border: `3px solid ${step.color}`,
            boxShadow: `0 0 0 9999px rgba(3, 7, 18, 0.75), 0 0 25px ${step.color}88`,
            pointerEvents: 'none',
            transition: 'all 0.1s ease',
            zIndex: 9998
          }} />
        </div>
      )}

      {/* Centered or Floating Tooltip container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        pointerEvents: 'none'
      }}>
        <div 
          ref={tooltipRef}
          className="tour-modal-floating"
          style={{
            pointerEvents: 'auto',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            // If highlighted, offset or float it relative to spotlight if needed, 
            // or simply float at a premium bottom-right position so it's always readable.
            // A bottom-right fixed/absolute card is extremely clean, readable, and never overlaps.
            ...(targetRect ? {
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              maxWidth: '380px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 255, 255, 0.05)'
            } : {})
          }}
        >
          {/* Background Glow */}
          <div className="glow-sphere-floating" style={{
            background: step.color,
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
          }} />

          {/* Close Button */}
          <button 
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={14} />
          </button>

          {/* Icon */}
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: step.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: `0 8px 20px -3px ${step.color}44`,
            marginBottom: '1.25rem',
            zIndex: 1,
            transition: 'all 0.3s ease'
          }}>
            {currentStep === 0 ? (
              <img src={logoImg} alt="CareerIQ Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            ) : (
              <StepIcon size={28} />
            )}
          </div>

          {/* Text Content */}
          <div style={{ zIndex: 1, minHeight: '120px', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {step.title}
            </h3>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: step.color, marginBottom: '0.75rem' }}>
              {step.subtitle}
            </h5>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 auto', maxWidth: '340px' }}>
              {step.description}
            </p>
          </div>

          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', zIndex: 1 }}>
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`tour-dot ${idx === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(idx)}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between', zIndex: 1 }}>
            {currentStep > 0 ? (
              <button className="btn-tour btn-tour-prev" onClick={handlePrev}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <button className="btn-tour btn-tour-prev" onClick={handleClose}>
                Skip
              </button>
            )}

            <button className="btn-tour btn-tour-next" onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started <CheckCircle2 size={16} />
                </>
              ) : (
                <>
                  Next <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
