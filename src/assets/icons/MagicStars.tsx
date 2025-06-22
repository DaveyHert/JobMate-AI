import type { SVGProps } from "react";
const SvgMagicStars = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 21 21'
    {...props}
  >
    <path
      stroke='#0E7490'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M3.093 10.957c3.75 0 7.5-3.75 7.5-7.5 0 3.75 3.75 7.5 7.5 7.5-3.75 0-7.5 3.75-7.5 7.5 0-3.75-3.75-7.5-7.5-7.5m-.833 6.25c.694 0 2.083-1.389 2.083-2.083 0 .694 1.39 2.083 2.083 2.083-.694 0-2.083 1.39-2.083 2.084 0-.695-1.39-2.084-2.083-2.084M13.926 5.124c.834 0 2.5-1.667 2.5-2.5 0 .833 1.667 2.5 2.5 2.5-.833 0-2.5 1.666-2.5 2.5 0-.834-1.666-2.5-2.5-2.5'
    />
  </svg>
);
export default SvgMagicStars;
