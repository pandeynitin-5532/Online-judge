import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS — ZERO COMPROMISE EDITION
   ═══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;overflow:hidden;}

:root{
  /* Core palette — ink black with electric accents */
  --void:    #02040a;
  --deep:    #060810;
  --surface: #0a0d16;
  --raised:  #0f1220;
  --lift:    #151a2e;
  --border:  rgba(255,255,255,0.045);
  --border2: rgba(255,255,255,0.08);
  --border3: rgba(255,255,255,0.13);

  --text-1: #f0f2fa;
  --text-2: #8892b0;
  --text-3: #3d4a6e;
  --text-4: #252e48;

  /* Electric accent — cyan-electric */
  --elec:   #00e5ff;
  --elec2:  #00b8d4;
  --edim:   rgba(0,229,255,0.08);
  --eglow:  rgba(0,229,255,0.22);
  --eflare: rgba(0,229,255,0.5);

  /* Violet */
  --viol:   #b06fff;
  --vdim:   rgba(176,111,255,0.09);
  --vglow:  rgba(176,111,255,0.25);

  /* Green */
  --mint:   #00ffa3;
  --mdim:   rgba(0,255,163,0.08);
  --mglow:  rgba(0,255,163,0.2);

  /* Amber */
  --gold:   #ffb700;
  --gdim:   rgba(255,183,0,0.08);

  /* Red */
  --crit:   #ff4d6d;
  --rdim:   rgba(255,77,109,0.08);

  --r-xs:4px;--r-sm:7px;--r-md:11px;--r-lg:16px;--r-xl:22px;--r-2xl:28px;

  /* Scanline grid */
  --grid: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 24px,
    rgba(255,255,255,0.012) 24px,
    rgba(255,255,255,0.012) 25px
  ),
  repeating-linear-gradient(
    90deg,
    transparent,
    transparent 24px,
    rgba(255,255,255,0.012) 24px,
    rgba(255,255,255,0.012) 25px
  );
}

/* ── Scrollbar ─────────────────────────────────────────────── */
.sc::-webkit-scrollbar{width:2px;}
.sc::-webkit-scrollbar-track{background:transparent;}
.sc::-webkit-scrollbar-thumb{background:rgba(0,229,255,.2);border-radius:2px;}

/* ── Keyframes ─────────────────────────────────────────────── */
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulseRing{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.35);opacity:0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes glitch1{0%,100%{clip-path:inset(0 0 95% 0)}20%{clip-path:inset(10% 0 80% 0)}40%{clip-path:inset(40% 0 50% 0)}60%{clip-path:inset(60% 0 30% 0)}80%{clip-path:inset(80% 0 5% 0)}}
@keyframes glitch2{0%,100%{clip-path:inset(60% 0 10% 0);transform:translateX(-2px)}25%{clip-path:inset(30% 0 40% 0);transform:translateX(2px)}50%{clip-path:inset(0 0 80% 0);transform:translateX(-1px)}75%{clip-path:inset(80% 0 5% 0);transform:translateX(1px)}}
@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes flicker{0%,100%{opacity:1}8%{opacity:.92}42%{opacity:0.98}58%{opacity:.95}82%{opacity:1}}
@keyframes verdictIn{0%{transform:scale(.7) translateX(20px);opacity:0}60%{transform:scale(1.06) translateX(-2px)}100%{transform:scale(1) translateX(0);opacity:1}}
@keyframes borderFlow{0%{border-image-slice:1;background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes dataStream{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-100%);opacity:0}}
@keyframes haloExpand{0%{transform:scale(.6);opacity:.8}100%{transform:scale(2.5);opacity:0}}
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes typewriter{from{width:0}to{width:100%}}
@keyframes subtlePulse{0%,100%{opacity:0.6}50%{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-4px)}}

/* ── Utility ────────────────────────────────────────────────── */
.fu{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both}
.fi{animation:fadeIn .3s ease both}
.sr{animation:slideRight .35s cubic-bezier(.22,1,.36,1) both}
.sk{border-radius:4px;background:linear-gradient(90deg,var(--raised) 25%,var(--lift) 50%,var(--raised) 75%);background-size:600px 100%;animation:shimmer 1.6s ease-in-out infinite;}

body{
  font-family:'Space Grotesk',sans-serif;
  color:var(--text-1);
  background:var(--void);
  cursor:crosshair;
}
.mono{font-family:'JetBrains Mono',monospace;}
.syne{font-family:'Syne',sans-serif;}

/* ── Custom cursor dot ──────────────────────────────────────── */
body::after{
  content:'';
  position:fixed;
  width:6px;height:6px;
  background:var(--elec);
  border-radius:50%;
  pointer-events:none;
  z-index:99999;
  mix-blend-mode:screen;
  box-shadow:0 0 10px var(--elec),0 0 20px var(--eflare);
  transition:transform .1s ease;
}

/* ── Scanline overlay ───────────────────────────────────────── */
.scanline-overlay{
  position:fixed;inset:0;z-index:9999;pointer-events:none;
  background:repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0) 0px,
    rgba(0,0,0,0) 2px,
    rgba(0,0,0,0.04) 2px,
    rgba(0,0,0,0.04) 4px
  );
  mix-blend-mode:multiply;
}
.scan-beam{
  position:fixed;left:0;right:0;height:120px;
  background:linear-gradient(to bottom,transparent,rgba(0,229,255,.015),transparent);
  animation:scanline 8s linear infinite;
  pointer-events:none;z-index:9998;
}

