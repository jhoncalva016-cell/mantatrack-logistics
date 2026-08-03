export default function Logo({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 40" fill="none" className={className}>
      <path
        d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 24 16 24s16-12.5 16-24C32 7.163 24.837 0 16 0Z"
        fill="#F5A623"
      />
      <g transform="translate(6.5,8.5)">
        <path d="M1 12.5V3.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6.5h3l2.3 2.3v3.7H12v-6Z" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="14.3" r="1.5" stroke="white" strokeWidth="1.5" />
        <circle cx="14.3" cy="14.3" r="1.5" stroke="white" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
