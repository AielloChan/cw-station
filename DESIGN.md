---
name: CW 小站
description: A tactile metal telegraph station with warm paper and brass controls.
colors:
  desk: "#d9d8d0"
  ink: "#293c37"
  machine: "#394640"
  machine-dark: "#26332e"
  paper: "#f0ead9"
  brass: "#c4a66c"
  light: "#e7e9dc"
  muted: "#b8c3b7"
  current: "#3f6048"
  focus: "#b87e2d"
  error: "#a64935"
typography:
  headline:
    fontFamily: "PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(24px, 3.4vw, 32px)"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "3px"
  nameplate:
    fontFamily: "Barlow, sans-serif"
    fontSize: "25px"
    fontWeight: 600
    letterSpacing: "2px"
  readout:
    fontFamily: "Barlow, sans-serif"
    fontSize: "43px"
    fontWeight: 600
    lineHeight: 1
  telegram:
    fontFamily: "DM Mono, monospace"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.95
    letterSpacing: "1px"
  body:
    fontFamily: "PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "14px"
  label:
    fontFamily: "PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "10px"
    letterSpacing: "1px"
rounded:
  control: "3px"
  button: "4px"
  switch-tray: "6px"
  reference: "8px"
  dialog: "12px"
  machine-mobile: "17px"
  machine: "22px"
spacing:
  small: "8px"
  compact: "12px"
  medium: "16px"
  panel: "24px"
  wide: "28px"
components:
  mode-switch:
    rounded: "{rounded.switch-tray}"
    padding: "4px"
    width: "340px"
  paper:
    textColor: "#3b4a37"
    padding: "25px 30px 0"
  telegraph-key:
    width: "365px"
    height: "154px"
    rounded: "20px"
  sound-toggle:
    backgroundColor: "#1e3024"
    rounded: "12px"
    width: "37px"
    height: "21px"
    padding: "3px"
  sensitivity-range:
    height: "18px"
    width: "100%"
  metal-button:
    backgroundColor: "#d1c7a9"
    textColor: "#293c2c"
    rounded: "{rounded.button}"
    padding: "9px 16px"
  icon-button:
    backgroundColor: "transparent"
    rounded: "50%"
    width: "34px"
    height: "34px"
---

# Design System: CW 小站

## Overview

**Creative North Star: "The Paper-and-Brass Telegraph"**

CW 小站 is a compact, physical-feeling practice instrument: muted olive metal surrounds a warm printed paper strip, with a brass lever and dark rounded knob below it. The user’s committed identity is a retro metal telegraph machine with paper above the tactile key.

Material changes carry the hierarchy. Paper holds language and progress; the metal deck holds reception, timing, and controls. Shadows describe weight, recesses, and mechanical movement. The interface stays quiet enough for repeated practice, with Chinese instructions beside condensed Latin instrument markings and monospaced code.

**Key Characteristics:**
- Olive metal, warm paper, and restrained brass.
- One centered instrument with paper above the tactile key.
- Mechanical depth and immediate press feedback.
- Distinct type roles for instructions, instrument labels, and telegrams.

## Colors

The palette combines muted olive metal, warm stationery, and aged brass. Frontmatter tokens are normative; the source gradients provide material variation rather than additional semantic colors.

### Primary
- **Aged brass** (`brass`): the committed hardware accent, expressed through brighter and darker brass gradients on the lever, range thumb, and timing details.
- **Active olive** (`current`): the current paper character; pale text and a brass underline make its position explicit.

### Neutral
- **Desktop** (`desk`): the surrounding warm gray surface.
- **Olive metal** (`machine`, `machine-dark`): the cabinet and deep recesses; the actual cabinet uses a directional gradient around these tones.
- **Printer paper** (`paper`): the warm message sheet, with darker edge shading.
- **Dark ink** (`ink`): text on the desktop and pale surfaces.
- **Light lettering** (`light`) and **muted lettering** (`muted`): primary and secondary labels on the cabinet.

### State colors
- **Ochre focus** (`focus`): keyboard outline, offset from the control.
- **Brick error** (`error`): a brief current-character mistake pulse, supported by feedback text.

**The Material Rule.** Use paper for the message and metal for the operating controls; preserve their visibly different surfaces.

## Typography

The self-hosted Barlow Condensed Semibold file is registered under the CSS family name `Barlow`. DM Mono Regular is self-hosted for printed telegrams and Morse sequences. PingFang SC and Microsoft YaHei form the system Chinese stack.

The headline is restrained, widely tracked Chinese type. The machine nameplate is condensed and engraved in feel; its large target-character readout is the clearest numeric/Latin focal point below the paper. Telegrams use generous line height for character-by-character progress. Small labels supply instrument density rather than promotional hierarchy.

On narrow screens, the headline becomes 25px, the nameplate 21px, the target readout 38px, and telegram text 17px with 1.9 line height. At 360px and below, telegram text becomes 16px. Paper metadata can be 8px; do not extend that scale to primary instructions.

