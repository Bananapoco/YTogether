import { useId } from "react"

const colors = {
  voidCenter: "#30343b",
  voidEdge: "#25282e",
  cloud: "#383c44",
  far: "#3e434b",
  farShade: "#373b42",
  islandTop: "#8b919a",
  islandFront: "#666c75",
  islandUnder: "#545961",
  islandTip: "#4a4f56",
  leaves: "#767c85",
  leavesShade: "#666c75",
  chest: "#a3a8b0",
  chestFront: "#7d838b",
  arm: "#c3c7cd",
  armShade: "#a2a7ae",
  stone: "#979da5",
  stoneLight: "#b0b5bc",
  stoneSeam: "#757b83",
  stoneSide: "#61676f",
  stoneDark: "#4f545c",
  enemyHead: "#868c95",
  enemyHeadSide: "#6c727b",
  enemyBody: "#70767f",
  enemyBodySide: "#5a6068",
  enemyLimb: "#636972",
  enemyLimbDark: "#565c64",
  blade: "#d3d7dc",
  bladeEdge: "#b3b8bf",
  hilt: "#454a51",
}

function Shape({ points, fill, round = 1.6 }: { points: string; fill: string; round?: number }) {
  return <polygon points={points} fill={fill} stroke={fill} strokeWidth={round} strokeLinejoin="round" />
}

const BRIDGE_TOP = 57
const BRIDGE_BOTTOM = 96
const BRIDGE_HORIZON = 50.3
const bridgeRows = [57, 59.2, 62, 65.6, 70.4, 76.8, 85.4, 96]

function bridgeEdges(y: number) {
  const t = (y - BRIDGE_TOP) / (BRIDGE_BOTTOM - BRIDGE_TOP)
  return { left: 88 + (34 - 88) * t, right: 95 + (82 - 95) * t, depth: (y - BRIDGE_HORIZON) * 1.3 }
}

function Bridge() {
  const far = bridgeEdges(BRIDGE_TOP)
  const near = bridgeEdges(BRIDGE_BOTTOM)
  const segments = bridgeRows.slice(0, -1).map((top, index) => {
    const bottom = bridgeRows[index + 1] - (0.5 + index * 0.25)
    return { top, bottom, a: bridgeEdges(top), b: bridgeEdges(bottom) }
  })

  return (
    <>
      <Shape
        points={`${far.right},${BRIDGE_TOP} ${near.right},${BRIDGE_BOTTOM} ${near.right},${BRIDGE_BOTTOM + near.depth} ${far.right},${BRIDGE_TOP + far.depth}`}
        fill={colors.stoneDark}
        round={1}
      />
      {segments.map(({ top, bottom, a, b }) => (
        <Shape
          key={`side-${top}`}
          points={`${a.right},${top} ${b.right},${bottom} ${b.right},${bottom + b.depth} ${a.right},${top + a.depth}`}
          fill={colors.stoneSide}
          round={0.8}
        />
      ))}
      <Shape
        points={`${far.left},${BRIDGE_TOP} ${far.right},${BRIDGE_TOP} ${near.right},${BRIDGE_BOTTOM} ${near.left},${BRIDGE_BOTTOM}`}
        fill={colors.stoneSeam}
        round={1}
      />
      {segments.map(({ top, bottom, a, b }) => (
        <Shape
          key={`top-${top}`}
          points={`${a.left},${top} ${a.right},${top} ${b.right},${bottom} ${b.left},${bottom}`}
          fill={colors.stone}
          round={0.8}
        />
      ))}
    </>
  )
}

