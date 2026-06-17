import './StoryIllustrations.css'

const IllustrationFrame = ({ children, className = '' }) => (
    <div className={`story-illustration ${className}`} aria-hidden="true">
        {children}
    </div>
)

const commonTextProps = {
    fill: '#c3c8d1',
    fontFamily: 'Manrope, sans-serif'
}

export function ResumeFlowIllustration({ className = '' }) {
    return (
        <IllustrationFrame className={`story-illustration-upload ${className}`}>
            <svg viewBox="0 0 420 370" role="presentation">
                <defs>
                    <linearGradient id="uploadOuter" x1="32" y1="24" x2="360" y2="340" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#151f29" />
                        <stop offset="100%" stopColor="#0e141a" />
                    </linearGradient>
                    <linearGradient id="uploadAccent" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#66d0c3" />
                        <stop offset="100%" stopColor="#e0ab63" />
                    </linearGradient>
                </defs>

                <rect x="18" y="18" width="384" height="330" rx="28" fill="url(#uploadOuter)" stroke="rgba(255,255,255,0.08)" />

                <rect x="42" y="44" width="140" height="184" rx="20" fill="#111922" stroke="rgba(102,208,195,0.28)" />
                <path d="M73 74h55l22 22v90H73z" fill="#182430" stroke="rgba(255,255,255,0.06)" />
                <path d="M128 74v24h22" fill="none" stroke="rgba(224,171,99,0.75)" strokeWidth="2" />
                <rect x="86" y="120" width="54" height="8" rx="4" fill="rgba(102,208,195,0.72)" />
                <rect x="86" y="140" width="46" height="6" rx="3" fill="rgba(255,255,255,0.22)" />
                <rect x="86" y="154" width="58" height="6" rx="3" fill="rgba(255,255,255,0.22)" />
                <rect x="86" y="168" width="36" height="6" rx="3" fill="rgba(255,255,255,0.22)" />
                <text x="70" y="206" fontSize="13" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">resume.pdf</text>

                <rect x="200" y="44" width="186" height="136" rx="20" fill="#101821" stroke="rgba(255,255,255,0.06)" />
                <circle cx="222" cy="64" r="4" fill="#ef8e80" />
                <circle cx="236" cy="64" r="4" fill="#efbf6d" />
                <circle cx="250" cy="64" r="4" fill="#66d0c3" />
                <text x="270" y="69" fontSize="12" letterSpacing="0.12em" {...commonTextProps} fill="#7f8a98">session.build()</text>
                
                <text x="220" y="96" fontSize="12.5" {...commonTextProps}>
                    <tspan x="220" dy="0">extract(candidate.resume)</tspan>
                    <tspan x="220" dy="20">focus = ['projects', 'depth']</tspan>
                    <tspan x="220" dy="20">tips.push(</tspan>
                    <tspan x="236" dy="18">'use real examples'</tspan>
                    <tspan x="220" dy="18">)</tspan>
                </text>

                <path d="M178 136h22" stroke="url(#uploadAccent)" strokeWidth="3" strokeLinecap="round" />
                <path d="m194 126 10 10-10 10" fill="none" stroke="url(#uploadAccent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                <rect x="200" y="190" width="186" height="124" rx="22" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
                <text x="222" y="216" fontSize="12" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">INTERVIEW NOTES</text>
                <rect x="222" y="232" width="58" height="20" rx="10" fill="rgba(102,208,195,0.14)" />
                <text x="236" y="246" fontSize="11" {...commonTextProps} fill="#edf8f6">STAR</text>
                <rect x="288" y="232" width="56" height="20" rx="10" fill="rgba(224,171,99,0.14)" />
                <text x="296" y="246" fontSize="11" {...commonTextProps} fill="#f3efe6">metrics</text>
                
                <text x="222" y="268" fontSize="12.5" {...commonTextProps}>
                    <tspan x="222" dy="0">Tip: connect each answer</tspan>
                    <tspan x="222" dy="18">back to work you</tspan>
                    <tspan x="222" dy="18">actually did.</tspan>
                </text>
            </svg>
        </IllustrationFrame>
    )
}

