import type { SVGProps } from "react";
import { motion } from "framer-motion";

export function PersonalInfoIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='436'
      height='220'
      viewBox='0 0 436 220'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g id='personal-info-illustration' clipPath='url(#clip0_1326_3361)'>
        {/* Main Background Card */}
        <path
          id='card'
          d='M412.838 1.375H23.1625C11.1227 1.375 1.36255 11.2247 1.36255 23.375V196.625C1.36255 208.775 11.1227 218.625 23.1625 218.625H412.838C424.877 218.625 434.638 208.775 434.638 196.625V23.375C434.638 11.2247 424.877 1.375 412.838 1.375Z'
          fill='#594AD4'
          fillOpacity={0.8}
          stroke='white'
          strokeOpacity={0.15}
        />

        {/* Left Skeleton Data - Staggered Pulsing Effect */}
        <g id='skeleton-data'>
          <motion.path
            id='Vector'
            d='M100.825 89.375H47.6876C45.4301 89.375 43.6001 91.2218 43.6001 93.5C43.6001 95.7782 45.4301 97.625 47.6876 97.625H100.825C103.083 97.625 104.913 95.7782 104.913 93.5C104.913 91.2218 103.083 89.375 100.825 89.375Z'
            fill='white'
            animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.path
            id='Vector_2'
            d='M141.7 108.625H47.6876C45.4301 108.625 43.6001 110.472 43.6001 112.75C43.6001 115.028 45.4301 116.875 47.6876 116.875H141.7C143.958 116.875 145.788 115.028 145.788 112.75C145.788 110.472 143.958 108.625 141.7 108.625Z'
            fill='white'
            animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.path
            id='Vector_3'
            d='M80.3876 127.875H47.6876C45.4301 127.875 43.6001 129.722 43.6001 132C43.6001 134.278 45.4301 136.125 47.6876 136.125H80.3876C82.6451 136.125 84.4751 134.278 84.4751 132C84.4751 129.722 82.6451 127.875 80.3876 127.875Z'
            fill='white'
            animate={{ fillOpacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
          <motion.path
            id='Vector_4'
            d='M111.725 127.875H92.65C90.3925 127.875 88.5625 129.722 88.5625 132C88.5625 134.278 90.3925 136.125 92.65 136.125H111.725C113.982 136.125 115.812 134.278 115.812 132C115.812 129.722 113.982 127.875 111.725 127.875Z'
            fill='white'
            animate={{ fillOpacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
          />
        </g>

        {/* Center User Profile - Gentle Floating Effect */}
        <motion.g
          id='user-profile'
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <g id='profile'>
            <g id='Vector_5' filter='url(#filter0_d_1326_3361)'>
              <path
                d='M287.675 48.125H200.475C194.455 48.125 189.575 53.0499 189.575 59.125V160.875C189.575 166.95 194.455 171.875 200.475 171.875H287.675C293.695 171.875 298.575 166.95 298.575 160.875V59.125C298.575 53.0499 293.695 48.125 287.675 48.125Z'
                fill='white'
                fillOpacity={0.06}
                shapeRendering='crispEdges'
              />
              <path
                d='M287.675 48.125H200.475C194.455 48.125 189.575 53.0499 189.575 59.125V160.875C189.575 166.95 194.455 171.875 200.475 171.875H287.675C293.695 171.875 298.575 166.95 298.575 160.875V59.125C298.575 53.0499 293.695 48.125 287.675 48.125Z'
                stroke='white'
                strokeOpacity={0.25}
                shapeRendering='crispEdges'
              />
            </g>
            <g id='user'>
              <path
                id='Vector_6'
                d='M244.075 101.75C253.105 101.75 260.425 94.3627 260.425 85.25C260.425 76.1373 253.105 68.75 244.075 68.75C235.045 68.75 227.725 76.1373 227.725 85.25C227.725 94.3627 235.045 101.75 244.075 101.75Z'
                fill='white'
                fillOpacity={0.1}
                stroke='white'
                strokeOpacity={0.4}
                strokeWidth={1.5}
              />
              <g id='Vector_7'>
                <path
                  d='M216.825 137.5V126.5C216.825 117.388 224.146 110 233.175 110H254.975C264.004 110 271.325 117.388 271.325 126.5V137.5'
                  fill='white'
                  fillOpacity={0.1}
                />
                <path
                  d='M216.825 137.5V126.5C216.825 117.388 224.146 110 233.175 110H254.975C264.004 110 271.325 117.388 271.325 126.5V137.5'
                  stroke='white'
                  strokeOpacity={0.4}
                  strokeWidth={1.5}
                />
              </g>
            </g>

            {/* AI Typing Lines inside the profile */}
            <g id='lines'>
              <motion.path
                id='Vector_8'
                d='M216.825 151.25H271.325'
                stroke='white'
                strokeOpacity={0.8}
                strokeWidth={2}
                strokeLinecap='round'
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.path
                id='Vector_9'
                d='M216.825 162.25H250.887'
                stroke='white'
                strokeOpacity={0.8}
                strokeWidth={2}
                strokeLinecap='round'
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </g>
          </g>

          <g id='shine'>
            {/* Twinkling AI Sparkles */}
            <motion.path
              id='star'
              d='M182.762 103.125L184.125 107.25L188.212 108.625L184.125 110L182.762 114.125L181.4 110L177.312 108.625L181.4 107.25L182.762 103.125Z'
              fill='white'
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "182px 108px" }}
            />
            <motion.path
              id='star-main'
              d='M291.763 41.25L293.806 48.8125L301.3 50.875L293.806 52.9375L291.763 60.5L289.719 52.9375L282.225 50.875L289.719 48.8125L291.763 41.25Z'
              fill='white'
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{ transformOrigin: "291px 50px" }}
            />

            {/* The Magic Autofill Cursor - Glides around the form */}
            <motion.g
              id='cursor'
              filter='url(#filter1_d_1326_3361)'
              animate={{
                x: [0, -45, -45, -10, 0],
                y: [0, -35, 15, 20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d='M261.749 155.813V175.063L265.836 170.938L269.924 180.563L274.011 179.188L269.924 169.563H275.374L261.749 155.813Z'
                fill='white'
              />
            </motion.g>
          </g>
        </motion.g>

        <g id='pagination'>
          <path
            id='Vector_10'
            d='M377.413 185.625H366.513C365.008 185.625 363.788 186.856 363.788 188.375C363.788 189.894 365.008 191.125 366.513 191.125H377.413C378.918 191.125 380.138 189.894 380.138 188.375C380.138 186.856 378.918 185.625 377.413 185.625Z'
            fill='white'
            fillOpacity={0.6}
          />
          <path
            id='Vector_11'
            d='M391.037 191.125C392.542 191.125 393.762 189.894 393.762 188.375C393.762 186.856 392.542 185.625 391.037 185.625C389.533 185.625 388.312 186.856 388.312 188.375C388.312 189.894 389.533 191.125 391.037 191.125Z'
            fill='white'
            fillOpacity={0.2}
          />
          <path
            id='Vector_12'
            d='M404.662 191.125C406.167 191.125 407.387 189.894 407.387 188.375C407.387 186.856 406.167 185.625 404.662 185.625C403.158 185.625 401.938 186.856 401.938 188.375C401.938 189.894 403.158 191.125 404.662 191.125Z'
            fill='white'
            fillOpacity={0.2}
          />
          <path
            id='Vector_13'
            d='M418.287 191.125C419.792 191.125 421.012 189.894 421.012 188.375C421.012 186.856 419.792 185.625 418.287 185.625C416.783 185.625 415.562 186.856 415.562 188.375C415.562 189.894 416.783 191.125 418.287 191.125Z'
            fill='white'
            fillOpacity={0.2}
          />
        </g>
      </g>

      {/* Existing Defs and Filters from your original SVG remain unchanged */}
      <defs>
        <filter
          id='filter0_d_1326_3361'
          x={186.075}
          y={46.625}
          width={116}
          height={130.75}
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity={0} result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy={2} />
          <feGaussianBlur stdDeviation={1.5} />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1326_3361' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_1326_3361'
            result='shape'
          />
        </filter>
        <filter
          id='filter1_d_1326_3361'
          x={257.749}
          y={152.813}
          width={21.625}
          height={32.75}
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity={0} result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy={1} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1326_3361' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_1326_3361'
            result='shape'
          />
        </filter>
        <clipPath id='clip0_1326_3361'>
          <rect width={436} height={220} fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}