function Enemy() {
  return (
    <>
      <Shape points="0,70 37,70 40.5,73.5 0,73.5" fill={colors.stone} round={1.2} />
      <Shape points="0,73.5 40.5,73.5 40.5,84 0,84" fill={colors.stoneSide} round={1.2} />
      {[13.5, 27].map((x) => (
        <rect key={x} x={x} y="73.5" width="0.6" height="10.5" fill={colors.stoneDark} />
      ))}

      <g transform="translate(0 -1.2)">
      <g transform="translate(-2 0) rotate(18 48 43)">
        <Shape points="46,43 50.5,43 51.5,31 47,31" fill={colors.enemyLimb} round={1} />
        <rect x="47.2" y="10" width="3" height="18" rx="0.8" fill={colors.blade} />
        <rect x="48.7" y="10" width="1.5" height="18" rx="0.6" fill={colors.bladeEdge} />
        <rect x="43.7" y="27.4" width="10" height="2.2" rx="0.8" fill={colors.hilt} />
        <rect x="47.7" y="29.4" width="2" height="2.6" rx="0.5" fill={colors.hilt} />
      </g>

      <Shape points="38,55 44,55 44,65.5 38,65.5" fill={colors.enemyLimbDark} round={1} />
      <Shape points="29.5,56 31,55 31,72.5 29.5,72.5" fill={colors.enemyLimbDark} round={0.8} />
      <Shape points="31,55 38,55 38,72.5 31,72.5" fill={colors.enemyLimb} round={1} />

      <g transform="rotate(16 29.5 43)">
        <Shape points="22.5,43.6 24.5,42.5 24.5,55 22.5,55" fill={colors.enemyLimbDark} round={0.8} />
        <Shape points="24.5,42.5 29.5,42.5 29.5,55 24.5,55" fill={colors.enemyLimb} round={1} />
      </g>

      <Shape points="29.5,43.2 32,42 32,55 29.5,54" fill={colors.enemyBodySide} round={1} />
      <Shape points="32,42 44,42 44,55 32,55" fill={colors.enemyBody} round={1.2} />

      <Shape points="28.5,31 31.5,29.5 31.5,42.5 28.5,41.3" fill={colors.enemyHeadSide} round={1.2} />
      <Shape points="31.5,29.5 44.5,29.5 44.5,42.5 31.5,42.5" fill={colors.enemyHead} round={1.6} />
      </g>
    </>
  )
}

const clouds = [
  [6, 12, 22, 4],
  [12, 9, 10, 4],
  [62, 20, 26, 4],
  [68, 17, 12, 4],
  [124, 12, 20, 4],
]

export function VideoArt({ className = "" }: { className?: string }) {
  const gradientId = `video-art-void-${useId().replace(/[^a-zA-Z0-9]/g, "")}`

  return (
    <svg
      viewBox="0 0 160 90"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={gradientId} cx="68%" cy="42%" r="75%">
          <stop offset="0%" stopColor={colors.voidCenter} />
          <stop offset="100%" stopColor={colors.voidEdge} />
        </radialGradient>
      </defs>
      <rect width="160" height="90" fill={`url(#${gradientId})`} />

      {clouds.map(([x, y, width, height]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} rx={2} fill={colors.cloud} />
      ))}

      <Shape points="9,25 23,25 25,27.5 7,27.5" fill={colors.far} />
      <Shape points="9,27.5 23,27.5 18.5,32 13.5,32" fill={colors.farShade} />
      <Shape points="146,40 154,40 155,41.5 145,41.5" fill={colors.far} />
      <Shape points="146.5,41.5 153.5,41.5 151,45 149,45" fill={colors.farShade} />

      <Shape points="96,40 132,40 138,46 90,46" fill={colors.islandTop} round={2.4} />
      <Shape points="90,46 138,46 138,54 90,54" fill={colors.islandFront} round={2.4} />
      <Shape points="93,54 135,54 135,59 93,59" fill={colors.islandUnder} round={2.4} />
      <Shape points="99,59 129,59 129,63.5 99,63.5" fill={colors.islandTip} round={2.4} />
      <Shape points="106,63.5 122,63.5 122,67 106,67" fill={colors.islandTip} round={2.4} />

      <rect x="124.6" y="32" width="3.2" height="9" rx="0.8" fill={colors.islandFront} />
      <rect x="117" y="25" width="18.4" height="9" rx="2.4" fill={colors.leaves} />
      <rect x="117" y="31" width="18.4" height="3" rx="1.2" fill={colors.leavesShade} />
      <rect x="120.5" y="19.5" width="11.4" height="7" rx="2.2" fill={colors.leaves} />
      <rect x="102" y="35" width="7" height="4" rx="1" fill={colors.chest} />
      <rect x="102" y="38" width="7" height="2.5" rx="0.8" fill={colors.chestFront} />

      <Bridge />
      <Enemy />

      <Shape points="131,75 137,72 150,96 142,96" fill={colors.armShade} round={2.4} />
      <Shape points="137,72 151,69 170,96 150,96" fill={colors.arm} round={3} />
      <Shape points="131,58.5 139.5,55 148,58.5 139.5,62" fill={colors.stoneLight} round={2.2} />
      <Shape points="131,58.5 139.5,62 139.5,71 131,67.5" fill={colors.stoneSide} round={2.2} />
      <Shape points="139.5,62 148,58.5 148,67.5 139.5,71" fill={colors.stone} round={2.2} />
    </svg>
  )
}
