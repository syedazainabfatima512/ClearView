import './BrandLogo.css'

function BrandLogo({
    compact = false,
    stacked = false,
    subtitle = '',
    className = '',
    emphasis = 'default'
}) {
    const classes = [
        'brand-logo',
        compact ? 'compact' : '',
        stacked ? 'stacked' : '',
        emphasis !== 'default' ? `brand-logo-${emphasis}` : '',
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={classes}>
            <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none">
                    <defs>
                        <linearGradient id="brandGradient" x1="8" y1="8" x2="56" y2="56">
                            <stop offset="0%" stopColor="#66d0c3" />
                            <stop offset="100%" stopColor="#e0ab63" />
                        </linearGradient>
                    </defs>
                    <rect x="5" y="5" width="54" height="54" rx="18" fill="#10161d" />
                    <rect x="5" y="5" width="54" height="54" rx="18" stroke="url(#brandGradient)" strokeWidth="2.5" />
                    <path d="M15 32s5-10 17-10 17 10 17 10-5 10-17 10S15 32 15 32Z" stroke="url(#brandGradient)" strokeWidth="3" />
                    <circle cx="32" cy="32" r="6.5" fill="#f3efe6" />
                    <path d="M32 13v7M32 44v7M13 32h7M44 32h7" stroke="#f3efe6" strokeOpacity=".65" strokeWidth="2.5" />
                </svg>
            </span>

            <span className="brand-copy">
                <span className="brand-name">ClearView</span>
                {subtitle && <span className="brand-subtitle">{subtitle}</span>}
            </span>
        </div>
    )
}

export default BrandLogo
