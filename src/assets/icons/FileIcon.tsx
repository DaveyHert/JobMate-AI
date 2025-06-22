import type { SVGProps } from "react";
const SvgFileIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 22 22'
    {...props}
  >
    <g stroke='#3BA44F' strokeLinejoin='round' strokeWidth={2}>
      <path
        strokeLinecap='round'
        d='M8.211 12.08h5.164M8.21 15.525h2.582M3.908 4.335v13.77a1.72 1.72 0 0 0 1.721 1.722h10.328a1.72 1.72 0 0 0 1.721-1.721V8.072a1.72 1.72 0 0 0-.518-1.23L13.34 3.103a1.72 1.72 0 0 0-1.203-.49H5.629a1.72 1.72 0 0 0-1.721 1.721'
      />
      <path d='M12.514 2.614v3.442a1.72 1.72 0 0 0 1.722 1.722h3.442' />
    </g>
  </svg>
);
export default SvgFileIcon;