**The Instrument Type Rule.** Use the condensed face for instrument markings, monospace for telegrams and Morse code, and system Chinese type for instructions.

## Layout

The current operating surface centers a single cabinet with a maximum width of 884px. Desktop cabinet padding is 27px 44px 26px. The header has its own wider 1320px container. The paper is inset within the cabinet, followed by a two-column receiver, centered key, and a bottom controls row.

Phones (up to 767px wide, or short landscape viewports up to 1100px wide) default to a fixed 100dvh console. Safe area insets surround the cabinet. The external header, introduction, and footer disappear; the machine contains its own code table and supported fullscreen controls. Paper takes remaining height while the key and controls stay visible. The receiver and 30-second speed meter share a strip. Labels shorten to 音效、灵敏度、设置; category, author, signal status, and mechanical hints are removed from the compact face, with source and detailed settings available in the settings dialog. Phone heights up to 680px use a smaller key and tighter spacing. Landscape uses paper on the left and instruments/key on the right. Keep the paper above the key in portrait; landscape deliberately changes that relationship to fit the operating scene.

The ordinary desktop retains its centered 884px cabinet and internally scrolling paper (maximum text height 180px). Desktop immersion expands the cabinet up to 1400px and fills available height, preserving exercise state; short desktop windows use a two-column console. Settings and the code table now open in dialogs instead of expanding the page. All console dialogs stay within the visual viewport, including software keyboard changes; long lists and guides scroll internally. Library and guide dialogs have their own larger width limits. The console styles and breakpoints live in src/console.css.

## Elevation & Depth

Depth is structural: inset highlights bevel the cabinet, dark recessed trays hold switches, the roller feeds the paper, and layered shadows lift the key off its base. The page background is a broad radial wash. There is no photographic texture dependency.

The cabinet combines inset edge light with three exterior support shadows; the key uses its own base, pivot, arm, and knob shading. The paper shadow is `0 8px 13px #14291a6b`; dialog elevation is `0 20px 60px #10271a66`. Full cabinet and key shadow values live in the sidecar snippets extracted from the stylesheet.

**The Mechanical Depth Rule.** Use highlights and shadows to explain physical construction and movement.

## Shapes

Cabinet corners are broad and softened, shrinking from the machine radius to the mobile radius at the narrow breakpoint. Controls use much smaller corners. The paper has square top corners, perforation lines, and a five-pixel serrated lower edge. The key’s elliptical base and knob, circular pivot, and narrow metal arm establish its physical silhouette. Dialogs and reference sheets use their own intermediate radii.

## Components

- **Mode switch:** a recessed three-segment navigation tray. The selected `aria-pressed` button has a pale metal gradient, dark lettering, and a slight raised shadow. Hover brightens unselected lettering; transitions run for 150ms.
- **Paper:** warm shaded sheet with a roller, perforated sides, and torn lower edge. Pending text is muted; completed characters fade and strike through; the current character uses a filled olive highlight and brass underline. A mistake briefly pulses brick red over 350ms.
- **Telegraph key:** one semantic button contains decorative base, contact, pivot, arm, and knob. Pressing rotates the arm from −8° to 4° over 80ms and compresses the knob shadow. Keep the interaction tied to actual pressed state, not a looping animation.
- **Sound toggle:** recessed pill with a pale metal thumb. `aria-checked=true` moves the thumb 16px on desktop or 14px on mobile; the transition is 180ms.
- **Tempo range:** dark narrow track and circular brass thumb, paired with a WPM reference output. The main control is labeled 发报节奏 / 节奏 and links recognition cutoff, character pause and playback timing. Advanced independent controls are named 点划分界 and 字间等待, with current millisecond values and explanations. Native range semantics remain available.
- **Secondary actions:** transparent text and circular icon controls keep the instrument face quiet. The pale metal button is reserved for visible free-input editing actions. Hover treatments vary by surface; do not invent new visual priority for them.
- **Focus and reduced motion:** interactive elements receive a three-pixel ochre outline offset by five pixels. Reduced motion cuts animation and transition duration to 0.01ms, disables smooth scrolling, and shows the gap track immediately filled.

Sidecar previews are presentation samples; real press, sound, and decoding behavior belongs to the application. Its static sample key adds an `:active` preview of the implemented `.pressed` state.

## Do's and Don'ts

### Do:
- Do keep the paper above the tactile key in portrait and use the deliberate paper/key split in landscape.
- Do preserve visible keyboard focus and the reduced-motion override.
- Do pair current-character color with progress position, and completed characters with a strike-through.
- Do keep Chinese instructions readable beside the condensed and monospaced instrument typography.

### Don't:
- Don't flatten the lever into a generic rectangular call-to-action; retain its pivot, arm, and knob.
- Don't replace paper and metal with interchangeable cards; their material difference carries the hierarchy.
- Don't make the small signal light the only feedback; retain accompanying text and paper state.
