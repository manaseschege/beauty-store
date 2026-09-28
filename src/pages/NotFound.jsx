import { Link } from 'react-router-dom'
import { Button, Result } from 'antd'
import { useTitle } from '../hooks/useTitle'

export default function NotFound() {
  useTitle('Page not found')
  return (
    <Result
      status="404"
      title="Page not found"
      subTitle="The page you’re looking for has moved or no longer exists."
      extra={<Link to="/shop"><Button type="primary" shape="round" size="large">Browse products</Button></Link>}
    />
  )
}
