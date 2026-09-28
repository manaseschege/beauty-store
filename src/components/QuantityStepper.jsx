import { Button } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'

export default function QuantityStepper({ value, onChange, min = 1, max = 99, disabled, size = 'middle' }) {
  return (
    <div className="inline-flex items-center rounded-full border border-blush-200 bg-white">
      <Button
        type="text"
        shape="circle"
        size={size}
        icon={<MinusOutlined />}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      />
      <span className="w-8 text-center text-sm tabular-nums">{value}</span>
      <Button
        type="text"
        shape="circle"
        size={size}
        icon={<PlusOutlined />}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      />
    </div>
  )
}