/* ── Grid bg ────────────────────────────────────────────────── */
.grid-bg{
  position:fixed;inset:0;z-index:0;
  background:var(--grid);
  pointer-events:none;
  opacity:1;
}

/* ── Noise texture ──────────────────────────────────────────── */
.noise{
  position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size:128px 128px;
}

/* ── Corner bracket decoration ──────────────────────────────── */
.bracket{
  position:absolute;
  width:14px;height:14px;
  border-color:var(--elec);
  border-style:solid;
  opacity:.45;
}
.bracket-tl{top:8px;left:8px;border-width:1.5px 0 0 1.5px;}
.bracket-tr{top:8px;right:8px;border-width:1.5px 1.5px 0 0;}
.bracket-bl{bottom:8px;left:8px;border-width:0 0 1.5px 1.5px;}
.bracket-br{bottom:8px;right:8px;border-width:0 1.5px 1.5px 0;}

/* ── Panel ──────────────────────────────────────────────────── */
.panel{
  background:rgba(6,8,16,.92);
  border:1px solid var(--border2);
  border-radius:var(--r-xl);
  overflow:hidden;
  backdrop-filter:blur(24px) saturate(1.2);
  position:relative;
  box-shadow:
    0 0 0 1px rgba(0,229,255,.04),
    0 32px 80px rgba(0,0,0,.8),
    inset 0 1px 0 rgba(255,255,255,.04);
}
.panel::before{
  content:'';
  position:absolute;
  inset:0;
  border-radius:inherit;
  background:linear-gradient(135deg,rgba(0,229,255,.02) 0%,transparent 50%,rgba(176,111,255,.02) 100%);
  pointer-events:none;
  z-index:0;
}

/* ── Panel header line ──────────────────────────────────────── */
.panel-header-line{
  position:absolute;
  top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg,transparent,var(--elec),transparent);
  opacity:.25;
}

/* ── Tab nav ────────────────────────────────────────────────── */
.tab-nav{
  display:flex;
  align-items:center;
  gap:2px;
  background:var(--deep);
  padding:4px;
  border-radius:var(--r-md);
  border:1px solid var(--border);
}
.tab-btn{
  font-family:'Space Grotesk',sans-serif;
  font-size:12px;font-weight:600;
  letter-spacing:.04em;
  padding:7px 16px;
  border-radius:var(--r-sm);
  cursor:pointer;border:none;
  background:transparent;
  color:var(--text-3);
  transition:all .2s cubic-bezier(.22,1,.36,1);
  position:relative;
  text-transform:uppercase;
}
.tab-btn:hover{color:var(--text-2);background:var(--raised);}
.tab-btn.on{
  color:var(--elec);
  background:var(--raised);
  border:1px solid rgba(0,229,255,.18);
  box-shadow:0 0 18px rgba(0,229,255,.08),inset 0 0 8px rgba(0,229,255,.04);
}
.tab-btn.on::after{
  content:'';
  position:absolute;
  bottom:-1px;left:50%;transform:translateX(-50%);
  width:50%;height:1px;
  background:var(--elec);
  box-shadow:0 0 8px var(--elec);
}

/* ── Count badge ────────────────────────────────────────────── */
.count-badge{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:16px;height:16px;
  background:var(--edim);
  border:1px solid rgba(0,229,255,.25);
  color:var(--elec);
  font-size:9px;font-weight:700;
  border-radius:999px;
  padding:0 5px;
  margin-left:5px;
}

/* ── Difficulty badges ──────────────────────────────────────── */
.diff-badge{
  font-family:'JetBrains Mono',monospace;
  font-size:9px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
  padding:3px 10px;border-radius:3px;
  position:relative;overflow:hidden;
}
.diff-badge::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.05) 50%,transparent 100%);
  background-size:200% 100%;
  animation:shimmer 2s infinite;
}
.diff-easy  {background:var(--mdim);color:var(--mint);border-left:2px solid var(--mint);}
.diff-medium{background:var(--gdim);color:var(--gold);border-left:2px solid var(--gold);}
.diff-hard  {background:var(--rdim);color:var(--crit);border-left:2px solid var(--crit);}

/* ── Tag pill ────────────────────────────────────────────────── */
.tag-pill{
  font-family:'JetBrains Mono',monospace;
  font-size:9px;font-weight:600;
  padding:3px 9px;border-radius:2px;
  background:var(--edim);
  border:1px solid rgba(0,229,255,.14);
  color:rgba(0,229,255,.7);
  letter-spacing:.06em;
  text-transform:uppercase;
}

/* ── IO block ────────────────────────────────────────────────── */
.io-block{
  border-radius:var(--r-md);
  border:1px solid var(--border2);
  overflow:hidden;
  position:relative;
}
.io-block::before{
  content:'';
  position:absolute;left:0;top:0;bottom:0;
  width:2px;
}
.io-block.inp::before{background:var(--elec);box-shadow:0 0 8px var(--elec);}
.io-block.out::before{background:var(--mint);box-shadow:0 0 8px var(--mint);}
.io-head{
  padding:8px 14px 8px 16px;
  background:rgba(255,255,255,.02);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:8px;
}
.io-label{
  font-family:'JetBrains Mono',monospace;
  font-size:9px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;
}

