/**
 * Branded loading state — the TradePartna blade mark. Two purple blades rise in
 * a staggered loop.
 */
export function AppLoader({
  label = "Loading",
  fullScreen = true,
}: {
  label?: string;
  /** When false, fills its parent container instead of covering the viewport. */
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-bg-primary font-sans"
          : "relative flex min-h-[50vh] w-full flex-col items-center justify-center gap-5 font-sans"
      }
    >
      <BladeMark />
      <span className="tp-loader-label text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
        {label}
      </span>
    </div>
  );
}

/** The TradePartna blade mark — two blades that rise in a staggered loop. */
function BladeMark() {
  return (
    <svg
      viewBox="0 0 1306 1092"
      className="h-20 w-24"
      role="img"
      aria-label="TradePartna"
    >
      <path
        className="tp-blade tp-blade-b"
        d="M499.767 353.288L927.552 353.293C948.212 353.293 964.96 370.041 964.96 390.701C964.96 396.153 963.793 401.335 961.694 406.007C960.274 409.17 958.43 412.099 956.228 414.723L570.771 1029.3L566.984 1035.34C564.346 1040.56 562.86 1046.46 562.86 1052.72C562.86 1074.04 580.143 1091.32 601.463 1091.32H1266.62C1287.94 1091.32 1305.22 1074.04 1305.22 1052.72C1305.22 1050.09 1304.96 1047.53 1304.46 1045.05L1301.63 1036.43C1297.76 1024.64 1293.88 1012.85 1290.01 1001.06C1286.54 990.512 1283.08 979.963 1279.61 969.417C1267.38 932.188 1255.15 894.961 1242.92 857.732C1218.45 783.276 1193.99 708.82 1169.53 634.364C1157.3 597.137 1145.06 559.908 1132.83 522.681C1129.37 512.132 1125.9 501.586 1122.44 491.037C1118.77 479.866 1115.1 468.698 1111.43 457.53C1107.35 445.121 1103.28 432.712 1099.2 420.303C1093.65 403.424 1088.16 386.804 1082.36 370.005C1075.23 349.357 1084.52 341.583 1094.85 325.089C1149.26 238.263 1203.67 151.442 1258.07 64.6183L1264.35 54.6063C1266.41 49.8537 1267.55 44.608 1267.55 39.0985C1267.55 17.5056 1250.04 0 1228.45 0H674.32C662.512 0 651.943 5.30076 644.864 13.6498L638.999 23.0059L469.022 294.198L466.666 297.955C463.755 303.279 462.099 309.387 462.099 315.88C462.099 336.455 478.706 353.151 499.246 353.288H499.507H499.767Z"
      />
      <path
        className="tp-blade tp-blade-a"
        d="M723.683 459.744H711.251H386.345H385.971H385.597C373.943 459.854 363.525 465.129 356.52 473.384L350.648 482.747L182.827 750.324L176.42 760.54L8.49589 1028.28L3.7548 1035.83C1.3487 1040.89 0 1046.54 0 1052.51C0 1073.94 17.3748 1091.32 38.8095 1091.32H370.294C381.283 1091.32 391.166 1086.58 398.013 1079.03L578.659 791.008L746.751 523.004L752.893 513.208C754.937 508.501 756.07 503.308 756.07 497.849C756.07 478.644 742.046 462.716 723.683 459.744Z"
      />
    </svg>
  );
}
