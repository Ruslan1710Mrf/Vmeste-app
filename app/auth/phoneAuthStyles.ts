import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  backLink: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 28,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F8FAFC',
  },
  inputError: {
    borderColor: '#F87171',
  },
  hint: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 13,
    color: '#F87171',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#1D4ED8',
    opacity: 0.6,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default styles;
