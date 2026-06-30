import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  GitBranch,
  FileText,
  Rocket,
  Lightbulb,
  Award,
  TrendingUp,
  Map
} from 'lucide-react';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'readiness', label: 'Readiness Score', icon: Target },
  { id: 'github', label: 'GitHub Analysis', icon: GitBranch },
  { id: 'resume', label: 'Resume Analysis', icon: FileText },
  { id: 'projects', label: 'Projects', icon: Rocket },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'career-match', label: 'Career Match', icon: TrendingUp },
  { id: 'roadmap', label: 'AI Roadmap', icon: Map },
];

interface SidebarProps {
  onReplayTour?: () => void;
  projectCount?: number;
  certificateCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onReplayTour, projectCount = 3, certificateCount = 0 }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const targetId = (id === 'recommendations') ? 'project-recommendations' : id;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const projectsProgress = Math.min(5, projectCount) / 5;
  const certsProgress = Math.min(3, certificateCount) / 3;
  const completionPercentage = Math.round(
    25 + // Resume (completed)
    25 + // GitHub (completed)
    (projectsProgress * 25) +
    (certsProgress * 25)
  );

  return (
    <aside 
      className="sidebar-scrollable"
      style={{
        width: '260px',
        height: 'calc(100vh - 110px)',
        position: 'sticky',
        top: '90px',
        alignSelf: 'flex-start',
        zIndex: 20,
        padding: '0.85rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.15rem',
        background: 'rgba(5, 8, 22, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        overflowY: 'auto',
        marginLeft: '0.75rem',
        marginTop: '10px',
        marginBottom: '10px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
      }}
    >
      <style>{`
        .sidebar-scrollable::-webkit-scrollbar {
          display: none;
        }
        .sidebar-scrollable {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 900px) {
          aside.sidebar-scrollable {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ marginBottom: '0.4rem', paddingLeft: '0.85rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Navigation
      </div>

      {SECTIONS.map(section => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.45rem 0.85rem',
            background: activeSection === section.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: activeSection === section.id ? '#3b82f6' : '#94a3b8',
            fontWeight: activeSection === section.id ? 600 : 500,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== section.id) {
              e.currentTarget.style.color = '#e2e8f0';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== section.id) {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {activeSection === section.id && (
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '4px', height: '60%', background: '#3b82f6', borderRadius: '0 4px 4px 0' }} />
          )}
          <section.icon size={16} />
          <span style={{ fontSize: '0.85rem' }}>{section.label}</span>
        </button>
      ))}

      {/* Profile Completion Widget */}
      <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            Profile Completion
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {[
              { label: 'Resume', status: '✓', color: '#10b981' },
              { label: 'GitHub', status: '✓', color: '#10b981' },
              { label: 'Projects', status: projectCount >= 5 ? '✓' : `${projectCount}/5`, color: projectCount >= 5 ? '#10b981' : '#3b82f6' },
              { label: 'Certificates', status: certificateCount >= 3 ? '✓' : `${certificateCount}/3`, color: certificateCount >= 3 ? '#10b981' : '#64748b' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#94a3b8' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: item.color }}>{item.status}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>{completionPercentage}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.6rem' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '3px' }}></div>
          </div>
          {onReplayTour && (
            <button
              onClick={onReplayTour}
              style={{
                width: '100%',
                padding: '0.45rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px dashed rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
            >
              Replay Guide Tour 🎯
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
