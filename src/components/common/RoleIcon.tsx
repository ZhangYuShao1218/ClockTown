interface RoleIconProps {
  icon?: string;
  className?: string;
}

export const RoleIcon = ({ icon, className = "" }: RoleIconProps) => {
  const isEmoji = !icon?.startsWith('/') && !icon?.startsWith('http');
  const spanClass = `flex items-center justify-center text-[3rem] leading-none ${className}`;

  if (!icon) return <span className={spanClass}>👤</span>;
  if (isEmoji) {
    return <span className={spanClass}>{icon}</span>;
  }
  return <img src={icon} alt="role icon" className={`object-cover rounded-full ${className}`} />;
};
