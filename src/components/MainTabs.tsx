interface MainTabsProps {
  children: React.ReactNode;
}

export function MainTabs({ children }: MainTabsProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}