declare module "ogl" {
  export class Renderer {
    constructor(options?: any);
    gl: WebGLRenderingContext;
    setSize(width: number, height: number): void;
    render(args: { scene: any; camera: any }): void;
  }
  export class Camera {
    constructor(gl: WebGLRenderingContext, options?: any);
    position: { set: (x: number, y: number, z: number) => void };
    perspective(options: { aspect: number }): void;
  }
  export class Geometry {
    constructor(gl: WebGLRenderingContext, attributes: Record<string, any>);
  }
  export class Program {
    constructor(gl: WebGLRenderingContext, options: any);
    uniforms: Record<string, any>;
  }
  export class Mesh {
    constructor(gl: WebGLRenderingContext, options: any);
    position: { x: number; y: number };
    rotation: { x: number; y: number; z: number };
  }
}

