import React from 'react';

export interface LogoProps {
  /**
   * 'primary' | 'light': Full MINTWORK logo for light backgrounds
   * 'reversed' | 'dark': Full MINTWORK logo for dark backgrounds
   * 'mark': Standalone approved W ribbon symbol
   * 'app-mark': Squircle icon app mark
   */
  variant?: 'primary' | 'reversed' | 'mark' | 'app-mark' | 'light' | 'dark';
  className?: string;
  height?: number | string;
  width?: number | string;
  showText?: boolean;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'primary',
  className = '',
  height,
  width,
  showText = true,
  alt = 'MINTWORK — Make Work Work Smarter',
}) => {
  // If variant is mark only
  if (variant === 'mark') {
    return (
      <img
        src="/assets/mintwork/w_symbol_transparent.png"
        alt={alt}
        className={`inline-block object-contain ${className}`}
        style={{
          height: height || '28px',
          width: width || 'auto',
        }}
        loading="eager"
      />
    );
  }

  // If variant is app mark squircle
  if (variant === 'app-mark') {
    return (
      <img
        src="/assets/mintwork/app_mark_squircle.png"
        alt={alt}
        className={`inline-block object-contain rounded-lg ${className}`}
        style={{
          height: height || '32px',
          width: width || 'auto',
        }}
        loading="eager"
      />
    );
  }

  // Dark background reversed logo
  if (variant === 'reversed' || variant === 'dark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/assets/mintwork/mintwork_logo_reversed.png"
          alt={alt}
          className="inline-block object-contain"
          style={{
            height: height || '28px',
            width: width || 'auto',
          }}
          loading="eager"
        />
      </div>
    );
  }

  // Primary light background logo
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/assets/mintwork/mintwork_logo_primary_transparent.png"
        alt={alt}
        className="inline-block object-contain"
        style={{
          height: height || '28px',
          width: width || 'auto',
        }}
        loading="eager"
      />
    </div>
  );
};

export default Logo;
