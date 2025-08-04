import { forwardRef } from 'react'
import { BaseButton } from '../base/BaseButton'
import type { BaseButtonProps } from '../../types/components'
import './ImageButton.css'

export interface ImageButtonProps extends BaseButtonProps {
  src: string
  alt: string
  imageSize?: number
  imageClassName?: string
  width?: string | number
  height?: string | number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export const ImageButton = forwardRef<HTMLButtonElement, ImageButtonProps>(
  ({ 
    src, 
    alt, 
    imageSize = 32,
    imageClassName = '',
    width,
    height,
    objectFit = 'contain',
    children,
    className = '',
    variant = 'primary',
    size = 'medium',
    ...props 
  }, ref) => {
    
    const imageElement = (
      <img
        src={src}
        alt={alt}
        width={imageSize}
        height={imageSize}
        style={{
          width: width,
          height: height,
          objectFit: objectFit,
        }}
        className={`image-button__img ${imageClassName}`}
      />
    )
    
    return (
      <BaseButton 
        ref={ref} 
        className={`image-button ${className}`}
        variant={variant}
        size={size}
        {...props}
      >
        {imageElement}
        {children}
      </BaseButton>
    )
  }
)

ImageButton.displayName = 'ImageButton' 