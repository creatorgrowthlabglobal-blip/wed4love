let cachedTrue = false;

export const isWebGLAvailable = (): boolean => {
  if (cachedTrue) return true;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (gl) {
      cachedTrue = true;
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
