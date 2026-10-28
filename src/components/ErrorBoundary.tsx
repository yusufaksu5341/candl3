import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { t } from '../i18n'

type Props = { children: ReactNode; fallback?: 'widget' | 'app' }

/** Keeps one broken widget (or a bad saved design) from blanking the whole page. */
export default class ErrorBoundary extends Component<Props, { error?: Error }> {
  state: { error?: Error } = {}

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback === 'app') {
      return (
        <div className="crash">
          <p>{t('error.app')}</p>
          <button className="btn" onClick={() => location.reload()}>{t('error.reload')}</button>
        </div>
      )
    }
    return (
      <div className="center-col muted small">
        <p>{t('error.widget')}</p>
        <button className="btn" onClick={() => this.setState({ error: undefined })}>{t('error.retry')}</button>
      </div>
    )
  }
}
