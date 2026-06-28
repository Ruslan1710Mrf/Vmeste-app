import AiNeonGraphic from './AiNeonGraphic';

export default function AiHeaderIcon({ size = 44 }) {
  const variant = size <= 16 ? 'mini' : 'header';

  return (
    <AiNeonGraphic
      size={size}
      variant={variant}
      idPrefix={variant === 'mini' ? 'ai-header-mini' : 'ai-header'}
    />
  );
}
