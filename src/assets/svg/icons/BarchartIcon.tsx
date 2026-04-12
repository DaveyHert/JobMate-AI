import type { SVGProps } from "react";
const SvgBarchartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 21 21'
    {...props}
  >
    <g
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
    >
      <path d='M15.809 16.75V8.415M10.809 16.75V3.415M5.809 16.75v-5' />
    </g>
  </svg>
);
export default SvgBarchartIcon;
