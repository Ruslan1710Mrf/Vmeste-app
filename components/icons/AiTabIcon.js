import AiNeonGraphic from './AiNeonGraphic';

export default function AiTabIcon({ size = 22, active = false, inactiveColor = '#94A3B8' }) {
  return (
    <AiNeonGraphic
      size={size}
      variant={active ? 'tab' : 'tab-inactive'}
      inactiveColor={inactiveColor}
      idPrefix={active ? 'ai-tab-active' : 'ai-tab-inactive'}
    />
  );
}
