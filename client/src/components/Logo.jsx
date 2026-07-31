export default function Logo({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="20" fill="#0B5FFF" />
      <g transform="translate(9,11)">
        <path d="M1 15V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v11" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7.5h3.6l2.9 2.9V15H14v-7.5Z" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5" cy="17" r="1.8" stroke="white" strokeWidth="1.7" />
        <circle cx="17" cy="17" r="1.8" stroke="white" strokeWidth="1.7" />
      </g>
    </svg>
  );
}