/* ── Constraint box ──────────────────────────────────────────── */
.constraint-box{
  background:var(--vdim);
  border:1px solid rgba(176,111,255,.15);
  border-left:2px solid var(--viol);
  border-radius:var(--r-md);
  padding:14px 16px;
  position:relative;
  overflow:hidden;
}
.constraint-box::before{
  content:'';
  position:absolute;top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg,var(--viol),transparent);
  opacity:.4;
}

/* ── Submission row ──────────────────────────────────────────── */
.sub-row{
  background:rgba(10,13,22,.6);
  border:1px solid var(--border);
  border-radius:var(--r-md);
  padding:12px 14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  position:relative;
  overflow:hidden;
  cursor:default;
  transition:border-color .2s, background .2s, transform .2s;
}
.sub-row::before{
  content:'';
  position:absolute;left:0;top:0;bottom:0;
  width:2px;
  border-radius:2px;
  transition:box-shadow .3s;
}
.sub-row:hover{
  background:rgba(15,18,32,.9);
  border-color:var(--border2);
  transform:translateX(2px);
}
.sub-row.ac::before{background:var(--mint);box-shadow:0 0 10px var(--mint);}
.sub-row.wa::before{background:var(--crit);box-shadow:0 0 10px var(--crit);}
.sub-row.tle::before{background:var(--gold);box-shadow:0 0 10px var(--gold);}
.sub-row.jdg::before{background:var(--elec);box-shadow:0 0 10px var(--elec);}

/* ── Buttons ──────────────────────────────────────────────────── */
.btn{
  font-family:'Space Grotesk',sans-serif;
  font-size:12px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;
  padding:8px 18px;
  border-radius:var(--r-sm);
  cursor:pointer;border:none;
  transition:all .2s cubic-bezier(.22,1,.36,1);
  display:inline-flex;align-items:center;gap:7px;
  white-space:nowrap;user-select:none;
  position:relative;overflow:hidden;
}
.btn:disabled{opacity:.25;cursor:not-allowed;pointer-events:none;}
.btn:active:not(:disabled){transform:scale(.96);}
.btn::after{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(to bottom,rgba(255,255,255,.06),transparent);
  pointer-events:none;
}

.b-ghost{
  background:transparent;
  color:var(--text-2);
  border:1px solid var(--border2);
}
.b-ghost:hover:not(:disabled){
  background:var(--raised);
  color:var(--text-1);
  border-color:var(--border3);
  box-shadow:0 0 12px rgba(255,255,255,.04);
}

.b-back{
  background:transparent;
  color:var(--text-3);
  border:1px solid var(--border);
  font-size:11px;
  padding:6px 12px;
}
.b-back:hover:not(:disabled){
  background:var(--raised);
  color:var(--elec);
  border-color:rgba(0,229,255,.25);
}

.b-run{
  background:var(--raised);
  color:var(--text-1);
  border:1px solid var(--border2);
  padding:9px 22px;
}
.b-run:hover:not(:disabled){
  background:var(--lift);
  border-color:rgba(0,229,255,.25);
  color:var(--elec);
  box-shadow:0 0 20px rgba(0,229,255,.1);
}

.b-submit{
  background:linear-gradient(135deg, rgba(0,229,255,.15) 0%, rgba(176,111,255,.15) 100%);
  color:var(--elec);
  border:1px solid rgba(0,229,255,.35);
  padding:9px 26px;
  box-shadow:0 0 24px rgba(0,229,255,.12),inset 0 1px 0 rgba(0,229,255,.1);
}
.b-submit:hover:not(:disabled){
  background:linear-gradient(135deg, rgba(0,229,255,.25) 0%, rgba(176,111,255,.2) 100%);
  border-color:rgba(0,229,255,.55);
  box-shadow:0 0 36px rgba(0,229,255,.22),0 0 60px rgba(0,229,255,.08),inset 0 1px 0 rgba(0,229,255,.15);
  transform:translateY(-1px);
}

/* ── Stdin textarea ───────────────────────────────────────────── */
.stdin-area{
  background:var(--deep);
  border:1px solid var(--border);
  border-radius:var(--r-sm);
  color:var(--text-1);
  font-family:'JetBrains Mono',monospace;
  font-size:11.5px;line-height:1.7;
  padding:10px 12px;
  resize:none;width:100%;outline:none;
  transition:border-color .2s, box-shadow .2s;
}
.stdin-area:focus{
  border-color:rgba(0,229,255,.3);
  box-shadow:0 0 0 2px rgba(0,229,255,.06), inset 0 0 20px rgba(0,229,255,.03);
}
.stdin-area::placeholder{color:var(--text-4);}

/* ── Language select ──────────────────────────────────────────── */
.lang-sel{
  font-family:'JetBrains Mono',monospace;
  font-size:11px;font-weight:600;
  letter-spacing:.05em;
  padding:7px 30px 7px 12px;
  background:var(--raised);
  color:var(--text-1);
  border:1px solid var(--border2);
  border-radius:var(--r-sm);
  cursor:pointer;outline:none;appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23606880' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 10px center;
  transition:border-color .2s, box-shadow .2s;
}
.lang-sel:hover,.lang-sel:focus{
  border-color:rgba(0,229,255,.25);
  box-shadow:0 0 12px rgba(0,229,255,.07);
}
.lang-sel option{background:#0a0d16;}

/* ── Verdict chip ──────────────────────────────────────────────── */
.v-chip{
  display:flex;align-items:center;gap:9px;
  padding:7px 16px;
  border-radius:var(--r-sm);
  font-family:'JetBrains Mono',monospace;
  font-size:11px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;
  border:1px solid;
  animation:verdictIn .45s cubic-bezier(.34,1.56,.64,1) both;
  position:relative;overflow:hidden;
}
.v-chip::before{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 50%,transparent 100%);
  background-size:200%;
  animation:shimmer 1.5s infinite;
}

