const SocialInput = ({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className='focus-within:ring-brand-accent/30 focus-within:border-brand-accent flex gap-2 rounded-lg border border-gray-200 bg-white transition-colors focus-within:ring-2'>
    <div className='bg-neutral-01 flex w-[43px] shrink-0 items-center justify-center'>
      <div className='h-5 w-5'>{icon}</div>
    </div>
    <input
      type='url'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='text-neutral-06 placeholder:text-neutral-04 flex-1 bg-transparent px-3 py-3 text-sm focus:outline-none'
    />
  </div>
);

export default SocialInput;
