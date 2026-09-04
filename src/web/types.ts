export interface WebRectLike {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface WebElementLike {
  readonly children: ArrayLike<WebElementLike>;
  readonly getBoundingClientRect: () => WebRectLike;
}
