import React from 'react'

interface VoxenLogoProps {
  size?: number
  className?: string
  color?: string
}

export function VoxenLogo({ size = 24, className = '', color = 'currentColor' }: VoxenLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3L12 21L21 3H17L12 13L7 3H3Z"
        fill={color}
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="8"
        r="2"
        fill={color}
        opacity="0.8"
      />
    </svg>
  )
}