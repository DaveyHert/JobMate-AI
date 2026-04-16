import React from "react";

/** The styled container for groups of settings */
export default function SettingsCard({
  children,
  padding = true,
  divided = false,
}: {
  children: React.ReactNode;
  padding?: boolean;
  divided?: boolean;
}) {
  return (
    <div className='border-brand-border bg-app-foreground overflow-hidden rounded-[12px] border'>
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          {divided && index > 0 && (
            <div className='border-neutral-03 mx-5 border-t border-dashed' />
          )}
          <div className={padding ? "" : ""}>{child}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
