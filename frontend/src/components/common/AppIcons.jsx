const IconBase = ({ children, className = '', size = 20, strokeWidth = 1.8, ...props }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        {children}
    </svg>
)

export const ArrowRightIcon = (props) => (
    <IconBase {...props}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
    </IconBase>
)

export const CameraIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H8l1.5-2h5L16 6h2.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
        <circle cx="12" cy="12.5" r="3.5" />
    </IconBase>
)

export const ChartIcon = (props) => (
    <IconBase {...props}>
        <path d="M4 19h16" />
        <path d="M7 16V9" />
        <path d="M12 16V5" />
        <path d="M17 16v-4" />
    </IconBase>
)

export const CheckCircleIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.2 2.2 4.8-5.2" />
    </IconBase>
)

export const ChevronDownIcon = (props) => (
    <IconBase {...props}>
        <path d="m6 9 6 6 6-6" />
    </IconBase>
)

export const ChevronUpIcon = (props) => (
    <IconBase {...props}>
        <path d="m18 15-6-6-6 6" />
    </IconBase>
)

export const ClipboardIcon = (props) => (
    <IconBase {...props}>
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 4.5h6" />
        <path d="M9 9h6" />
        <path d="M9 13h4" />
    </IconBase>
)

export const DocumentIcon = (props) => (
    <IconBase {...props}>
        <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5z" />
        <path d="M14 3.5V8h4" />
        <path d="M9 12h6" />
        <path d="M9 15h6" />
    </IconBase>
)

export const EyeIcon = (props) => (
    <IconBase {...props}>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.8" />
    </IconBase>
)

export const FlagIcon = (props) => (
    <IconBase {...props}>
        <path d="M6 20V4" />
        <path d="M6 5h9l-1.5 3L15 11H6" />
    </IconBase>
)

export const GaugeIcon = (props) => (
    <IconBase {...props}>
        <path d="M5 15a7 7 0 1 1 14 0" />
        <path d="m12 12 4-4" />
        <path d="M12 12v3" />
    </IconBase>
)

export const LayersIcon = (props) => (
    <IconBase {...props}>
        <path d="m12 4 8 4-8 4-8-4 8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16 8 4 8-4" />
    </IconBase>
)

export const ListIcon = (props) => (
    <IconBase {...props}>
        <path d="M9 7h10" />
        <path d="M9 12h10" />
        <path d="M9 17h10" />
        <circle cx="5" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="17" r="1" fill="currentColor" stroke="none" />
    </IconBase>
)

export const MessageIcon = (props) => (
    <IconBase {...props}>
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5z" />
    </IconBase>
)

export const MicIcon = (props) => (
    <IconBase {...props}>
        <rect x="9" y="3.5" width="6" height="11" rx="3" />
        <path d="M6 11.5a6 6 0 0 0 12 0" />
        <path d="M12 17.5V21" />
        <path d="M9 21h6" />
    </IconBase>
)

export const PauseIcon = (props) => (
    <IconBase {...props}>
        <rect x="7" y="5" width="3" height="14" rx="1" />
        <rect x="14" y="5" width="3" height="14" rx="1" />
    </IconBase>
)

export const PlayIcon = (props) => (
    <IconBase {...props}>
        <path d="m8 6 10 6-10 6z" fill="currentColor" stroke="none" />
    </IconBase>
)

export const SparkIcon = (props) => (
    <IconBase {...props}>
        <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
        <path d="m19.5 4.5.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
        <path d="m5 15.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </IconBase>
)

export const StopIcon = (props) => (
    <IconBase {...props}>
        <rect x="6" y="6" width="12" height="12" rx="2" />
    </IconBase>
)

export const TargetIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </IconBase>
)

export const TrophyIcon = (props) => (
    <IconBase {...props}>
        <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
        <path d="M9 16h6" />
        <path d="M12 12v4" />
        <path d="M6 5H4.5A1.5 1.5 0 0 0 3 6.5V7a4 4 0 0 0 4 4" />
        <path d="M18 5h1.5A1.5 1.5 0 0 1 21 6.5V7a4 4 0 0 1-4 4" />
    </IconBase>
)

export const UploadIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 16V5" />
        <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
        <path d="M5 18.5h14" />
    </IconBase>
)

export const VolumeIcon = (props) => (
    <IconBase {...props}>
        <path d="M5 14h3l4 4V6L8 10H5z" />
        <path d="M16 9a4.5 4.5 0 0 1 0 6" />
        <path d="M18.5 6.5a8 8 0 0 1 0 11" />
    </IconBase>
)

export const WaveIcon = (props) => (
    <IconBase {...props}>
        <path d="M4 14c2-4 4 4 6 0s4-4 6 0 4 4 4 0" />
        <path d="M4 10c2-4 4 4 6 0s4-4 6 0 4 4 4 0" />
    </IconBase>
)
