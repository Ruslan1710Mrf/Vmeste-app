import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import {
  CENTER,
  CHIP,
  CORE_DARK,
  CORE_MID,
  getOrbitNodes,
  NEON_BLUE,
  NEON_CYAN,
  NEON_GLOW,
  NEON_LIGHT,
  NEON_WHITE,
} from './aiIconShared';

function OrbitLines({
  nodes,
  color,
  connectRing = true,
  connectCenter = true,
  opacity = 0.4,
  strokeWidth = 0.45,
}) {
  return (
    <G>
      {connectRing
        ? nodes.map((node, index) => {
            const next = nodes[(index + 1) % nodes.length];
            return (
              <Line
                key={`ring-${index}`}
                x1={node.x}
                y1={node.y}
                x2={next.x}
                y2={next.y}
                stroke={color}
                strokeOpacity={opacity}
                strokeWidth={strokeWidth}
              />
            );
          })
        : null}
      {connectCenter
        ? nodes.map((node, index) => (
            <Line
              key={`spoke-${index}`}
              x1={CENTER}
              y1={CENTER}
              x2={node.x}
              y2={node.y}
              stroke={color}
              strokeOpacity={opacity * 0.55}
              strokeWidth={strokeWidth * 0.75}
            />
          ))
        : null}
    </G>
  );
}

function OrbitNodes({ nodes, color, radius = 0.5, opacity = 0.95 }) {
  return (
    <G>
      {nodes.map((node, index) => (
        <Circle
          key={`node-${index}`}
          cx={node.x}
          cy={node.y}
          r={radius}
          fill={color}
          fillOpacity={opacity}
        />
      ))}
    </G>
  );
}

function CoreChip({ color, showChip = true, textSize = 5, muted = false }) {
  const textColor = muted ? color : NEON_WHITE;
  const chipStroke = muted ? color : NEON_LIGHT;

  return (
    <G>
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={6.1}
        fill={muted ? 'none' : CORE_DARK}
        stroke={color}
        strokeWidth={muted ? 1 : 0.65}
        strokeOpacity={muted ? 0.85 : 0.75}
      />
      {showChip ? (
        <Rect
          x={CHIP.x}
          y={CHIP.y}
          width={CHIP.size}
          height={CHIP.size}
          rx={CHIP.rx}
          fill="none"
          stroke={chipStroke}
          strokeWidth={0.55}
          strokeOpacity={muted ? 0.75 : 0.9}
        />
      ) : null}
      <SvgText
        x={CENTER}
        y={13.7}
        textAnchor="middle"
        fontSize={textSize}
        fontWeight="700"
        fill={textColor}
      >
        AI
      </SvgText>
    </G>
  );
}

export default function AiNeonGraphic({
  size = 24,
  variant = 'header',
  inactiveColor = '#94A3B8',
  idPrefix = 'ai-neon',
}) {
  const isMini = variant === 'mini';
  const isTab = variant === 'tab';
  const isInactive = variant === 'tab-inactive';
  const color = isInactive ? inactiveColor : NEON_CYAN;
  const nodeCount = isMini ? 0 : isTab ? 6 : 8;
  const orbitRadius = isTab ? 9.6 : 10.1;
  const nodes = getOrbitNodes(nodeCount, orbitRadius);

  if (isMini) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx={CENTER} cy={CENTER} r={5.2} fill={NEON_CYAN} fillOpacity={0.18} />
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={3.8}
          fill={CORE_DARK}
          stroke={NEON_CYAN}
          strokeWidth={0.55}
          strokeOpacity={0.85}
        />
        <SvgText
          x={CENTER}
          y={13.4}
          textAnchor="middle"
          fontSize="4.2"
          fontWeight="700"
          fill={NEON_WHITE}
        >
          AI
        </SvgText>
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id={`${idPrefix}-glow`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={NEON_CYAN} stopOpacity={0.42} />
          <Stop offset="0.55" stopColor={NEON_BLUE} stopOpacity={0.12} />
          <Stop offset="1" stopColor={NEON_CYAN} stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={`${idPrefix}-core`} x1="7" y1="7" x2="17" y2="17">
          <Stop offset="0" stopColor={CORE_MID} />
          <Stop offset="1" stopColor={CORE_DARK} />
        </LinearGradient>
      </Defs>

      <Circle cx={CENTER} cy={CENTER} r={11.6} fill={`url(#${idPrefix}-glow)`} />

      {!isInactive ? (
        <>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={11}
            fill="none"
            stroke={NEON_GLOW}
            strokeOpacity={0.18}
            strokeWidth={1.1}
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={7.4}
            fill="none"
            stroke={NEON_LIGHT}
            strokeOpacity={0.16}
            strokeWidth={0.5}
          />
        </>
      ) : null}

      <Circle
        cx={CENTER}
        cy={CENTER}
        r={orbitRadius}
        fill="none"
        stroke={color}
        strokeOpacity={isInactive ? 0.55 : 0.38}
        strokeWidth={0.55}
      />

      {!isTab ? (
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={8.4}
          fill="none"
          stroke={color}
          strokeOpacity={isInactive ? 0.25 : 0.22}
          strokeWidth={0.4}
          strokeDasharray="1.2 1.4"
        />
      ) : null}

      <OrbitLines
        nodes={nodes}
        color={color}
        connectRing
        connectCenter={!isTab}
        opacity={isInactive ? 0.28 : isTab ? 0.38 : 0.46}
        strokeWidth={isTab ? 0.4 : 0.48}
      />
      <OrbitNodes
        nodes={nodes}
        color={isInactive ? color : NEON_LIGHT}
        radius={isTab ? 0.42 : 0.52}
      />

      {!isInactive ? (
        <Circle cx={CENTER} cy={CENTER} r={6.35} fill={`url(#${idPrefix}-core)`} />
      ) : null}

      {!isInactive ? (
        <>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={6.7}
            fill="none"
            stroke={NEON_CYAN}
            strokeOpacity={0.55}
            strokeWidth={0.45}
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={7.15}
            fill="none"
            stroke={NEON_GLOW}
            strokeOpacity={0.2}
            strokeWidth={0.9}
          />
        </>
      ) : null}

      <CoreChip
        color={color}
        showChip={!isInactive}
        textSize={isTab ? 4.8 : 5.2}
        muted={isInactive}
      />
    </Svg>
  );
}
