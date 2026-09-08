# @ankhorage/utility

## 0.5.4

### Patch Changes

- 526b9a9: Skip redundant region OCR for containers whose descendants already own text evidence.

## 0.5.3

### Patch Changes

- ba0fdea: Keep screenshot-derived component props limited to observed visual evidence, identity scaffolding, and explicit runtime state defaults.

## 0.5.2

### Patch Changes

- 7b5484f: Preserve OCR-only screenshot copy as grouped visual evidence and recover text from meaningful textless regions with targeted preprocessed OCR.

## 0.5.1

### Patch Changes

- 8e8970d: Reduce screenshot-recognition over-segmentation and require semantic evidence before interactive component matches can cross the configured confidence threshold.

## 0.5.0

### Minor Changes

- f213bb4: Add local UI screenshot analysis that derives canonical Contracts `ScreenSpec` manifests with Sharp/OpenCV geometry, metadata-driven component matching, optional OCR evidence, and pixel-diff verification.

## 0.4.0

### Minor Changes

- ae08eb7: Own reusable JavaScript string/source-literal serialization and safe static named-import validation in the string and validation APIs. Extract the existing Navigator behavior without any Navigator or framework dependency.

## 0.3.0

### Minor Changes

- 9ea3d3d: Add focused functional utility subpaths extracted from Studio, including platform-specific Node,
  Expo, web, and React Native helpers.

## 0.2.0

### Minor Changes

- 05c8cb6: Replace ambiguous regex-like helpers with canonical email, phone, username, and HTTP URL validators.

## 0.1.1

### Patch Changes

- 494c294: Release trigger

## 0.1.0

### Minor Changes

- fccaa12: Add the initial shared utility package with project detection and regex subpaths.
