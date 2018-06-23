#version 410
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2 u_scale;
out vec4 frag_color;

float random (vec2 st) {
    return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
}

float circle(vec2 coord, vec2 center, float r) {
  return 1.0 - smoothstep(r-random(coord.xy)*.01, r+random(coord.xy)*.01, distance(coord*u_scale, center*u_scale));
}

void main() {
  vec2 coord = gl_FragCoord.xy / u_resolution;
  vec3 colorA = vec3(0.8, 0.2, 0.2);
  vec3 colorB = vec3(0.2, 0.8, 0.2);
  vec3 colorC = vec3(0.2, 0.8, 0.8);

  vec3 c1 = colorA * circle(coord, vec2((0.5+pow(cos(u_time)/10, 1.5)),(0.5+pow(sin(u_time)/10, 2.0))), 0.1);
  vec3 c2 = colorA * circle(coord, vec2((0.5+pow(cos(u_time)/10, 1.55)),(0.5+pow(sin(u_time)/10, 2.1))), 0.075-(abs(sin(u_time))*.01*random(vec2(u_time))));
  vec3 c3 = colorA * circle(coord, vec2((0.5+pow(cos(u_time)/10, 1.5)),(0.7+pow(sin(u_time)/10, 2.0))), 0.1);
  vec3 c4 = colorA * circle(coord, vec2((0.5+pow(cos(u_time)/10, 1.45)),(0.7+pow(sin(u_time)/10, 1.8))), 0.075-(abs(sin(u_time))*.01*random(vec2(u_time))));
  float l = plot(coord, coord.x);
  vec3 color =  (c1 - c2) + (c3 -c4);
  float opacity = 1.0;
  frag_color = vec4(color, opacity);
}

