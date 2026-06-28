import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  passwordWrapError: {
    borderColor: '#EF4444',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  passwordToggle: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  passwordToggleIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: -8,
  },
  helperText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  successText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '500',
  },
  linkPressed: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.6,
  },
  phoneButton: {
    color: '#2563EB',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  googleButtonPressed: {
    backgroundColor: '#F8FAFC',
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  backLink: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
  },
});

export default styles;
