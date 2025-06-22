import type { SVGProps } from "react";
const SvgHomeIcon = (props: SVGProps<SVGSVGElement>) => (
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
      clipPath='url(#home-icon_svg__a)'
    >
      <path d='M12.89 17.583v-6.667a.833.833 0 0 0-.833-.833H8.724a.833.833 0 0 0-.833.833v6.667' />
      <path d='M2.89 8.416a1.67 1.67 0 0 1 .591-1.273l5.834-5a1.67 1.67 0 0 1 2.152 0l5.833 5a1.67 1.67 0 0 1 .59 1.273v7.5a1.667 1.667 0 0 1-1.666 1.667H4.557a1.667 1.667 0 0 1-1.666-1.667z' />
    </g>
    <defs>
      <clipPath id='home-icon_svg__a'>
        <path fill='#fff' d='M.39.083h20v20h-20z' />
      </clipPath>
    </defs>
  </svg>
);
export default SvgHomeIcon;
