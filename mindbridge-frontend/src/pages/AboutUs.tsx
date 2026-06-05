// MindBridge — About Us Page
// Displays team members, roles and project info

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, ArrowLeft, Brain, Shield, Code2, Server } from 'lucide-react';
import BrainBridgeLogo from '@/components/BrainBridgeLogo';
import BottomNav from '@/components/BottomNav';

const TEAM_MEMBERS = [
  {
    name: 'EBODE ADA ERIKA ALEXANDRA',
    id: 'ICTU20233909',
    role: 'Team Leader / Scrum Master',
    icon: Shield,
    color: '#00C9A7',
    bg: 'rgba(0,201,167,0.12)',
    owns: ['Sprint planning & Trello board', 'Project documentation & README', 'User manual & final report'],
  },
  {
    name: 'AJA CHELLA ASAMBA JR',
    id: 'ICTU20233787',
    role: 'DevOps Lead',
    icon: Server,
    color: '#7B61FF',
    bg: 'rgba(123,97,255,0.12)',
    owns: ['AWS EC2 deployment & Ansible automation', 'Docker Compose & container orchestration', 'Prometheus + Grafana monitoring'],
  },
];

const TECH_STACK = [
  { label: 'Backend', value: 'FastAPI · Python · PostgreSQL' },
  { label: 'Frontend', value: 'React · TypeScript · Tailwind CSS' },
  { label: 'DevOps', value: 'Docker · Ansible · AWS EC2' },
  { label: 'Monitoring', value: 'Prometheus · Grafana' },
  { label: 'AI', value: 'Groq (Llama 3.3-70b)' },
  { label: 'Course', value: 'SEN3244 — Software Architecture' },
];

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ backgroundColor: '#0D0F14' }}
    >
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(123,97,255,0.07) 0%, transparent 70%)' }}
      />

      <div className="flex-1 overflow-y-auto pb-24 md:pb-10 px-5 md:px-8">
        <div className="max-w-2xl mx-auto w-full">

          {/* Header */}
          <div className="flex items-center gap-3 pt-12 md:pt-8 pb-6">
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #30363D',
                borderRadius: 10,
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft style={{ width: 18, height: 18, color: '#8B949E' }} />
            </button>
            <div>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: '#F0F2F5' }}>
                About Us
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E' }}>
                The team behind MindBridge
              </p>
            </div>
          </div>

          {/* Project hero card */}
          <div
            className="rounded-[24px] p-6 mb-6 flex flex-col items-center text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,201,167,0.08) 0%, rgba(123,97,255,0.08) 100%)',
              border: '1px solid rgba(123,97,255,0.2)',
            }}
          >
            <div style={{ filter: 'drop-shadow(0 0 16px rgba(0,201,167,0.5))' }}>
              <BrainBridgeLogo size={52} />
            </div>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 800,
                fontSize: '26px',
                color: '#F0F2F5',
                marginTop: 14,
                marginBottom: 6,
                background: 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MindBridge
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', lineHeight: 1.7, maxWidth: 400 }}>
              A privacy-first student mental health platform providing anonymous mood tracking,
              private journaling, peer support forums, crisis flagging, and an AI wellness companion.
            </p>
            <div
              className="mt-4 px-4 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.2)' }}
            >
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#00C9A7', fontWeight: 600 }}>
                SEN3244 — Software Architecture · ICT University of Cameroon · Spring 2026
              </span>
            </div>
          </div>

          {/* Team section */}
          <h3
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F0F2F5', marginBottom: 14 }}
          >
            Meet the Team
          </h3>

          <div className="flex flex-col gap-4 mb-8">
            {TEAM_MEMBERS.map((member) => {
              const Icon = member.icon;
              const initials = member.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('');
              return (
                <div
                  key={member.id}
                  className="rounded-[20px] p-5"
                  style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        backgroundColor: member.bg,
                        border: `2px solid ${member.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 700,
                        fontSize: '16px',
                        color: member.color,
                      }}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: '#F0F2F5', marginBottom: 2 }}>
                        {member.name}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: member.bg }}
                        >
                          <Icon style={{ width: 12, height: 12, color: member.color }} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: member.color, fontWeight: 600 }}>
                            {member.role}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8B949E' }}>
                          {member.id}
                        </span>
                      </div>

                      {/* Responsibilities */}
                      <ul className="flex flex-col gap-1">
                        {member.owns.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span style={{ color: member.color, fontSize: '12px', marginTop: 2, flexShrink: 0 }}>▸</span>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', lineHeight: 1.5 }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tech Stack */}
          <h3
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#F0F2F5', marginBottom: 14 }}
          >
            Technology Stack
          </h3>
          <div
            className="rounded-[20px] p-5 mb-6"
            style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
          >
            <div className="flex flex-col gap-3">
              {TECH_STACK.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#8B949E', fontWeight: 500 }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#F0F2F5', fontWeight: 500 }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          <div
            className="rounded-[20px] p-4 mb-6 flex items-center gap-4"
            style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,179,71,0.1)',
                border: '2px solid rgba(255,179,71,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Brain style={{ width: 20, height: 20, color: '#FFB347' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E', marginBottom: 2 }}>
                Course Instructor
              </p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px', color: '#F0F2F5' }}>
                Engr. TEKOH PALMA
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8B949E' }}>
                ICT University of Cameroon
              </p>
            </div>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              height: 48,
              borderRadius: 50,
              backgroundColor: '#161B22',
              border: '1px solid #30363D',
              color: '#F0F2F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'border-color 0.2s',
              marginBottom: 24,
            }}
          >
            <Github style={{ width: 18, height: 18 }} />
            View on GitHub
          </a>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
