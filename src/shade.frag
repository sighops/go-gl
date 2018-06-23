#version 410
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2 u_scale;
out vec4 frag_color;

float circle(vec2 coord, vec2 center, float r) {
  return 1.0 - smoothstep(r, r, distance(coord*u_scale, center*u_scale));
}

void main() {
  vec2 coord = gl_FragCoord.xy / u_resolution;
  vec3 colorA = vec3(0.8, 0.2, 0.2);
  vec3 colorB = vec3(0.2, 0.8, 0.2);
  vec3 colorC = vec3(0.2, 0.8, 0.8);

  vec3 c1 = colorA * circle(coord, vec2(0.5,0.5), 0.1);
  vec3 color =  c1;
  float opacity = 1.0;
  frag_color = vec4(color, opacity);
}
