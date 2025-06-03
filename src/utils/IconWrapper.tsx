import React from 'react';
import { IconType } from 'react-icons';
import * as ReactIcons from 'react-icons/md';

interface IconWrapperProps {
  icon: IconType;
  size?: number;
  className?: string;
}

// Safe cast function for IconType
export function castIconType(Icon: IconType): React.FC<any> {
  return Icon as unknown as React.FC<any>;
}

// Helper component that properly wraps IconType
export const IconWrapper: React.FC<IconWrapperProps> = ({ icon, size, className }) => {
  const IconComponent = castIconType(icon);
  return <IconComponent size={size} className={className} />;
};

// Helper function to render an icon directly
export const renderIcon = (Icon: IconType, props: any = {}) => {
  const IconComponent = castIconType(Icon);
  return <IconComponent {...props} />;
}; 