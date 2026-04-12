import type { SVGProps } from "react";
const SvgProfileIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 21 21'
    {...props}
  >
    <path
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M16.796 17.583v-1.667a3.333 3.333 0 0 0-3.333-3.333h-5a3.333 3.333 0 0 0-3.333 3.333v1.667M10.963 9.25a3.333 3.333 0 1 0 0-6.667 3.333 3.333 0 0 0 0 6.666'
    />
  </svg>
);
export default SvgProfileIcon;
