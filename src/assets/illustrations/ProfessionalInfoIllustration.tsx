import type { SVGProps } from "react";
import { motion } from "framer-motion";

export function ProfessionalInfoIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='436'
      height='220'
      viewBox='0 0 436 220'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g id='professional-info-illustration' clipPath='url(#clip0_1326_3241)'>
        <path
          id='card'
          d='M412.837 1.4375H23.1623C11.1225 1.4375 1.3623 11.735 1.3623 24.4375V205.562C1.3623 218.265 11.1225 228.562 23.1623 228.562H412.837C424.877 228.562 434.637 218.265 434.637 205.562V24.4375C434.637 11.735 424.877 1.4375 412.837 1.4375Z'
          fill='#594AD4'
          fillOpacity={0.8}
          stroke='white'
          strokeOpacity={0.15}
        />

        {/* Twinkling AI Sparkle 2 (Kept as requested, bottom left) */}
        <motion.path
          id='Vector_2'
          d='M106.665 146.966L107.679 150.683L111.396 151.697L107.679 152.711L106.665 156.428L105.651 152.711L101.934 151.697L105.651 150.683L106.665 146.966Z'
          fill='#F5F5F5'
          fillOpacity={0.8}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.3, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ transformOrigin: "106px 151px" }}
        />

        {/* Left Skeleton lines pulsing */}
        <motion.path
          id='lines'
          d='M32.7002 71.875H68.1252M32.7002 89.125H88.5627M32.7002 106.375H54.5002'
          stroke='white'
          strokeOpacity={0.35}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Background Document - Shoots up from inside the briefcase */}
        <motion.g
          id='user-data-form'
          filter='url(#filter0_d_1326_3241)'
          animate={{
            y: [65, 65, -5, 0, 0, 65, 65],
            opacity: [0, 0, 1, 1, 1, 0, 0],
          }}
          transition={{
            duration: 6,
            times: [0, 0.2, 0.3, 0.35, 0.7, 0.8, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path
            id='Vector_3'
            d='M225.003 42.002H128.138C123.043 42.002 118.913 46.3596 118.913 51.735V178.265C118.913 183.64 123.043 187.998 128.138 187.998H225.003C230.098 187.998 234.229 183.64 234.229 178.265V51.735C234.229 46.3596 230.098 42.002 225.003 42.002Z'
            fill='white'
            fillOpacity={0.1}
            stroke='white'
            strokeOpacity={0.3}
          />
          <path
            id='Vector_4'
            d='M147.742 84.5841C154.111 84.5841 159.274 79.1371 159.274 72.4178C159.274 65.6985 154.111 60.2515 147.742 60.2515C141.373 60.2515 136.21 65.6985 136.21 72.4178C136.21 79.1371 141.373 84.5841 147.742 84.5841Z'
            fill='white'
            fillOpacity={0.1}
            stroke='white'
            strokeOpacity={0.3}
          />

          {/* AI Drawing Effect on internal form lines (Synchronized to draw when the document rises) */}
          <motion.path
            id='Vector_5'
            d='M170.805 66.3345H211.166'
            stroke='white'
            strokeOpacity={0.6}
            animate={{ pathLength: [0, 0, 1, 1, 0, 0], opacity: [0, 0, 1, 1, 0, 0] }}
            transition={{
              duration: 6,
              times: [0, 0.35, 0.45, 0.7, 0.75, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            id='Vector_6'
            d='M170.805 78.501H199.634'
            stroke='white'
            strokeOpacity={0.6}
            animate={{ pathLength: [0, 0, 1, 1, 0, 0], opacity: [0, 0, 1, 1, 0, 0] }}
            transition={{
              duration: 6,
              times: [0, 0.4, 0.5, 0.7, 0.75, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            id='Vector_7'
            d='M137.364 102.833H215.778M137.364 117.433H204.247M137.364 132.033H215.778M137.364 146.632H183.49M137.364 161.232H195.022'
            stroke='white'
            strokeOpacity={0.2}
            animate={{ pathLength: [0, 0, 1, 1, 0, 0], opacity: [0, 0, 1, 1, 0, 0] }}
            transition={{
              duration: 6,
              times: [0, 0.45, 0.6, 0.7, 0.75, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* Floating File Icons (LinkedIn data parsing into the open briefcase) */}
        <motion.g
          animate={{
            y: [-20, -20, 22, 32, 32],
            opacity: [0, 0, 1, 0, 0],
            scale: [0.8, 0.8, 1, 0.8, 0.8],
          }}
          transition={{
            duration: 6,
            times: [0, 0.35, 0.45, 0.55, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <rect
            x='239'
            y='74'
            width='14'
            height='18'
            rx='2'
            fill='white'
            fillOpacity='0.25'
            stroke='white'
            strokeOpacity='0.5'
            strokeWidth='0.5'
          />
          <line
            x1='242'
            y1='79'
            x2='249'
            y2='79'
            stroke='white'
            strokeOpacity='0.8'
            strokeWidth='0.5'
            strokeLinecap='round'
          />
          <line
            x1='242'
            y1='83'
            x2='246'
            y2='83'
            stroke='white'
            strokeOpacity='0.8'
            strokeWidth='0.5'
            strokeLinecap='round'
          />
          <line
            x1='242'
            y1='87'
            x2='249'
            y2='87'
            stroke='white'
            strokeOpacity='0.8'
            strokeWidth='0.5'
            strokeLinecap='round'
          />
        </motion.g>

        <motion.g
          animate={{
            y: [-20, -20, 22, 32, 32],
            opacity: [0, 0, 1, 0, 0],
            scale: [0.8, 0.8, 1, 0.8, 0.8],
          }}
          transition={{
            duration: 6,
            times: [0, 0.45, 0.55, 0.65, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <rect
            x='282'
            y='74'
            width='14'
            height='18'
            rx='2'
            fill='white'
            fillOpacity='0.2'
            stroke='white'
            strokeOpacity='0.4'
            strokeWidth='0.5'
          />
          <line
            x1='285'
            y1='79'
            x2='292'
            y2='79'
            stroke='white'
            strokeOpacity='0.6'
            strokeWidth='0.5'
            strokeLinecap='round'
          />
          <line
            x1='285'
            y1='83'
            x2='292'
            y2='83'
            stroke='white'
            strokeOpacity='0.6'
            strokeWidth='0.5'
            strokeLinecap='round'
          />
          <line
            x1='285'
            y1='87'
            x2='289'
            y2='87'
            stroke='white'
            strokeOpacity='0.6'
            strokeWidth='0.5'
            strokeLinecap='round'
          />
        </motion.g>

        {/* Main Briefcase Group - Gentle overall float */}
        <motion.g
          id='briefcase'
          filter='url(#filter1_d_1326_3241)'
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Static Briefcase Body */}
          <path
            id='Vector_9'
            d='M314.95 96.7505H211.166C204.797 96.7505 199.634 102.198 199.634 108.917V175.832C199.634 182.551 204.797 187.998 211.166 187.998H314.95C321.319 187.998 326.481 182.551 326.481 175.832V108.917C326.481 102.198 321.319 96.7505 314.95 96.7505Z'
            fill='white'
            fillOpacity={0.15}
            stroke='white'
            strokeOpacity={0.5}
          />

          {/* Dynamic Briefcase Lid (Pops open after unlocking) */}
          <motion.g
            id='briefcase-lid'
            animate={{ y: [0, 0, 0, -8, -8, 0, 0] }}
            transition={{
              duration: 6,
              times: [0, 0.15, 0.2, 0.25, 0.75, 0.8, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path
              id='Vector_8'
              d='M239.995 96.7509V80.9347C239.995 72.4183 286.121 72.4183 286.121 80.9347V96.7509'
              stroke='white'
              strokeOpacity={0.44}
            />
            <path id='Vector_10' d='M199.634 127.167H326.481' stroke='white' strokeOpacity={0.4} />
            <path
              id='Vector_11'
              d='M271.13 121.083H254.986C253.075 121.083 251.526 122.718 251.526 124.733V129.6C251.526 131.616 253.075 133.25 254.986 133.25H271.13C273.041 133.25 274.589 131.616 274.589 129.6V124.733C274.589 122.718 273.041 121.083 271.13 121.083Z'
              fill='white'
              fillOpacity={0.2}
              stroke='white'
              strokeOpacity={0.4}
            />

            {/* The Lock Latch (Slides right to 'unlock' before the lid pops) */}
            <motion.path
              id='Vector_12'
              d='M263.058 128.991C264.013 128.991 264.788 128.174 264.788 127.166C264.788 126.158 264.013 125.341 263.058 125.341C262.103 125.341 261.328 126.158 261.328 127.166C261.328 128.174 262.103 128.991 263.058 128.991Z'
              fill='white'
              fillOpacity={0.6}
              animate={{ x: [0, 0, 6, 6, 0, 0] }}
              transition={{
                duration: 6,
                times: [0, 0.1, 0.15, 0.7, 0.75, 1],
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.g>
        </motion.g>

        <g id='pagination'>
          <path
            id='Vector_13'
            d='M366.513 199.812C368.018 199.812 369.238 198.525 369.238 196.938C369.238 195.35 368.018 194.062 366.513 194.062C365.008 194.062 363.788 195.35 363.788 196.938C363.788 198.525 365.008 199.812 366.513 199.812Z'
            fill='white'
            fillOpacity={0.2}
          />
          <path
            id='Vector_14'
            d='M391.038 194.062H380.138C378.633 194.062 377.413 195.35 377.413 196.938C377.413 198.525 378.633 199.812 380.138 199.812H391.038C392.543 199.812 393.763 198.525 393.763 196.938C393.763 195.35 392.543 194.062 391.038 194.062Z'
            fill='white'
            fillOpacity={0.6}
          />
          <path
            id='Vector_15'
            d='M404.662 199.812C406.167 199.812 407.387 198.525 407.387 196.938C407.387 195.35 406.167 194.062 404.662 194.062C403.158 194.062 401.938 195.35 401.938 196.938C401.938 198.525 403.158 199.812 404.662 199.812Z'
            fill='white'
            fillOpacity={0.2}
          />
          <path
            id='Vector_16'
            d='M418.287 199.812C419.792 199.812 421.012 198.525 421.012 196.938C421.012 195.35 419.792 194.062 418.287 194.062C416.783 194.062 415.562 195.35 415.562 196.938C415.562 198.525 416.783 199.812 418.287 199.812Z'
            fill='white'
            fillOpacity={0.2}
          />
        </g>
      </g>

      <defs>
        <filter
          id='filter0_d_1326_3241'
          x={115.413}
          y={40.502}
          width={122.315}
          height={152.996}
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
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1326_3241' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_1326_3241'
            result='shape'
          />
        </filter>

        {/* Expanded the Y and Height attributes here so the animating handle doesn't clip outside the drop shadow box! */}
        <filter
          id='filter1_d_1326_3241'
          x={180}
          y={50}
          width={160}
          height={150}
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
          <feGaussianBlur stdDeviation={2.5} />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1326_3241' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_1326_3241'
            result='shape'
          />
        </filter>
        <clipPath id='clip0_1326_3241'>
          <rect width={436} height={230} fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}
