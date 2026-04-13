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
  <div className='flex gap-2 border border-gray-200 rounded-lg  bg-white focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent transition-colors'>
    <div className='bg-neutral-01 w-[43px] flex items-center justify-center shrink-0'>
      <div className='w-5 h-5'>{icon}</div>
    </div>
    <input
      type='url'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='flex-1 text-sm px-3 py-3 text-neutral-06 placeholder:text-neutral-04 focus:outline-none bg-transparent'
    />
  </div>
);

export default SocialInput;
