interface RoleIconProps {
  icon?: string;
  className?: string;
}

export const RoleIcon = ({ icon, className = "" }: RoleIconProps) => {
  if (!icon) return <span className={`leading-none ${className}`}>👤</span>;
  if (icon.startsWith('/') || icon.startsWith('http')) {
    return <img src={icon} alt="role icon" className={`object-cover rounded-full ${className}`} />;
  }
  return <span className={`leading-none ${className}`}>{icon}</span>;
};
