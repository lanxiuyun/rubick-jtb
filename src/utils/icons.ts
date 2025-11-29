import { defineComponent, h } from "vue";

const createIcon = (d: string) =>
  defineComponent({
    name: "SvgPathIcon",
    render() {
      return h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 512 512",
          width: "1em",
          height: "1em",
        },
        [
          h("path", {
            d,
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "32",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          }),
        ]
      );
    },
  });

const createFilledIcon = (d: string) =>
  defineComponent({
    name: "SvgFilledIcon",
    render() {
      return h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 512 512",
          width: "1em",
          height: "1em",
        },
        [
          h("path", {
            d,
            fill: "currentColor",
          }),
        ]
      );
    },
  });

export const AppsOutline = createIcon(
  "M104 104h56v56h-56zM104 232h56v56h-56zM104 360h56v56h-56zM232 104h56v56h-56zM232 232h56v56h-56zM232 360h56v56h-56zM360 104h56v56h-56zM360 232h56v56h-56zM360 360h56v56h-56z"
);

export const TextOutline = createIcon("M32 416h448M32 96h448M32 256h448");

export const DocumentAttachOutline = createIcon(
  "M208 64h66.75a32 32 0 0122.62 9.37l141.26 141.26a32 32 0 019.37 22.62V448a48 48 0 01-48 48H208a48 48 0 01-48-48V112a48 48 0 0148-48z"
);

export const ImageOutline = createIcon(
  "M432 112V96a48.14 48.14 0 00-48-48H64a48.14 48.14 0 00-48 48v256a48.14 48.14 0 0048 48h16"
);

export const CopyOutline = createIcon(
  "M336 64h-80a64 64 0 00-64 64v256a64 64 0 0064 64h192a64 64 0 0064-64V128a64 64 0 00-64-64h-80z"
);

export const TrashOutline = createIcon(
  "M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
);

export const StarOutline = createIcon(
  "M480 208H308L256 48l-52 160H32l140 96-54 160 138-100 138 100-54-160z"
);

export const StarFilled = createFilledIcon(
  "M394 480a16 16 0 01-9.39-3L256 383.76 127.39 477a16 16 0 01-24.55-18.08L153 310.35 23 221.2a16 16 0 019-29.2h160.38l48.4-148.95a16 16 0 0130.44 0l48.4 149H480a16 16 0 019.05 29.2L359 310.35l50.13 148.53A16 16 0 01394 480z"
);

