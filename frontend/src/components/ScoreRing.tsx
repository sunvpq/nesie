import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { getScoreGrade } from '../utils/scoreUtils'

interface ScoreRingProps {
  score: number
  animated?: boolean
  size?: number
  children?: React.ReactNode
}

const VIEWBOX_SIZE = 200
const RADIUS = 90
const STROKE_WIDTH = 4
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const MAX_SCORE = 850
const MIN_SCORE = 300

export default function ScoreRing({
  score,
  animated = true,
  size = 200,
  children,
}: ScoreRingProps) {
  const grade = getScoreGrade(score)

  const progress = (score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const targetOffset = CIRCUMFERENCE * (1 - clampedProgress)

  const strokeDashoffset = useMotionValue(CIRCUMFERENCE)

  useEffect(() => {
    if (animated) {
      const controls = animate(strokeDashoffset, targetOffset, {
        duration: 1.5,
        ease: 'easeOut',
        delay: 0.3,
      })
      return controls.stop
    } else {
      strokeDashoffset.set(targetOffset)
    }
  }, [score, animated, targetOffset])

  return (
    <div
      style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}
      className="flex items-center justify-center"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={VIEWBOX_SIZE / 2}
          cy={VIEWBOX_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#1F1F1F"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress arc */}
        <motion.circle
          cx={VIEWBOX_SIZE / 2}
          cy={VIEWBOX_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={grade.ringColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset }}
        />
      </svg>
      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Animated counter for score display
interface AnimatedScoreProps {
  score: number
  color: string
  fontSize?: number
}

export function AnimatedScore({ score, color, fontSize = 80 }: AnimatedScoreProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toString())

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.5,
      ease: 'easeOut',
      delay: 0.3,
    })
    return controls.stop
  }, [score])

  return (
    <motion.span
      style={{
        color,
        fontSize,
        fontFamily: "'Unbounded', sans-serif",
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}
    >
      {rounded}
    </motion.span>
  )
}
