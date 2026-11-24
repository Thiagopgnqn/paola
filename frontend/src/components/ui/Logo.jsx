import React from 'react';
import BrandLogo from './BrandLogo';

const Logo = ({ variant = 'horizontal', size = 'md', showSubtitle = false, inverted = false, className = '' }) => {
  return (
    <BrandLogo
      variant={variant}
      size={size}
      showSubtitle={showSubtitle}
      inverted={inverted}
      className={className}
    />
  );
};

export default Logo;