/* ── Console panel ────────────────────────────────────────────── */
.console-panel{
  position:absolute;left:10px;right:10px;bottom:64px;
  background:rgba(4,6,14,.97);
  backdrop-filter:blur(28px);
  border-radius:var(--r-lg);
  overflow:hidden;
  transition:height .35s cubic-bezier(.4,0,.2,1), opacity .35s, box-shadow .35s;
  display:flex;flex-direction:column;
  z-index:10;
}
.console-panel.open{
  box-shadow:0 -16px 60px rgba(0,0,0,.7),0 0 0 1px rgba(0,229,255,.08);
}

/* ── Line number counter ──────────────────────────────────────── */
.line-count{
  font-family:'JetBrains Mono',monospace;
  font-size:10px;
  color:var(--text-3);
  letter-spacing:.03em;
  display:flex;align-items:center;gap:4px;
}
.line-count span{color:var(--text-4);}

/* ── File tab ─────────────────────────────────────────────────── */
.file-tab{
  display:flex;align-items:center;gap:8px;
  background:var(--raised);
  border-radius:var(--r-sm) var(--r-sm) 0 0;
  border:1px solid var(--border2);
  border-bottom:1px solid var(--raised);
  padding:8px 14px;
  margin-bottom:-1px;
  position:relative;
}
.file-tab::after{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg,transparent,var(--elec),transparent);
  opacity:.4;
}

/* ── Kbd ─────────────────────────────────────────────────────── */
.kbd{
  font-family:'JetBrains Mono',monospace;
  font-size:9px;
  padding:2px 6px;
  background:var(--raised);
  border:1px solid var(--border2);
  border-radius:3px;
  color:var(--text-3);
}

/* ── Pulse dot ───────────────────────────────────────────────── */
.pulse-ring{
  position:relative;display:inline-flex;
  align-items:center;justify-content:center;
}
.pulse-ring::before{
  content:'';
  position:absolute;
  width:100%;height:100%;
  border-radius:50%;
  animation:pulseRing 1.8s ease-out infinite;
}

/* ── Section label ───────────────────────────────────────────── */
.section-label{
  font-family:'JetBrains Mono',monospace;
  font-size:9px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;
  color:var(--text-4);
  display:flex;align-items:center;gap:8px;
}
.section-label::after{
  content:'';flex:1;
  height:1px;
  background:linear-gradient(90deg,var(--border2),transparent);
}

/* ── Status indicator strip ──────────────────────────────────── */
.status-strip{
  height:2px;
  background:linear-gradient(90deg,var(--elec),var(--viol));
  box-shadow:0 0 12px var(--elec);
  border-radius:2px;
  transition:width .4s cubic-bezier(.4,0,.2,1);
}

/* ── Empty state ─────────────────────────────────────────────── */
.empty-state{
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:60px 20px;
  gap:12px;
  color:var(--text-4);
}

/* ── Ambient orbs ────────────────────────────────────────────── */
.orb{
  position:fixed;border-radius:50%;
  pointer-events:none;z-index:0;
  filter:blur(80px);
}

/* ── Restore btn ──────────────────────────────────────────────── */
.restore-btn{
  font-family:'JetBrains Mono',monospace;
  font-size:9px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;
  padding:5px 12px;
  background:transparent;
  color:var(--text-3);
  border:1px solid var(--border);
  border-radius:3px;
  cursor:pointer;
  transition:all .18s;
  white-space:nowrap;
  flex-shrink:0;
}
.restore-btn:hover{
  color:var(--elec);
  border-color:rgba(0,229,255,.3);
  background:var(--edim);
  box-shadow:0 0 12px rgba(0,229,255,.1);
}

