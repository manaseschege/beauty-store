import { Button, Result } from 'antd'

export default function ErrorState({ error, onRetry }) {
  return (
    <Result
      status="warning"
      title="We couldn’t load the store"
      subTitle={error?.message ?? 'Please try again in a moment.'}
      extra={onRetry && <Button onClick={onRetry}>Try again</Button>}
    />
  )
}
