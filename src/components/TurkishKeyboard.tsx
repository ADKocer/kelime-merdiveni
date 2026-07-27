import {

  TURKISH_QWERTY_ROWS,

  TURKISH_QWERTY_ROWS_MOBILE,

  TURKISH_ROW_GRID_COLS,

} from "@/lib/turkish-keyboard";

import { toTurkishUpperCase } from "@/lib/word-input";



interface TurkishKeyboardProps {

  onKey: (key: string) => void;

  onBackspace: () => void;

  onEnter: () => void;

  disabled?: boolean;

  canEnter?: boolean;

}



interface KeyboardRowsProps {

  rows: readonly (readonly string[])[];

  gridCols: readonly number[];

  onKey: (key: string) => void;

  disabled: boolean;

  variant: "mobile" | "desktop";

}



const KEY_CLASSES = {

  mobile:

    "flex h-[3.25rem] min-h-[3.25rem] min-w-0 touch-manipulation items-center justify-center rounded-xl border border-ladder-border bg-ladder-bg/90 text-xl font-semibold text-ladder-text transition active:scale-[0.96] active:bg-ladder-border/70 disabled:cursor-not-allowed disabled:opacity-40",

  desktop:

    "flex h-11 min-w-0 touch-manipulation items-center justify-center rounded-lg border border-ladder-border bg-ladder-bg/90 text-base font-medium text-ladder-text transition active:scale-95 active:bg-ladder-border/70 disabled:cursor-not-allowed disabled:opacity-40",

} as const;



function KeyboardRows({

  rows,

  gridCols,

  onKey,

  disabled,

  variant,

}: KeyboardRowsProps) {

  const rowGap = variant === "mobile" ? "gap-2" : "gap-1";

  const keyClass = KEY_CLASSES[variant];



  return (

    <>

      {rows.map((row, rowIndex) => (

        <div

          key={rowIndex}

          className={`grid w-full ${rowGap}`}

          style={{

            gridTemplateColumns: `repeat(${gridCols[rowIndex]}, minmax(0, 1fr))`,

          }}

        >

          {row.map((key) => (

            <button

              key={key}

              type="button"

              disabled={disabled}

              onPointerDown={(event) => event.preventDefault()}

              onClick={() => onKey(key)}

              className={keyClass}

              aria-label={toTurkishUpperCase(key)}

            >

              {toTurkishUpperCase(key)}

            </button>

          ))}

        </div>

      ))}

    </>

  );

}



function ActionRow({

  onBackspace,

  onEnter,

  disabled,

  canEnter,

  variant,

}: Pick<TurkishKeyboardProps, "onBackspace" | "onEnter" | "disabled" | "canEnter"> & {

  variant: "mobile" | "desktop";

}) {

  const heightClass = variant === "mobile" ? "h-[3.25rem] min-h-[3.25rem]" : "h-11";

  const textClass = variant === "mobile" ? "text-base" : "text-sm sm:text-base";

  const gapClass = variant === "mobile" ? "gap-2" : "gap-1.5";



  return (

    <div className={`grid w-full grid-cols-[1fr_2fr] ${gapClass} pt-0.5`}>

      <button

        type="button"

        disabled={disabled}

        onPointerDown={(event) => event.preventDefault()}

        onClick={onBackspace}

        className={`flex ${heightClass} min-w-0 touch-manipulation items-center justify-center rounded-xl border border-ladder-border bg-ladder-bg/90 px-2 ${textClass} font-medium text-ladder-muted transition active:scale-[0.96] active:bg-ladder-border/70 disabled:cursor-not-allowed disabled:opacity-40`}

        aria-label="Sil"

      >

        Sil

      </button>

      <button

        type="button"

        disabled={disabled || !canEnter}

        onPointerDown={(event) => event.preventDefault()}

        onClick={onEnter}

        className={`flex ${heightClass} min-w-0 touch-manipulation items-center justify-center rounded-xl bg-ladder-accent px-3 ${textClass} font-semibold text-white transition active:scale-[0.96] active:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40`}

        aria-label="Kelimeyi ekle"

      >

        Ekle

      </button>

    </div>

  );

}



export function TurkishKeyboard({

  onKey,

  onBackspace,

  onEnter,

  disabled = false,

  canEnter = false,

}: TurkishKeyboardProps) {

  return (

    <div className="w-full max-w-full select-none overflow-hidden" aria-label="Türkçe klavye">

      <div className="space-y-2 sm:hidden">

        <KeyboardRows

          rows={TURKISH_QWERTY_ROWS_MOBILE}

          gridCols={TURKISH_ROW_GRID_COLS.mobile}

          onKey={onKey}

          disabled={disabled}

          variant="mobile"

        />

        <ActionRow

          onBackspace={onBackspace}

          onEnter={onEnter}

          disabled={disabled}

          canEnter={canEnter}

          variant="mobile"

        />

      </div>



      <div className="hidden space-y-1.5 sm:block">

        <KeyboardRows

          rows={TURKISH_QWERTY_ROWS}

          gridCols={TURKISH_ROW_GRID_COLS.desktop}

          onKey={onKey}

          disabled={disabled}

          variant="desktop"

        />

        <ActionRow

          onBackspace={onBackspace}

          onEnter={onEnter}

          disabled={disabled}

          canEnter={canEnter}

          variant="desktop"

        />

      </div>

    </div>

  );

}