/* ── Console toggle ───────────────────────────────────────────── */
.console-toggle{
  font-family:'Space Grotesk',sans-serif;
  font-size:11px;font-weight:600;
  letter-spacing:.05em;text-transform:uppercase;
  padding:7px 14px;
  background:transparent;
  color:var(--text-3);
  border:1px solid var(--border);
  border-radius:var(--r-sm);
  cursor:pointer;
  transition:all .2s;
  display:flex;align-items:center;gap:7px;
}
.console-toggle:hover,.console-toggle.on{
  color:var(--elec);
  border-color:rgba(0,229,255,.25);
  background:var(--edim);
}
`;

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function Spinner({ sz = 12, c = 'var(--elec)' }) {
  return (
    <div style={{
      width: sz, height: sz, flexShrink: 0,
      border: '1.5px solid rgba(0,229,255,.1)',
      borderTopColor: c, borderRadius: '50%',
      animation: 'spin .7s linear infinite'
    }} />
  );
}

function PulseDot({ color = 'var(--mint)', sz = 7 }) {
  return (
    <div className="pulse-ring" style={{ width: sz, height: sz }}>
      <div style={{ width: sz, height: sz, borderRadius: '50%', background: color, flexShrink: 0, position: 'relative', zIndex: 1 }} />
      <div style={{
        position: 'absolute', width: sz, height: sz, borderRadius: '50%',
        background: color, animation: 'pulseRing 1.8s ease-out infinite',
        opacity: .5
      }} />
    </div>
  );
}

function vMeta(v = '') {
  const u = v.toLowerCase();
  if (u.includes('accept') || u === 'ac')
    return { c: 'var(--mint)', bg: 'var(--mdim)', bo: 'rgba(0,255,163,.22)', icon: '✓', cls: 'ac' };
  if (u.includes('tle') || u.includes('time'))
    return { c: 'var(--gold)', bg: 'var(--gdim)', bo: 'rgba(255,183,0,.22)', icon: '◷', cls: 'tle' };
  if (u.includes('judg') || u.includes('run') || u.includes('pending'))
    return { c: 'var(--elec)', bg: 'var(--edim)', bo: 'rgba(0,229,255,.22)', icon: '◌', cls: 'jdg' };
  return { c: 'var(--crit)', bg: 'var(--rdim)', bo: 'rgba(255,77,109,.22)', icon: '✗', cls: 'wa' };
}

const LangColor = { python: '#4b8df8', cpp: '#a78bfa', java: '#f59e0b' };
const LangExt = { python: 'py', cpp: 'cpp', java: 'java' };
const LangLabel = { python: 'Python 3', cpp: 'C++17', java: 'Java 21' };

/* ─── Tiny glitch text ───────────────────────────────────────────────── */
function GlitchTitle({ text }) {
  return (
    <h1 className="syne" style={{
      fontSize: 22, fontWeight: 800, color: 'var(--text-1)',
      lineHeight: 1.25, letterSpacing: '-.02em',
      position: 'relative'
    }}>
      {text}
    </h1>
  );
}

/* ─── Animated counter ───────────────────────────────────────────────── */
function LineCounter({ lines }) {
  return (
    <div className="line-count">
      <span style={{ color: 'var(--text-4)' }}>//</span>
      {lines}
      <span>ln</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function ProblemWorkspace() {
  const { id: problemId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('description');
  const [problem, setProblem] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [codeValue, setCodeValue] = useState('# Write your solution here\n');
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const styleRef = useRef(null);

  /* inject CSS once */
  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement('style');
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => { styleRef.current?.remove(); styleRef.current = null; };
  }, []);

  useEffect(() => {
    fetch(`http://localhost:5000/api/problems/${problemId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProblem(d.problem);
          if (d.problem.input_example) setCustomInput(d.problem.input_example);
          if (d.problem.template_python) setCodeValue(d.problem.template_python);
        }
      })
      .catch(console.error);
  }, [problemId]);

  useEffect(() => {
    if (!problem) return;
    if (selectedLanguage === 'python' && problem.template_python) setCodeValue(problem.template_python);
    else if (selectedLanguage === 'cpp' && problem.template_cpp) setCodeValue(problem.template_cpp);
    else if (selectedLanguage === 'java' && problem.template_java) setCodeValue(problem.template_java);
    else setCodeValue('// Write your solution here\n');
  }, [selectedLanguage, problem]);

  const fetchHistory = () => {
    setIsLoadingHistory(true);
    fetch(`http://localhost:5000/api/problems/${problemId}/submissions`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setSubmissionsList(d);
        else if (d?.submissions) setSubmissionsList(d.submissions);
        setIsLoadingHistory(false);
      })
      .catch(() => setIsLoadingHistory(false));
  };

  useEffect(() => { if (problemId) fetchHistory(); }, [problemId]);
  useEffect(() => { if (activeTab === 'submissions') fetchHistory(); }, [activeTab]);

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setCurrentVerdict('JUDGING...');
    try {
      const r = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, language: selectedLanguage, code: codeValue }),
      });
      const d = await r.json();
      setCurrentVerdict(d.success ? d.verdict.toUpperCase() : (d.message?.toUpperCase() || 'EXECUTION FAILED'));
      if (d.success) fetchHistory();
    } catch { setCurrentVerdict('CONNECTION ERROR'); }
    finally { setIsSubmitting(false); }
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setIsConsoleOpen(true);
    setRunResult(null);
    try {
      const r = await fetch('http://localhost:5000/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, language: selectedLanguage, code: codeValue, customInput }),
      });
      setRunResult(await r.json());
    } catch { setRunResult({ status: 'Runtime Error', stderr: 'Sandbox dropped.' }); }
    finally { setIsRunningCode(false); }
  };

  const vm = currentVerdict ? vMeta(currentVerdict) : null;

  /* ── Monaco theme override ── */
  const handleEditorMount = (editor, monaco) => {
    monaco.editor.defineTheme('void-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'c9d1f0', background: '02040a' },
        { token: 'comment', foreground: '2d3554', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00e5ff' },
        { token: 'string', foreground: '00ffa3' },
        { token: 'number', foreground: 'ffb700' },
        { token: 'type', foreground: 'b06fff' },
        { token: 'function', foreground: '7dd3fc' },
        { token: 'variable', foreground: 'c9d1f0' },
        { token: 'operator', foreground: '00e5ff', fontStyle: '' },
        { token: 'delimiter', foreground: '3d4a6e' },
        { token: 'identifier', foreground: 'c9d1f0' },
      ],
      colors: {
        'editor.background': '#02040a',
        'editor.foreground': '#c9d1f0',
        'editor.lineHighlightBackground': '#0a0d1680',
        'editor.selectionBackground': '#00e5ff18',
        'editor.selectionHighlightBackground': '#00e5ff0a',
        'editorLineNumber.foreground': '#1e2540',
        'editorLineNumber.activeForeground': '#00e5ff55',
        'editorCursor.foreground': '#00e5ff',
        'editorIndentGuide.background': '#0f1220',
        'editorIndentGuide.activeBackground': '#1c2440',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#00e5ff15',
        'scrollbarSlider.hoverBackground': '#00e5ff25',
        'scrollbarSlider.activeBackground': '#00e5ff35',
      }
    });
    monaco.editor.setTheme('void-dark');
  };

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh',
      background: 'var(--void)', overflow: 'hidden', position: 'relative'
    }}>
      {/* ── Scanline & noise overlays ── */}
      <div className="scanline-overlay" />
      <div className="scan-beam" />
      <div className="grid-bg" />
      <div className="noise" />

      {/* ── Ambient orbs ── */}
      <div className="orb" style={{
        width: 600, height: 600, top: -200, right: -150,
        background: 'radial-gradient(circle, rgba(0,229,255,.055) 0%, transparent 70%)',
        animation: 'float 18s ease-in-out infinite'
      }} />
      <div className="orb" style={{
        width: 500, height: 500, bottom: -180, left: '10%',
        background: 'radial-gradient(circle, rgba(176,111,255,.045) 0%, transparent 70%)',
        animation: 'float 22s ease-in-out infinite reverse'
      }} />
      <div className="orb" style={{
        width: 350, height: 350, top: '35%', left: -100,
        background: 'radial-gradient(circle, rgba(0,255,163,.03) 0%, transparent 70%)',
        animation: 'float 26s ease-in-out infinite 3s'
      }} />

      {/* ── Main layout ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', width: '100%', height: '100%',
        padding: 10, gap: 8
      }}>

        {/* ██████████████████████ LEFT PANEL ██████████████████████ */}
        <div className="panel" style={{
          width: '43%', minWidth: 300,
          display: 'flex', flexDirection: 'column'
        }}>
          <div className="panel-header-line" />
          {/* Corner brackets */}
          {['bracket-tl','bracket-tr','bracket-bl','bracket-br'].map(c => (
            <div key={c} className={`bracket ${c}`} />
          ))}

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(2,4,10,.8)',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0, gap: 12, position: 'relative', zIndex: 1
          }}>
            <div className="tab-nav">
              {[
                { id: 'description', label: 'Problem' },
                { id: 'submissions', label: 'Runs' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`tab-btn${activeTab === t.id ? ' on' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                  {t.id === 'submissions' && submissionsList.length > 0 && (
                    <span className="count-badge">{submissionsList.length}</span>
                  )}
                </button>
              ))}
            </div>

            <button className="btn b-back" onClick={() => navigate('/')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="mono" style={{ fontSize: 10 }}>index</span>
            </button>
          </div>

          {/* Body */}
          <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', position: 'relative', zIndex: 1 }}>

            {/* ── DESCRIPTION TAB ── */}
            {activeTab === 'description' && (
              <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Meta row */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' }}>
                    {problem?.difficulty && (
                      <span className={`diff-badge diff-${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                    )}
                    {problem?.tags?.map(t => <span key={t} className="tag-pill">{t}</span>)}
                  </div>

                  {problem?.title
                    ? <GlitchTitle text={problem.title} />
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="sk" style={{ height: 22, width: '68%' }} />
                        <div className="sk" style={{ height: 22, width: '45%' }} />
                      </div>
                    )}
                </div>

                {/* Divider */}
                <div style={{
                  height: 1,
                  background: 'linear-gradient(90deg, var(--elec), transparent)',
                  opacity: .15
                }} />

                {/* Description */}
                <div>
                  <div className="section-label" style={{ marginBottom: 10 }}>Statement</div>
                  {problem?.description
                    ? (
                      <p style={{
                        fontSize: 13.5, lineHeight: 1.85,
                        color: 'rgba(136,146,176,0.85)',
                        whiteSpace: 'pre-wrap',
                        fontWeight: 400
                      }}>
                        {problem.description}
                      </p>
                    )
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {[90, 76, 84, 60, 72].map((w, i) => (
                          <div key={i} className="sk" style={{ height: 12, width: `${w}%`, animationDelay: `${i * .08}s` }} />
                        ))}
                      </div>
                    )}
                </div>

                {/* IO blocks */}
                {(problem?.input_example || problem?.output_example) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="section-label">Examples</div>
                    {problem?.input_example && (
                      <div className="io-block inp">
                        <div className="io-head">
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--elec)', boxShadow: '0 0 6px var(--elec)' }} />
                          <span className="io-label" style={{ color: 'var(--elec)' }}>Input</span>
                        </div>
                        <pre className="mono" style={{
                          padding: '12px 16px', fontSize: 12,
                          color: 'rgba(136,146,176,.9)', lineHeight: 1.75,
                          whiteSpace: 'pre-wrap'
                        }}>{problem.input_example}</pre>
                      </div>
                    )}
                    {problem?.output_example && (
                      <div className="io-block out">
                        <div className="io-head">
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)', boxShadow: '0 0 6px var(--mint)' }} />
                          <span className="io-label" style={{ color: 'var(--mint)' }}>Output</span>
                        </div>
                        <pre className="mono" style={{
                          padding: '12px 16px', fontSize: 12,
                          color: 'rgba(136,146,176,.9)', lineHeight: 1.75,
                          whiteSpace: 'pre-wrap'
                        }}>{problem.output_example}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Constraints */}
                {problem?.constraints && (
                  <div className="constraint-box">
                    <div className="section-label" style={{ marginBottom: 10, color: 'rgba(176,111,255,.5)' }}>
                      <span>Constraints</span>
                    </div>
                    <pre className="mono" style={{
                      fontSize: 12, color: 'rgba(136,146,176,.8)',
                      lineHeight: 1.75, whiteSpace: 'pre-wrap'
                    }}>{problem.constraints}</pre>
                  </div>
                )}
              </div>
            )}

            {/* ── SUBMISSIONS TAB ── */}
            {activeTab === 'submissions' && (
              <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="section-label">Submission History</div>
                  <button className="btn b-ghost" style={{ padding: '5px 12px', fontSize: 10 }} onClick={fetchHistory}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M9.5 5.5A4 4 0 1 1 6 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M6 1v3l2.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Refresh
                  </button>
                </div>

                {isLoadingHistory ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="sk" style={{ height: 62, borderRadius: 'var(--r-md)', animationDelay: `${i * .1}s` }} />
                    ))}
                  </div>
                ) : submissionsList.length === 0 ? (
                  <div className="empty-state">
                    <div style={{
                      width: 44, height: 44,
                      border: '1px solid var(--border2)',
                      borderRadius: 'var(--r-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 4
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: .3 }}>
                        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M7 10h6M7 7h4M7 13h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>No submissions yet</p>
                    <p style={{ fontSize: 11, color: 'var(--text-4)' }}>Submit your first solution</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {submissionsList.map((row, i) => {
                      const m = vMeta(row.verdict || '');
                      return (
                        <div
                          key={row.id}
                          className={`sub-row ${m.cls} sr`}
                          style={{ animationDelay: `${i * .05}s` }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <PulseDot color={m.c} sz={6} />
                              <span className="mono" style={{
                                fontSize: 11, fontWeight: 700,
                                color: m.c, letterSpacing: '.04em'
                              }}>
                                {row.verdict || 'Evaluating'}
                              </span>
                              <span style={{
                                fontFamily: 'JetBrains Mono',
                                fontSize: 9, fontWeight: 700,
                                letterSpacing: '.08em', textTransform: 'uppercase',
                                background: 'var(--raised)',
                                border: '1px solid var(--border2)',
                                color: LangColor[row.language] || 'var(--text-3)',
                                borderRadius: 3, padding: '1px 6px'
                              }}>
                                {row.language}
                              </span>
                            </div>
                            <span className="mono" style={{ fontSize: 9, color: 'var(--text-4)', paddingLeft: 14 }}>
                              {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : 'just now'}
                            </span>
                          </div>
                          <button
                            className="restore-btn"
                            onClick={() => {
                              setSelectedLanguage(row.language);
                              setTimeout(() => setCodeValue(row.code), 10);
                              setActiveTab('description');
                            }}
                          >
                            Restore ↗
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ██████████████████████ RIGHT PANEL ██████████████████████ */}
        <div className="panel" style={{
          flex: 1, minWidth: 0, position: 'relative',
          display: 'flex', flexDirection: 'column'
        }}>
          <div className="panel-header-line" />
          {['bracket-tl','bracket-tr','bracket-bl','bracket-br'].map(c => (
            <div key={c} className={`bracket ${c}`} />
          ))}

          {/* ── Editor toolbar ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 14px 0 10px',
            background: 'rgba(2,4,10,.9)',
            borderBottom: '1px solid var(--border)',
            minHeight: 50, flexShrink: 0, gap: 12,
            position: 'relative', zIndex: 1
          }}>
            {/* File tab */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
              <div className="file-tab">
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: LangColor[selectedLanguage],
                  boxShadow: `0 0 8px ${LangColor[selectedLanguage]}`
                }} />
                <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)' }}>
                  solution.{LangExt[selectedLanguage]}
                </span>
                {/* unsaved dot */}
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)', opacity: .8, animation: 'subtlePulse 2s ease-in-out infinite' }} />
              </div>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LineCounter lines={codeValue.split('\n').length} />
              <div style={{ width: 1, height: 16, background: 'var(--border2)' }} />
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="lang-sel"
              >
                <option value="python">Python 3</option>
                <option value="cpp">C++ 17</option>
                <option value="java">Java 21</option>
              </select>
            </div>
          </div>

          {/* ── Monaco Editor ── */}
          <div style={{ flex: 1, background: 'var(--void)', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
            {/* Editor glow line top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,${LangColor[selectedLanguage]}40,transparent)`,
              zIndex: 2, pointerEvents: 'none',
              transition: 'background .3s'
            }} />
            <Editor
              height="100%"
              theme="void-dark"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              value={codeValue}
              onChange={v => setCodeValue(v || '')}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13.5,
                automaticLayout: true,
                fontFamily: 'JetBrains Mono, monospace',
                fontLigatures: true,
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                padding: { top: 20, bottom: 20 },
                renderLineHighlight: 'gutter',
                cursorStyle: 'line', cursorWidth: 2,
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                contextmenu: false,
                renderWhitespace: 'none',
                guides: { indentation: true, bracketPairs: true },
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* ── Console drawer ── */}
          <div
            className={`console-panel${isConsoleOpen ? ' open' : ''}`}
            style={{
              height: isConsoleOpen ? 270 : 0,
              border: isConsoleOpen ? '1px solid rgba(0,229,255,.1)' : '1px solid transparent',
            }}
          >
            {/* Console header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'rgba(2,4,10,.9)',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PulseDot color={isRunningCode ? 'var(--gold)' : 'var(--mint)'} sz={6} />
                <span className="mono" style={{
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: '.12em', color: 'var(--text-3)',
                  textTransform: 'uppercase'
                }}>
                  {isRunningCode ? 'executing...' : 'console'}
                </span>
              </div>
              <button
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-4)', cursor: 'pointer',
                  fontSize: 16, lineHeight: 1, padding: '0 2px',
                  transition: 'color .15s', fontFamily: 'monospace'
                }}
                onClick={() => setIsConsoleOpen(false)}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--crit)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
              >×</button>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: 8, padding: 10, overflow: 'hidden', minHeight: 0 }}>
              {/* stdin */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <span className="mono" style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '.1em',
                  color: 'var(--text-4)', textTransform: 'uppercase'
                }}>stdin</span>
                <textarea
                  className="stdin-area sc"
                  style={{ flex: 1 }}
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="paste test input..."
                />
              </div>

              {/* stdout */}
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', gap: 5,
                background: 'var(--deep)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: '8px 10px', minWidth: 0, overflow: 'hidden'
              }}>
                <span className="mono" style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '.1em',
                  color: 'var(--text-4)', textTransform: 'uppercase',
                  flexShrink: 0
                }}>stdout</span>
                <div className="sc" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  {isRunningCode && (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', height: '100%',
                      gap: 10, color: 'var(--elec)', fontSize: 11
                    }}>
                      <Spinner /> executing…
                    </div>
                  )}
                  {!isRunningCode && runResult && (
                    <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Status:</span>
                        <span className="mono" style={{
                          fontSize: 11, fontWeight: 700,
                          color: runResult.status === 'Success' ? 'var(--mint)' : 'var(--crit)'
                        }}>{runResult.status}</span>
                      </div>
                      {runResult.compile_error && (
                        <div>
                          <div className="mono" style={{ fontSize: 8, fontWeight: 700, color: 'var(--crit)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>Compile Error</div>
                          <pre className="mono sc" style={{
                            fontSize: 11, color: '#fca5a5', whiteSpace: 'pre-wrap',
                            background: 'var(--rdim)',
                            border: '1px solid rgba(255,77,109,.12)',
                            borderRadius: 6, padding: 8,
                            maxHeight: 90, overflowY: 'auto'
                          }}>{runResult.compile_error}</pre>
                        </div>
                      )}
                      {runResult.stdout !== undefined && !runResult.compile_error && (
                        <pre className="mono" style={{
                          fontSize: 12, color: 'rgba(0,229,255,.75)',
                          whiteSpace: 'pre-wrap', lineHeight: 1.7
                        }}>
                          {runResult.stdout || (
                            <span style={{ color: 'var(--text-4)', fontStyle: 'italic' }}>empty output</span>
                          )}
                        </pre>
                      )}
                    </div>
                  )}
                  {!isRunningCode && !runResult && (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', height: '100%',
                      color: 'var(--text-4)', fontSize: 11
                    }}>
                      output appears here
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom action bar ── */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '8px 14px',
            background: 'rgba(2,4,10,.95)',
            borderTop: '1px solid var(--border)',
            flexShrink: 0, gap: 10, minHeight: 56,
            zIndex: 20, position: 'relative'
          }}>
            {/* Status bar line top */}
            <div style={{
              position: 'absolute', top: 0, left: 14, right: 14, height: 1,
              background: 'linear-gradient(90deg,transparent,rgba(0,229,255,.2),transparent)'
            }} />

            {/* Console toggle */}
            <button
              className={`console-toggle${isConsoleOpen ? ' on' : ''}`}
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 4.5L5.5 6.5L3 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 8.5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Console
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none"
                style={{ transition: 'transform .2s', transform: isConsoleOpen ? 'rotate(180deg)' : '' }}>
                <path d="M1 2L3.5 4.5L6 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Verdict chip */}
            {currentVerdict && vm && (
              <div className="v-chip" style={{
                background: vm.bg, borderColor: vm.bo, color: vm.c,
                boxShadow: `0 0 20px ${vm.bg}`
              }}>
                {isSubmitting ? <Spinner sz={9} c={vm.c} /> : (
                  <span style={{ fontSize: 12 }}>{vm.icon}</span>
                )}
                <span style={{
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', maxWidth: 150
                }}>{currentVerdict}</span>
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Kbd hint */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: .25 }}>
              <span className="kbd">⌘</span>
              <span className="kbd">↵</span>
              <span className="mono" style={{ fontSize: 9, color: 'var(--text-4)' }}>run</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border2)' }} />

            {/* Run + Submit */}
            <div style={{ display: 'flex', gap: 7 }}>
              <button className="btn b-run" disabled={isRunningCode || isSubmitting} onClick={handleRunCode}>
                {isRunningCode ? <Spinner sz={10} c="var(--text-1)" /> : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 1.5L8.5 5L2.5 8.5V1.5Z" fill="currentColor" />
                  </svg>
                )}
                Run
              </button>
              <button className="btn b-submit" disabled={isSubmitting || isRunningCode} onClick={handleSubmitCode}>
                {isSubmitting ? <Spinner sz={10} c="var(--elec)" /> : (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5L4 8.5L9.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
