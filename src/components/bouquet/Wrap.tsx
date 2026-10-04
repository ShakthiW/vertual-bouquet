// Wrapping paper and bow, drawn in the 1000 x 1200 bouquet frame around the
// binding point (500, 930).

export function WrapBack() {
  return (
    <g data-part="wrap-back">
      <path
        className="f-paper-shade"
        d="M500 990 L150 590 Q205 470 290 505 Q340 395 430 440 Q500 360 570 440 Q660 395 710 505 Q795 470 850 590 Z"
      />
      <path
        className="f-paper"
        opacity={0.55}
        d="M500 990 L230 600 Q290 520 360 540 Q420 470 500 500 Q580 470 640 540 Q710 520 770 600 Z"
      />
    </g>
  );
}

export function WrapFront() {
  return (
    <g data-part="wrap-front">
      <path
        className="f-paper-shade"
        d="M786 650 C700 712 588 742 446 738 L474 934 L452 1168 L552 1168 L530 934 Z"
      />
      <path
        className="f-paper"
        d="M214 646 C304 708 424 738 560 728 L528 934 L548 1166 L450 1166 L470 934 Z"
      />
      <path
        className="f-paper-shade"
        opacity={0.35}
        d="M330 700 C400 728 470 736 540 732 L522 900 Z"
      />
    </g>
  );
}

export function Bow() {
  return (
    <g data-part="ribbon">
      <path className="f-ribbon-shade" d="M494 942 C482 990 466 1032 438 1078 L462 1088 C486 1046 502 1002 508 948Z" />
      <path className="f-ribbon-shade" d="M506 942 C520 986 540 1026 572 1068 L550 1080 C520 1040 500 1000 494 948Z" />
      <path className="f-ribbon" d="M500 934 C446 880 384 896 400 942 C414 980 468 966 500 934Z" />
      <path className="f-ribbon" d="M500 934 C556 880 618 896 602 942 C588 980 534 966 500 934Z" />
      <path className="f-ribbon-shade" opacity={0.6} d="M500 934 C470 912 432 910 424 930 C450 924 476 928 500 934Z" />
      <path className="f-ribbon-shade" opacity={0.6} d="M500 934 C530 912 568 910 576 930 C550 924 524 928 500 934Z" />
      <ellipse className="f-ribbon" cx={500} cy={937} rx={17} ry={14} />
      <ellipse className="f-ribbon-shade" cx={500} cy={941} rx={11} ry={6} opacity={0.5} />
    </g>
  );
}
