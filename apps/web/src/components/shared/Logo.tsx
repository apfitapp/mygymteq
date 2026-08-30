import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'size-7',
    md: 'size-8.5',
    lg: 'size-10',
    xl: 'size-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Precision Vector Icon Mark from Favicon */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 shadow-xs transition-transform duration-200 group-hover:scale-105 p-1 overflow-hidden`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="120 120 1280 680"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Neutral Gym Contour */}
          <g className="fill-foreground" fillRule="evenodd">
            <path d="M 149 467 L 142 474 L 139 491 L 141 535 L 143 540 L 150 545 L 174 545 L 171 497 L 175 467 Z" />
            <path d="M 213 413 L 202 421 L 195 436 L 189 458 L 184 502 L 187 549 L 196 583 L 206 598 L 211 600 L 247 600 L 237 546 L 236 485 L 240 450 L 249 413 Z" />
            <path d="M 284 384 L 273 391 L 265 406 L 253 450 L 249 485 L 251 557 L 259 597 L 264 612 L 272 626 L 280 631 L 320 631 L 331 622 L 339 606 L 346 582 L 351 546 L 344 551 L 334 584 L 328 591 L 321 591 L 314 578 L 307 535 L 309 466 L 317 431 L 324 422 L 328 421 L 333 425 L 339 437 L 345 464 L 351 468 L 348 434 L 340 403 L 336 394 L 329 386 L 325 384 Z" />
            <path d="M 934 167 L 645 168 L 619 172 L 588 181 L 562 192 L 539 205 L 509 227 L 483 252 L 453 290 L 429 330 L 416 357 L 401 399 L 392 443 L 390 481 L 388 483 L 347 483 L 343 475 L 336 470 L 330 472 L 326 477 L 321 498 L 321 521 L 326 540 L 331 545 L 338 545 L 343 541 L 347 533 L 393 533 L 399 557 L 415 599 L 432 630 L 456 663 L 477 685 L 504 707 L 531 724 L 561 738 L 591 748 L 620 754 L 677 756 L 707 752 L 738 744 L 766 733 L 790 720 L 829 691 L 829 497 L 572 497 L 637 572 L 740 573 L 740 644 L 738 646 L 709 657 L 677 664 L 643 665 L 616 661 L 586 651 L 550 629 L 527 607 L 503 573 L 486 533 L 479 495 L 479 459 L 487 417 L 495 394 L 508 367 L 530 334 L 560 303 L 588 283 L 627 266 L 664 259 L 866 259 Z" />
          </g>

          {/* Emerald Brand Accent */}
          <g className="fill-primary" fillRule="evenodd">
            <path d="M 1186 480 L 1180 471 L 1172 470 L 1167 474 L 1162 483 L 1096 483 L 1057 532 L 1162 532 L 1167 544 L 1172 548 L 1178 548 L 1186 538 L 1190 518 L 1190 501 Z" />
            <path d="M 1334 467 L 1337 490 L 1337 525 L 1334 545 L 1360 545 L 1367 538 L 1370 525 L 1371 500 L 1368 476 L 1360 467 Z" />
            <path d="M 1261 413 L 1270 454 L 1274 500 L 1271 555 L 1261 600 L 1300 600 L 1307 595 L 1312 586 L 1323 545 L 1325 491 L 1320 454 L 1313 431 L 1304 416 L 1298 413 Z" />
            <path d="M 1188 384 L 1178 391 L 1168 410 L 1160 442 L 1158 470 L 1166 464 L 1170 442 L 1176 428 L 1180 423 L 1186 422 L 1192 429 L 1196 440 L 1203 483 L 1202 545 L 1197 574 L 1190 592 L 1186 596 L 1181 596 L 1177 592 L 1170 576 L 1165 552 L 1157 546 L 1159 567 L 1168 605 L 1174 618 L 1182 628 L 1191 632 L 1227 632 L 1239 623 L 1245 612 L 1257 569 L 1261 535 L 1261 481 L 1258 454 L 1248 412 L 1236 389 L 1228 384 Z" />
            <path d="M 586 456 L 867 457 L 867 781 L 960 674 L 960 457 L 1083 456 L 1160 357 L 670 357 L 657 363 L 648 372 Z" />
            <path d="M 923 245 L 927 251 L 1077 251 L 1081 247 L 1080 242 L 1077 240 L 927 240 Z" />
            <path d="M 1216 249 L 1213 241 L 1207 235 L 1194 232 L 1185 236 L 1178 246 L 1129 246 L 1097 279 L 896 279 L 893 281 L 892 286 L 896 290 L 1102 290 L 1134 257 L 1178 257 L 1187 269 L 1203 271 L 1213 263 Z M 1196 242 L 1202 244 L 1206 250 L 1204 258 L 1200 261 L 1192 260 L 1188 254 L 1189 247 Z" />
            <path d="M 956 204 L 959 211 L 1230 211 L 1259 241 L 1306 241 L 1309 247 L 1319 255 L 1333 254 L 1341 247 L 1344 239 L 1341 225 L 1335 219 L 1328 216 L 1316 218 L 1306 230 L 1264 230 L 1234 200 L 960 200 Z M 1325 226 L 1332 230 L 1334 238 L 1329 244 L 1322 245 L 1318 242 L 1316 234 L 1320 228 Z" />
            <path d="M 1271 167 L 1271 157 L 1268 150 L 1261 143 L 1250 141 L 1240 146 L 1234 156 L 996 156 L 992 161 L 996 167 L 1234 167 L 1242 178 L 1249 181 L 1257 181 L 1263 178 Z M 1251 152 L 1258 154 L 1261 158 L 1260 167 L 1253 171 L 1244 165 L 1245 156 Z" />
          </g>
        </svg>

      </div>

      {/* Typography in Plus Jakarta Sans */}
      {showText && (
        <span className={`font-display font-extrabold tracking-tight text-foreground ${textSizes[size]}`}>
          Gym<span className="text-primary">Tech</span>
        </span>
      )}
    </div>
  );
};
