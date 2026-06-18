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

export const Sidebar: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside style={{
      width: '260px',
      height: 'calc(100vh - 80px)',
      position: 'sticky',
      top: '80px',
      alignSelf: 'flex-start',
      zIndex: 20,
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      background: 'rgba(5, 8, 22, 0.4)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: '1rem', paddingLeft: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Navigation
      </div>
      
      {SECTIONS.map(section => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
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
          <section.icon size={18} />
          <span style={{ fontSize: '0.9rem' }}>{section.label}</span>
        </button>
      ))}
      
      {/* Profile Completion Widget */}
      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>Profile Setup</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>85%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '3px' }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