export function DashboardSignalsIllustration({ className = '' }) {
    return (
        <IllustrationFrame className={`story-illustration-dashboard ${className}`}>
            <svg viewBox="0 0 420 320" role="presentation">
                <defs>
                    <linearGradient id="dashOuter" x1="24" y1="24" x2="380" y2="304" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#151f29" />
                        <stop offset="100%" stopColor="#0e141a" />
                    </linearGradient>
                    <linearGradient id="dashAccent" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#66d0c3" />
                        <stop offset="100%" stopColor="#e0ab63" />
                    </linearGradient>
                </defs>

                <rect x="18" y="18" width="384" height="284" rx="28" fill="url(#dashOuter)" stroke="rgba(255,255,255,0.08)" />

                <rect x="38" y="44" width="164" height="96" rx="22" fill="#111922" stroke="rgba(255,255,255,0.06)" />
                <text x="58" y="68" fontSize="12" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">READINESS MODEL</text>
                <text x="58" y="94" fontSize="14" {...commonTextProps}>score =</text>
                <text x="58" y="117" fontSize="14" {...commonTextProps}>quality * 0.75</text>
                <text x="58" y="139" fontSize="14" {...commonTextProps}>delivery * 0.25</text>

                <rect x="224" y="44" width="158" height="96" rx="22" fill="#111922" stroke="rgba(102,208,195,0.24)" />
                <text x="246" y="68" fontSize="12" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">LATEST SIGNALS</text>
                <rect x="246" y="90" width="82" height="8" rx="4" fill="rgba(102,208,195,0.8)" />
                <rect x="246" y="110" width="104" height="8" rx="4" fill="rgba(224,171,99,0.72)" />
                <rect x="246" y="130" width="64" height="8" rx="4" fill="rgba(255,255,255,0.24)" />
                <text x="336" y="98" fontSize="11.5" {...commonTextProps}>accuracy</text>
                <text x="356" y="118" fontSize="11.5" {...commonTextProps}>depth</text>
                <text x="318" y="138" fontSize="11.5" {...commonTextProps}>delivery</text>

                <rect x="38" y="166" width="344" height="110" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
                <text x="60" y="190" fontSize="12" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">THIS WEEK'S PRACTICE</text>

                <rect x="60" y="208" width="126" height="50" rx="16" fill="#111922" stroke="rgba(255,255,255,0.05)" />
                <text x="76" y="228" fontSize="11.5" {...commonTextProps}>1. answer with evidence</text>
                <text x="76" y="246" fontSize="11.5" {...commonTextProps}>2. slow the opening</text>

                <rect x="202" y="208" width="82" height="50" rx="16" fill="rgba(102,208,195,0.1)" />
                <text x="220" y="228" fontSize="24" fontWeight="700" {...commonTextProps} fill="#edf8f6">72</text>
                <text x="220" y="246" fontSize="11.5" {...commonTextProps}>best round</text>

                <rect x="300" y="208" width="60" height="50" rx="16" fill="rgba(224,171,99,0.1)" />
                <path d="M315 244V230l9-9 10 8 11-18" fill="none" stroke="url(#dashAccent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="315" cy="244" r="3" fill="#66d0c3" />
            </svg>
        </IllustrationFrame>
    )
}

