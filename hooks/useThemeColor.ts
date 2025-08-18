/**
 * Simple color hook - returns colors from our unified theme
 */

import { Colors } from '@/constants/Styles';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // Return the override color if provided, otherwise return from Colors
  const colorFromProps = props.light; // Use light color as default since we removed dark theme
  
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorName];
  }
}
