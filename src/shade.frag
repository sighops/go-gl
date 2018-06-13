#version 410
uniform float elapsed;
uniform vec2  u_resolution;
out vec4 frag_color;

void main() {
  vec2 coord = gl_FragCoord.xy / u_resolution;

  vec3 color = vec3(0,0,0);
  float opacity = 1.0;
  frag_color = vec4(color, opacity);
}