export function ResultsAuditIllustration({ className = '', result = null }) {
    // 1. IRS Score
    const irsScore = result?.interviewReadinessScore ?? 72;

    // 2. Answer Split
    const accuracy = result?.answerPerformance?.averageAccuracy ?? 96;
    const structure = result?.answerPerformance?.averageCommunication ?? 72;
    const depth = result?.answerPerformance?.averageDepth ?? 70;
    const depthGaps = 100 - depth;

    // Scale widths (max width is 85px representing 100%)
    const accuracyWidth = Math.max(8, (accuracy / 100) * 85);
    const structureWidth = Math.max(8, (structure / 100) * 85);
    const depthGapsWidth = Math.max(8, (depthGaps / 100) * 85);

    // 3. Missed Points (from breakdown or areasToImprove)
    let missedPoints = [];
    if (result?.answerBreakdown) {
        for (const item of result.answerBreakdown) {
            const missed = item.evaluation?.missedPoints;
            if (Array.isArray(missed)) {
                for (const p of missed) {
                    if (p && !missedPoints.includes(p)) {
                        missedPoints.push(p);
                    }
                }
            }
        }
    }
    if (missedPoints.length === 0) {
        missedPoints = result?.areasToImprove || [];
    }
    if (missedPoints.length === 0) {
        missedPoints = ['skipped tradeoffs', 'examples too general'];
    }

    const cleanMissedPoints = missedPoints.slice(0, 2).map(p => {
        let s = p.replace(/^[•\-\*\d\.\s]+/, '').trim();
        s = s.toLowerCase();
        if (s.length > 20) s = s.substring(0, 17) + '...';
        return s;
    });

    // 4. Next Round (from nextSteps or recommendations)
    let nextSteps = result?.nextSteps || result?.recommendations || [];
    if (nextSteps.length === 0) {
        nextSteps = ['lead with decision', 'prove it with one metric'];
    }

    const cleanNextSteps = nextSteps.slice(0, 2).map(s => {
        let clean = s.replace(/^[•\-\*\d\.\s]+/, '').trim();
        clean = clean.toLowerCase();
        if (clean.length > 22) clean = clean.substring(0, 19) + '...';
        return clean;
    });

    // SVG path circumference is 2 * pi * r = 2 * 3.14159 * 52 = 326.72
    const circumference = 326.7;
    const strokeOffset = circumference - (circumference * Math.min(Math.max(irsScore, 0), 100)) / 100;

    return (
        <IllustrationFrame className={`story-illustration-results ${className}`}>
            <svg viewBox="0 0 420 320" role="presentation">
                <defs>
                    <linearGradient id="resultsOuter" x1="24" y1="28" x2="388" y2="296" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#151f29" />
                        <stop offset="100%" stopColor="#0e141a" />
                    </linearGradient>
                    <linearGradient id="resultsAccent" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#66d0c3" />
                        <stop offset="100%" stopColor="#e0ab63" />
                    </linearGradient>
                </defs>

                <rect x="18" y="18" width="384" height="284" rx="28" fill="url(#resultsOuter)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Circular Gauge */}
                <circle cx="112" cy="122" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                <circle
                    cx="112"
                    cy="122"
                    r="52"
                    fill="none"
                    stroke="url(#resultsAccent)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    transform="rotate(-90 112 122)"
                />
                
                {/* Centered IRS Score text to prevent overlapping and alignment bugs */}
                <text x="112" y="108" fontSize="12" letterSpacing="0.16em" textAnchor="middle" {...commonTextProps} fill="#e0ab63">IRS</text>
                <text x="112" y="144" fontSize="34" fontWeight="700" textAnchor="middle" {...commonTextProps} fill="#edf8f6">{irsScore}</text>

                {/* Answer Split */}
                <rect x="194" y="54" width="178" height="102" rx="22" fill="#111922" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x="216" y="80" fontSize="12" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">ANSWER SPLIT</text>
                <rect x="216" y="96" width={accuracyWidth} height="8" rx="4" fill="rgba(102,208,195,0.8)" />
                <rect x="216" y="118" width={structureWidth} height="8" rx="4" fill="rgba(224,171,99,0.78)" />
                <rect x="216" y="140" width={depthGapsWidth} height="8" rx="4" fill="rgba(239,142,128,0.8)" />
                <text x="312" y="104" fontSize="11.5" {...commonTextProps}>accuracy</text>
                <text x="312" y="126" fontSize="11.5" {...commonTextProps}>structure</text>
                <text x="312" y="148" fontSize="11.5" {...commonTextProps}>depth gaps</text>

                {/* Missed Points */}
                <rect x="48" y="194" width="154" height="78" rx="22" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x="64" y="218" fontSize="12" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">MISSED POINTS</text>
                {cleanMissedPoints[0] && (
                    <text x="64" y="240" fontSize="11.5" {...commonTextProps}>• {cleanMissedPoints[0]}</text>
                )}
                {cleanMissedPoints[1] && (
                    <text x="64" y="258" fontSize="11.5" {...commonTextProps}>• {cleanMissedPoints[1]}</text>
                )}

                {/* Next Round */}
                <rect x="222" y="194" width="150" height="78" rx="22" fill="rgba(102,208,195,0.08)" stroke="rgba(102,208,195,0.16)" strokeWidth="1" />
                <text x="238" y="218" fontSize="12" letterSpacing="0.16em" {...commonTextProps} fill="#e0ab63">NEXT ROUND</text>
                {cleanNextSteps[0] && (
                    <text x="238" y="240" fontSize="11.5" {...commonTextProps}>1. {cleanNextSteps[0]}</text>
                )}
                {cleanNextSteps[1] && (
                    <text x="238" y="258" fontSize="11.5" {...commonTextProps}>2. {cleanNextSteps[1]}</text>
                )}
            </svg>
        </IllustrationFrame>
    )
}
